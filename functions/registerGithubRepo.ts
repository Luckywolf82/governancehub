import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { getInstallationAccessToken, isGithubAppConfigured } from './_shared/githubAppAuth.ts';

/**
 * registerGithubRepo
 *
 * Register an existing GitHub repository into GovernanceHub's Repository registry.
 * Verifies the repo exists on GitHub and stores metadata, including GitHub App
 * installation data when available.
 *
 * Payload:
 * {
 *   owner: string,
 *   repo: string,
 *   installationId?: number | string,   // from listGithubRepos discovery
 *   notes?: string,
 *   capabilities?: {
 *     "contents:read"?: boolean,
 *     "issue:create"?: boolean,
 *     "repo:create"?: boolean,
 *     "dispatch:audit"?: boolean,
 *     "contents:write"?: boolean
 *   }
 * }
 *
 * Returns:
 * {
 *   success: true,
 *   repository: {
 *     id,
 *     owner,
 *     repo,
 *     fullName,
 *     isEnabled,
 *     capabilities,
 *     githubCanWrite,
 *     githubInstallationId
 *   }
 * }
 */

const DEFAULT_CAPABILITIES = {
  'contents:read': true,
  'issue:create': true,
  'repo:create': false,
  'dispatch:audit': true,
  'contents:write': false,
};

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);

    // Auth: require logged-in admin
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Parse payload
    let payload;
    try {
      payload = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { owner, repo, installationId, notes, capabilities } = payload;

    // Validate
    if (!owner || typeof owner !== 'string' || owner.trim() === '') {
      return Response.json({ error: 'owner must be a non-empty string' }, { status: 400 });
    }
    if (!repo || typeof repo !== 'string' || repo.trim() === '') {
      return Response.json({ error: 'repo must be a non-empty string' }, { status: 400 });
    }

    // Resolve access token:
    //   1. If installationId provided → use GitHub App installation token
    //   2. Else if GitHub App env vars configured → fetch token for any matching installation
    //   3. Else → fall back to legacy connector
    let accessToken: string;
    const resolvedInstallationId: number | null = installationId ? Number(installationId) : null;

    if (resolvedInstallationId && isGithubAppConfigured()) {
      // GitHub App: use provided installationId
      try {
        accessToken = await getInstallationAccessToken(resolvedInstallationId);
      } catch (appErr) {
        return Response.json({
          error: 'github_not_connected',
          message: `Failed to get GitHub App installation token: ${(appErr as Error).message}`,
        }, { status: 503 });
      }
    } else {
      // Legacy connector fallback
      try {
        const conn = await base44.asServiceRole.connectors.getConnection('github');
        accessToken = conn.accessToken;
      } catch {
        return Response.json({
          error: 'github_not_connected',
          message: 'No installationId provided and GitHub connector is not authorized.',
        }, { status: 503 });
      }
    }

    // Verify repo exists on GitHub
    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!ghRes.ok) {
      const ghErr = await ghRes.json().catch(() => ({}));
      return Response.json({
        error: 'github_repo_not_found',
        message: ghErr.message ?? 'Repository not found on GitHub',
      }, { status: 404 });
    }

    const ghRepo = await ghRes.json();
    const fullName = `${owner}/${repo}`;

    // Derive contents:write from real GitHub push permission.
    // Admin can still override via the capabilities payload.
    const githubCanWrite = ghRepo.permissions?.push === true;

    // Merge capabilities: defaults → github-derived → admin-supplied overrides
    const mergedCapabilities = {
      ...DEFAULT_CAPABILITIES,
      'contents:write': githubCanWrite,
      ...(capabilities || {}),
    };

    // Check if already registered
    const existing = await base44.asServiceRole.entities.Repository.filter({
      fullName,
      provider: 'github',
    });

    let result;
    if (existing.length > 0) {
      // Update existing
      const existingRepo = existing[0];
      result = await base44.asServiceRole.entities.Repository.update(existingRepo.id, {
        owner,
        repo,
        fullName,
        visibility: ghRepo.private ? 'private' : 'public',
        defaultBranch: ghRepo.default_branch,
        isArchived: ghRepo.archived,
        isEnabled: true,
        capabilitiesJson: mergedCapabilities,
        githubInstallationId: resolvedInstallationId !== null
          ? resolvedInstallationId
          : (existingRepo.githubInstallationId ?? null),
        githubCanWrite,
        notes: notes || existingRepo.notes,
        lastVerifiedAt: new Date().toISOString(),
      });
    } else {
      // Create new
      result = await base44.asServiceRole.entities.Repository.create({
        provider: 'github',
        owner,
        repo,
        fullName,
        visibility: ghRepo.private ? 'private' : 'public',
        defaultBranch: ghRepo.default_branch,
        isArchived: ghRepo.archived,
        isEnabled: true,
        capabilitiesJson: mergedCapabilities,
        githubInstallationId: resolvedInstallationId ?? null,
        githubCanWrite,
        notes: notes || null,
        lastVerifiedAt: new Date().toISOString(),
      });
    }

    // Log action
    await base44.asServiceRole.entities.RepoActionLog.create({
      repositoryFullName: fullName,
      repositoryId: result.id,
      actorUserId: user.id,
      actionType: 'repository.register',
      status: 'success',
      requestJson: { owner, repo, installationId: resolvedInstallationId, notes: notes || null },
      responseJson: {
        id: result.id,
        fullName,
        isEnabled: result.isEnabled,
        githubCanWrite,
        githubInstallationId: resolvedInstallationId,
      },
      githubUrl: ghRepo.html_url,
      errorMessage: null,
    });

    return Response.json({
      success: true,
      repository: {
        id: result.id,
        owner: result.owner,
        repo: result.repo,
        fullName: result.fullName,
        isEnabled: result.isEnabled,
        capabilities: result.capabilitiesJson,
        githubCanWrite,
        githubInstallationId: resolvedInstallationId,
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
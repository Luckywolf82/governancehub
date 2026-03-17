import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * createGithubRepo
 * 
 * Create a new GitHub repository under the authenticated user's account.
 * Admin-only operation, optionally register the created repo in GovernanceHub.
 * 
 * Payload:
 * {
 *   name: string,
 *   description?: string,
 *   private?: boolean,
 *   auto_init?: boolean,
 *   notes?: string,
 *   registerAfterCreate?: boolean
 * }
 * 
 * Returns:
 * {
 *   success: true,
 *   repository: {
 *     owner,
 *     repo,
 *     fullName,
 *     html_url
 *   },
 *   registered: true|false
 * }
 */

const DEFAULT_CAPABILITIES = {
  'contents:read': true,
  'contents:write': false,
  'issue:create': true,
  'repo:create': false,
  'dispatch:audit': true,
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

    // Check if repo creation is enabled
    const enableCreate = Deno.env.get('ENABLE_GITHUB_REPO_CREATE') === 'true';
    if (!enableCreate) {
      return Response.json({
        error: 'Repository creation is not enabled',
        message: 'Set ENABLE_GITHUB_REPO_CREATE=true to enable this feature',
      }, { status: 403 });
    }

    // Parse payload
    let payload;
    try {
      payload = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { name, description, private: isPrivate, auto_init, notes, registerAfterCreate } = payload;

    // Validate name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return Response.json({ error: 'name must be a non-empty string' }, { status: 400 });
    }

    // GitHub connector
    let accessToken;
    try {
      const conn = await base44.asServiceRole.connectors.getConnection('github');
      accessToken = conn.accessToken;
    } catch {
      return Response.json({
        error: 'github_not_connected',
        message: 'GitHub connector is not authorized.',
      }, { status: 503 });
    }

    // Create repo via GitHub REST API
    const createPayload = {
      name: name.trim(),
      auto_init: auto_init === true,
    };

    if (description) {
      createPayload.description = description;
    }

    if (isPrivate !== undefined) {
      createPayload.private = isPrivate === true;
    }

    const ghRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify(createPayload),
    });

    const ghData = await ghRes.json();

    if (!ghRes.ok) {
      await base44.asServiceRole.entities.RepoActionLog.create({
        repositoryFullName: name,
        repositoryId: null,
        actorUserId: user.id,
        actionType: 'github.repo.create',
        status: 'failure',
        requestJson: createPayload,
        responseJson: { status: ghRes.status, message: ghData.message },
        githubUrl: null,
        errorMessage: ghData.message ?? 'Failed to create repository',
      });

      return Response.json({
        error: 'github_api_error',
        message: ghData.message ?? 'Failed to create repository',
      }, { status: ghRes.status });
    }

    const owner = ghData.owner.login;
    const repo = ghData.name;
    const fullName = `${owner}/${repo}`;

    let registered = false;
    let registryId = null;

    // Optionally register in GovernanceHub
    if (registerAfterCreate === true) {
      try {
        const regResult = await base44.asServiceRole.entities.Repository.create({
          provider: 'github',
          owner,
          repo,
          fullName,
          visibility: ghData.private ? 'private' : 'public',
          defaultBranch: ghData.default_branch,
          isArchived: ghData.archived,
          isEnabled: true,
          capabilitiesJson: DEFAULT_CAPABILITIES,
          notes: notes || null,
          lastVerifiedAt: new Date().toISOString(),
        });
        registered = true;
        registryId = regResult.id;
      } catch (regError) {
        // Log registration failure but don't fail the whole operation
        console.error('Failed to register repository in GovernanceHub:', regError.message);
      }
    }

    // Log action
    await base44.asServiceRole.entities.RepoActionLog.create({
      repositoryFullName: fullName,
      repositoryId: registryId,
      actorUserId: user.id,
      actionType: 'github.repo.create',
      status: 'success',
      requestJson: createPayload,
      responseJson: { owner, repo, registered },
      githubUrl: ghData.html_url,
      errorMessage: null,
    });

    return Response.json({
      success: true,
      repository: {
        owner,
        repo,
        fullName,
        html_url: ghData.html_url,
      },
      registered,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
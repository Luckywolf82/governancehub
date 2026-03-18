import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { getInstallationAccessToken } from './_shared/githubAppAuth.ts';

// ---------------------------------------------------------------------------
// README merge helpers
// ---------------------------------------------------------------------------

const GOVERNANCE_SECTION_START = '<!-- GOVERNANCE:START -->';
const GOVERNANCE_SECTION_END = '<!-- GOVERNANCE:END -->';

/**
 * Insert or replace the bounded governance section inside an existing README.
 * The `governanceSection` string must already include the START/END comment markers.
 * All content outside those markers is preserved exactly.
 */
function mergeGovernanceSectionIntoReadme(existingContent: string, governanceSection: string): string {
  const startIdx = existingContent.indexOf(GOVERNANCE_SECTION_START);
  const endIdx = existingContent.indexOf(GOVERNANCE_SECTION_END);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    // Replace the existing governance section in-place, preserving everything else.
    return (
      existingContent.slice(0, startIdx) +
      governanceSection +
      existingContent.slice(endIdx + GOVERNANCE_SECTION_END.length)
    );
  }

  // No existing section — append at the end without touching existing content.
  return `${existingContent.trimEnd()}\n\n${governanceSection}\n`;
}

/**
 * pushFilesToGithub
 *
 * Write one or more files to a registered GitHub repository using the
 * GitHub Contents API (PUT /repos/{owner}/{repo}/contents/{path}).
 * Each file is created or updated atomically. Files that already exist
 * require the current blob SHA to be supplied (fetched automatically).
 *
 * Admin-only. Requires the repository to be registered, enabled, and
 * have the `contents:write` capability enabled.
 *
 * Payload:
 * {
 *   owner:   string,
 *   repo:    string,
 *   branch:  string,
 *   message: string,           // commit message
 *   files: [
 *     {
 *       path:    string,        // repo-relative file path
 *       content: string,        // UTF-8 text content (will be base64-encoded)
 *       source:  "starter-kit" | "manifest" | "readme"
 *     },
 *     ...
 *   ]
 * }
 *
 * Returns:
 * {
 *   success: true,
 *   pushed: [{ path, sha, html_url }],
 *   skipped: [],
 *   errors: []
 * }
 */

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
    let payload: {
      owner: string;
      repo: string;
      branch: string;
      message: string;
      files: Array<{ path: string; content: string; source: string }>;
    };
    try {
      payload = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { owner, repo, branch, message, files } = payload;

    // Validate required fields
    if (!owner || typeof owner !== 'string' || owner.trim() === '') {
      return Response.json({ error: 'owner must be a non-empty string' }, { status: 400 });
    }
    if (!repo || typeof repo !== 'string' || repo.trim() === '') {
      return Response.json({ error: 'repo must be a non-empty string' }, { status: 400 });
    }
    if (!branch || typeof branch !== 'string' || branch.trim() === '') {
      return Response.json({ error: 'branch must be a non-empty string' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return Response.json({ error: 'message must be a non-empty string' }, { status: 400 });
    }
    if (!Array.isArray(files) || files.length === 0) {
      return Response.json({ error: 'files must be a non-empty array' }, { status: 400 });
    }

    // Validate every file has explicit (non-placeholder) content
    for (const f of files) {
      if (!f.path || typeof f.path !== 'string' || f.path.trim() === '') {
        return Response.json({ error: `Each file must have a non-empty path` }, { status: 400 });
      }
      if (typeof f.content !== 'string' || f.content.trim() === '') {
        return Response.json({
          error: `File "${f.path}" has empty content — only explicit content may be pushed`,
        }, { status: 400 });
      }
      if (!['starter-kit', 'manifest', 'readme'].includes(f.source)) {
        return Response.json({
          error: `File "${f.path}" has an unrecognised source "${f.source}" — must be "starter-kit", "manifest", or "readme"`,
        }, { status: 400 });
      }
    }

    const repoKey = `${owner}/${repo}`;

    // Look up repository in registry
    const registeredRepos = await base44.asServiceRole.entities.Repository.filter({
      fullName: repoKey,
      provider: 'github',
    });

    if (registeredRepos.length === 0) {
      await base44.asServiceRole.entities.RepoActionLog.create({
        repositoryFullName: repoKey,
        repositoryId: null,
        actorUserId: user.id,
        actionType: 'github.contents.push',
        status: 'failure',
        requestJson: { owner, repo, branch, fileCount: files.length },
        responseJson: { reason: 'repository_not_registered' },
        githubUrl: null,
        errorMessage: 'Repository not found in registry',
      });
      return Response.json({ error: 'Repository not registered' }, { status: 403 });
    }

    const repository = registeredRepos[0];

    if (!repository.isEnabled) {
      await base44.asServiceRole.entities.RepoActionLog.create({
        repositoryFullName: repoKey,
        repositoryId: repository.id,
        actorUserId: user.id,
        actionType: 'github.contents.push',
        status: 'failure',
        requestJson: { owner, repo, branch, fileCount: files.length },
        responseJson: { reason: 'repository_disabled' },
        githubUrl: null,
        errorMessage: 'Repository is disabled',
      });
      return Response.json({ error: 'Repository is disabled' }, { status: 403 });
    }

    // Check capability: contents:write
    const capabilities = repository.capabilitiesJson || {};
    if (!capabilities['contents:write']) {
      await base44.asServiceRole.entities.RepoActionLog.create({
        repositoryFullName: repoKey,
        repositoryId: repository.id,
        actorUserId: user.id,
        actionType: 'github.contents.push',
        status: 'failure',
        requestJson: { owner, repo, branch, fileCount: files.length },
        responseJson: { reason: 'capability_denied' },
        githubUrl: null,
        errorMessage: 'contents:write capability not enabled',
      });
      return Response.json({ error: 'contents:write capability not enabled for this repository' }, { status: 403 });
    }

    // Note: githubCanWrite is a registration-time snapshot and may be stale.
    // It is treated as a hint only — the actual GitHub API write result is the
    // final authority.  A stale false value must not block a valid push attempt.

    // Resolve access token:
    //   1. If repository has a stored installationId → use GitHub App installation token
    //   2. Else → fall back to legacy connector (for pre-App registrations)
    let accessToken: string;
    if (repository.githubInstallationId) {
      try {
        accessToken = await getInstallationAccessToken(repository.githubInstallationId);
      } catch (appErr) {
        return Response.json({
          error: 'github_not_connected',
          message: `Failed to get GitHub App installation token: ${(appErr as Error).message}`,
        }, { status: 503 });
      }
    } else {
      try {
        const conn = await base44.asServiceRole.connectors.getConnection('github');
        accessToken = conn.accessToken;
      } catch {
        return Response.json({
          error: 'github_not_connected',
          message: 'Repository has no installation ID and the GitHub connector is not authorized.',
        }, { status: 503 });
      }
    }

    const pushed: Array<{ path: string; sha: string; html_url: string }> = [];
    const errors: Array<{ path: string; error: string }> = [];

    const ghHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    for (const file of files) {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`;

      // Check if file already exists on the target branch (need its SHA for update).
      // For 'readme' source type we also capture the existing content for merging.
      let existingSha: string | undefined;
      let existingContentB64: string | undefined;
      try {
        const existRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, {
          method: 'GET',
          headers: ghHeaders,
        });
        if (existRes.ok) {
          const existData = await existRes.json();
          existingSha = existData.sha;
          if (file.source === 'readme') {
            existingContentB64 = existData.content; // base64-encoded, may contain newlines
          }
        }
        // 404 = file does not exist yet on this branch, that's fine
      } catch {
        // Network error reading existing file — proceed without SHA (will fail on update)
      }

      // Determine final text content to push.
      // For 'readme' source: file.content is the governance section (with START/END markers).
      // Merge it into the existing README (server-side, authenticated), or generate a template.
      let finalContent: string;
      if (file.source === 'readme') {
        if (existingContentB64) {
          // Decode existing README and merge governance section into it.
          const existingText = atob(existingContentB64.replace(/\n/g, ''));
          finalContent = mergeGovernanceSectionIntoReadme(existingText, file.content);
        } else {
          // No existing README — generate a minimal template.
          finalContent = `# ${repo}\n\n> Repository: \`${owner}/${repo}\`\n\n## Overview\n\n<!-- Add your project description here -->\n\n${file.content}\n`;
        }
      } else {
        finalContent = file.content;
      }

      // Encode content as base64 using a chunk-safe approach.
      // 0x8000 (32 768) bytes per chunk avoids call-stack overflow in
      // String.fromCharCode spread for large governance files.
      const encoder = new TextEncoder();
      const bytes = encoder.encode(finalContent);
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      const base64Content = btoa(binary);

      const putBody: Record<string, unknown> = {
        message,
        content: base64Content,
        branch,
      };
      if (existingSha) {
        putBody.sha = existingSha;
      }

      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: ghHeaders,
        body: JSON.stringify(putBody),
      });

      const putData = await putRes.json();

      if (!putRes.ok) {
        errors.push({ path: file.path, error: putData.message ?? `HTTP ${putRes.status}` });
      } else {
        pushed.push({
          path: file.path,
          sha: putData.content?.sha ?? '',
          html_url: putData.content?.html_url ?? `https://github.com/${owner}/${repo}/blob/${branch}/${file.path}`,
        });
      }
    }

    const overallStatus = errors.length === 0 ? 'success' : pushed.length > 0 ? 'partial' : 'failure';

    // Log the action
    await base44.asServiceRole.entities.RepoActionLog.create({
      repositoryFullName: repoKey,
      repositoryId: repository.id,
      actorUserId: user.id,
      actionType: 'github.contents.push',
      status: overallStatus,
      requestJson: { owner, repo, branch, message, fileCount: files.length },
      responseJson: { pushed: pushed.length, errors: errors.length },
      githubUrl: `https://github.com/${owner}/${repo}/tree/${branch}`,
      errorMessage: errors.length > 0 ? `${errors.length} file(s) failed` : null,
    });

    return Response.json({
      success: errors.length === 0,
      status: overallStatus,
      pushed,
      skipped: [],
      errors,
    });

  } catch (error) {
    const msg = (error instanceof Error ? error.message : String(error)) || 'Internal server error';
    return Response.json({ error: msg }, { status: 500 });
  }
});

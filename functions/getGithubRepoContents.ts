import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * getGithubRepoContents
 * 
 * Fetch file/directory contents from a registered GitHub repository.
 * Foundation for governance file inspection and repo verification.
 * 
 * Payload:
 * {
 *   owner: string,
 *   repo: string,
 *   path?: string (default: root, e.g., "README.md" or "src/components")
 * }
 * 
 * Returns:
 * {
 *   success: true,
 *   contents: [
 *     {
 *       name,
 *       path,
 *       type (file|dir),
 *       size,
 *       sha,
 *       download_url
 *     }
 *   ]
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

    // Parse payload
    let payload;
    try {
      payload = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { owner, repo, path = '' } = payload;

    // Validate
    if (!owner || typeof owner !== 'string' || owner.trim() === '') {
      return Response.json({ error: 'owner must be a non-empty string' }, { status: 400 });
    }
    if (!repo || typeof repo !== 'string' || repo.trim() === '') {
      return Response.json({ error: 'repo must be a non-empty string' }, { status: 400 });
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
        actionType: 'github.contents.read',
        status: 'failure',
        requestJson: { owner, repo, path },
        responseJson: { reason: 'repository_not_registered' },
        githubUrl: null,
        errorMessage: 'Repository not found in registry',
      });

      return Response.json(
        { error: 'Repository not registered' },
        { status: 403 }
      );
    }

    const repository = registeredRepos[0];

    // Check if repo is enabled
    if (!repository.isEnabled) {
      await base44.asServiceRole.entities.RepoActionLog.create({
        repositoryFullName: repoKey,
        repositoryId: repository.id,
        actorUserId: user.id,
        actionType: 'github.contents.read',
        status: 'failure',
        requestJson: { owner, repo, path },
        responseJson: { reason: 'repository_disabled' },
        githubUrl: null,
        errorMessage: 'Repository is disabled',
      });

      return Response.json(
        { error: 'Repository is disabled' },
        { status: 403 }
      );
    }

    // Check capability: contents:read
    const capabilities = repository.capabilitiesJson || {};
    if (!capabilities['contents:read']) {
      await base44.asServiceRole.entities.RepoActionLog.create({
        repositoryFullName: repoKey,
        repositoryId: repository.id,
        actorUserId: user.id,
        actionType: 'github.contents.read',
        status: 'failure',
        requestJson: { owner, repo, path },
        responseJson: { reason: 'capability_denied' },
        githubUrl: null,
        errorMessage: 'contents:read capability not enabled',
      });

      return Response.json(
        { error: 'contents:read capability not enabled' },
        { status: 403 }
      );
    }

    // Fetch from GitHub
    const pathParam = path ? `/${path.trim()}` : '';
    const ghRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents${pathParam}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    const ghData = await ghRes.json();

    if (!ghRes.ok) {
      await base44.asServiceRole.entities.RepoActionLog.create({
        repositoryFullName: repoKey,
        repositoryId: repository.id,
        actorUserId: user.id,
        actionType: 'github.contents.read',
        status: 'failure',
        requestJson: { owner, repo, path },
        responseJson: { status: ghRes.status, message: ghData.message },
        githubUrl: null,
        errorMessage: ghData.message ?? 'Failed to fetch contents',
      });

      return Response.json({
        error: 'github_api_error',
        message: ghData.message ?? 'Failed to fetch contents',
      }, { status: ghRes.status });
    }

    // Normalize response: array or single object
    const items = Array.isArray(ghData) ? ghData : [ghData];

    const normalized = items.map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
      sha: item.sha,
      download_url: item.download_url,
    }));

    // Log success
    await base44.asServiceRole.entities.RepoActionLog.create({
      repositoryFullName: repoKey,
      repositoryId: repository.id,
      actorUserId: user.id,
      actionType: 'github.contents.read',
      status: 'success',
      requestJson: { owner, repo, path },
      responseJson: { itemCount: normalized.length },
      githubUrl: `https://github.com/${owner}/${repo}/tree/main/${path}`,
      errorMessage: null,
    });

    return Response.json({
      success: true,
      contents: normalized,
    });

  } catch (error) {
    const msg = (error instanceof Error ? error.message : String(error)) || 'Internal server error';
    return Response.json({ error: msg }, { status: 500 });
  }
});
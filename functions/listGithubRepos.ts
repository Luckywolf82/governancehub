import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * listGithubRepos
 * 
 * Discover repositories available through the connected GitHub account.
 * Returns a list of repos with their registration status in GovernanceHub.
 * 
 * Payload: {} (empty POST body, auth via header)
 * 
 * Returns:
 * {
 *   success: true,
 *   repositories: [
 *     {
 *       owner,
 *       repo,
 *       fullName,
 *       visibility,
 *       defaultBranch,
 *       archived,
 *       registered,
 *       enabled,
 *       repositoryId
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

    // Fetch repos from GitHub
    const ghRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!ghRes.ok) {
      const ghErr = await ghRes.json();
      return Response.json({
        error: 'github_api_error',
        message: ghErr.message ?? 'Failed to fetch repos from GitHub',
      }, { status: ghRes.status });
    }

    const ghRepos = await ghRes.json();

    // Fetch registered repos from GovernanceHub
    const registeredRepos = await base44.asServiceRole.entities.Repository.list();
    const registeredByFullName = {};
    registeredRepos.forEach((r) => {
      registeredByFullName[r.fullName] = r;
    });

    // Normalize GitHub repos
    const normalized = ghRepos.map((ghRepo) => {
      const fullName = `${ghRepo.owner.login}/${ghRepo.name}`;
      const registered = !!registeredByFullName[fullName];
      const regRecord = registeredByFullName[fullName];

      return {
        owner: ghRepo.owner.login,
        repo: ghRepo.name,
        fullName,
        visibility: ghRepo.private ? 'private' : 'public',
        defaultBranch: ghRepo.default_branch,
        archived: ghRepo.archived,
        registered,
        enabled: registered ? regRecord.isEnabled : false,
        repositoryId: registered ? regRecord.id : null,
      };
    });

    // Sort: registered first, then by fullName
    normalized.sort((a, b) => {
      if (a.registered !== b.registered) {
        return a.registered ? -1 : 1;
      }
      return a.fullName.localeCompare(b.fullName);
    });

    // Log action
    await base44.asServiceRole.entities.RepoActionLog.create({
      repositoryFullName: 'github',
      repositoryId: null,
      actorUserId: user.id,
      actionType: 'github.repos.list',
      status: 'success',
      requestJson: {},
      responseJson: { count: normalized.length },
      githubUrl: null,
      errorMessage: null,
    });

    return Response.json({
      success: true,
      repositories: normalized,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { createAppJWT, isGithubAppConfigured } from './_shared/githubAppAuth.ts';

/**
 * listGithubRepos
 *
 * Discover repositories available through the GitHub App installations.
 * Falls back to the legacy connector model if GitHub App env vars are not configured.
 *
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
 *       repositoryId,
 *       canWrite,           // true if GitHub access allows push
 *       installationId,     // GitHub App installation ID (null for connector-based)
 *       githubPermissions   // { admin, maintain, push, triage, pull } from GitHub API
 *     }
 *   ]
 * }
 */

// ---------------------------------------------------------------------------
// GitHub App repo discovery
// ---------------------------------------------------------------------------

interface GhInstallation {
  id: number;
  account: { login: string; type: string } | null;
}

interface GhRepoEntry {
  owner: { login: string };
  name: string;
  private: boolean;
  default_branch: string;
  archived: boolean;
  permissions?: {
    admin?: boolean;
    maintain?: boolean;
    push?: boolean;
    triage?: boolean;
    pull?: boolean;
  };
}

/** Normalized repo entry shared between App and connector discovery paths. */
interface RepoEntry {
  owner: string;
  repo: string;
  fullName: string;
  visibility: string;
  defaultBranch: string;
  archived: boolean;
  canWrite: boolean;
  installationId: number | null;
  githubPermissions: { admin: boolean; maintain: boolean; push: boolean; triage: boolean; pull: boolean };
}

/**
 * Fetch all repos accessible via GitHub App installations.
 * Returns each repo tagged with its installationId and canWrite flag.
 */
async function listReposViaApp(): Promise<RepoEntry[]> {
  const appId = Deno.env.get('GITHUB_APP_ID')!;
  const privateKey = Deno.env.get('GITHUB_APP_PRIVATE_KEY')!;
  const jwt = await createAppJWT(appId, privateKey);

  // 1. List all installations for this app (paginate up to 100)
  const installRes = await fetch(
    'https://api.github.com/app/installations?per_page=100',
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  );

  if (!installRes.ok) {
    const err = await installRes.json().catch(() => ({}));
    throw new Error(
      `GitHub App installations list failed: ${err.message ?? `HTTP ${installRes.status}`}`,
    );
  }

  const installations: GhInstallation[] = await installRes.json();
  const results: RepoEntry[] = [];

  // 2. For each installation, get an installation token and list repos
  for (const installation of installations) {
    // Get installation access token
    const tokenRes = await fetch(
      `https://api.github.com/app/installations/${installation.id}/access_tokens`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    );

    if (!tokenRes.ok) {
      // Skip this installation on token failure (log but continue)
      continue;
    }

    const { token: installationToken } = await tokenRes.json();

    // List repos for this installation (paginate up to 100)
    const reposRes = await fetch(
      'https://api.github.com/installation/repositories?per_page=100',
      {
        headers: {
          Authorization: `Bearer ${installationToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    );

    if (!reposRes.ok) {
      continue;
    }

    const { repositories: ghRepos }: { repositories: GhRepoEntry[] } = await reposRes.json();

    for (const ghRepo of ghRepos) {
      const perms = ghRepo.permissions ?? {};
      results.push({
        owner: ghRepo.owner.login,
        repo: ghRepo.name,
        fullName: `${ghRepo.owner.login}/${ghRepo.name}`,
        visibility: ghRepo.private ? 'private' : 'public',
        defaultBranch: ghRepo.default_branch,
        archived: ghRepo.archived,
        canWrite: perms.push === true,
        installationId: installation.id,
        githubPermissions: {
          admin: perms.admin === true,
          maintain: perms.maintain === true,
          push: perms.push === true,
          triage: perms.triage === true,
          pull: perms.pull === true,
        },
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Connector-based repo discovery (legacy fallback)
// ---------------------------------------------------------------------------

async function listReposViaConnector(accessToken: string): Promise<RepoEntry[]> {
  const ghRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!ghRes.ok) {
    const ghErr = await ghRes.json().catch(() => ({}));
    throw new Error(ghErr.message ?? `GitHub API error: HTTP ${ghRes.status}`);
  }

  const ghRepos: GhRepoEntry[] = await ghRes.json();

  return ghRepos.map((ghRepo) => {
    const perms = ghRepo.permissions ?? {};
    return {
      owner: ghRepo.owner.login,
      repo: ghRepo.name,
      fullName: `${ghRepo.owner.login}/${ghRepo.name}`,
      visibility: ghRepo.private ? 'private' : 'public',
      defaultBranch: ghRepo.default_branch,
      archived: ghRepo.archived,
      canWrite: perms.push === true,
      installationId: null,
      githubPermissions: {
        admin: perms.admin === true,
        maintain: perms.maintain === true,
        push: perms.push === true,
        triage: perms.triage === true,
        pull: perms.pull === true,
      },
    };
  });
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

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

    // --- Repo discovery: GitHub App (preferred) or connector (fallback) ---
    let rawRepos: RepoEntry[];

    if (isGithubAppConfigured()) {
      // GitHub App path
      try {
        rawRepos = await listReposViaApp();
      } catch (appErr) {
        return Response.json({
          error: 'github_not_connected',
          message: `GitHub App discovery failed: ${(appErr as Error).message}`,
        }, { status: 503 });
      }
    } else {
      // Legacy connector fallback
      let accessToken: string;
      try {
        const conn = await base44.asServiceRole.connectors.getConnection('github');
        accessToken = conn.accessToken;
      } catch {
        return Response.json({
          error: 'github_not_connected',
          message: 'GitHub App is not configured (GITHUB_APP_ID / GITHUB_APP_PRIVATE_KEY) and no GitHub connector is authorized.',
        }, { status: 503 });
      }

      try {
        rawRepos = await listReposViaConnector(accessToken);
      } catch (connErr) {
        return Response.json({
          error: 'github_api_error',
          message: (connErr as Error).message,
        }, { status: 502 });
      }
    }

    // Cross-reference with GovernanceHub registry
    const registeredRepos = await base44.asServiceRole.entities.Repository.list();
    const registeredByFullName: Record<string, { id: string; isEnabled: boolean }> = {};
    registeredRepos.forEach((r: { fullName: string; id: string; isEnabled: boolean }) => {
      registeredByFullName[r.fullName] = r;
    });

    // Build normalized list
    const normalized = rawRepos.map((r) => {
      const regRecord = registeredByFullName[r.fullName];
      return {
        owner: r.owner,
        repo: r.repo,
        fullName: r.fullName,
        visibility: r.visibility,
        defaultBranch: r.defaultBranch,
        archived: r.archived,
        registered: !!regRecord,
        enabled: regRecord ? regRecord.isEnabled : false,
        repositoryId: regRecord ? regRecord.id : null,
        canWrite: r.canWrite,
        installationId: r.installationId,
        githubPermissions: r.githubPermissions,
      };
    });

    // Sort: registered first, then alphabetically by fullName
    normalized.sort((a, b) => {
      if (a.registered !== b.registered) return a.registered ? -1 : 1;
      return a.fullName.localeCompare(b.fullName);
    });

    // Log action
    await base44.asServiceRole.entities.RepoActionLog.create({
      repositoryFullName: 'github',
      repositoryId: null,
      actorUserId: user.id,
      actionType: 'github.repos.list',
      status: 'success',
      requestJson: { source: isGithubAppConfigured() ? 'github_app' : 'connector' },
      responseJson: { count: normalized.length },
      githubUrl: null,
      errorMessage: null,
    });

    return Response.json({ success: true, repositories: normalized });

  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
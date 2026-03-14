import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * createGithubIssue
 * 
 * Create a GitHub issue for a registered and enabled repository.
 * Enforces capability-based access control via Repository registry.
 * 
 * Payload:
 * {
 *   owner: string,
 *   repo: string,
 *   title: string,
 *   body: string,
 *   labels?: string[],
 *   auditId?: string,
 *   readiness?: string,
 *   source?: string
 * }
 * 
 * Returns:
 * {
 *   success: true,
 *   issue_number,
 *   issue_url,
 *   title
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

    const { owner, repo, title, body, labels = [], auditId, readiness, source } = payload;

    // Validate required fields
    if (!owner || typeof owner !== 'string' || owner.trim() === '') {
      return Response.json({ error: 'owner must be a non-empty string' }, { status: 400 });
    }
    if (!repo || typeof repo !== 'string' || repo.trim() === '') {
      return Response.json({ error: 'repo must be a non-empty string' }, { status: 400 });
    }
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return Response.json({ error: 'title must be a non-empty string' }, { status: 400 });
    }
    if (!body || typeof body !== 'string' || body.trim() === '') {
      return Response.json({ error: 'body must be a non-empty string' }, { status: 400 });
    }

    // Normalize labels: trim whitespace, remove duplicates, skip empty values
    const normalizedLabels = Array.isArray(labels)
      ? [...new Set(labels.map((l) => String(l).trim()).filter(Boolean))]
      : [];

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
        actionType: 'github.issue.create',
        status: 'failure',
        requestJson: { owner, repo, title: title.substring(0, 50) },
        responseJson: { reason: 'repository_not_registered' },
        githubUrl: null,
        errorMessage: 'Repository not found in GovernanceHub registry',
      });

      return Response.json(
        { error: 'Repository not registered', message: 'Use registerGithubRepo first' },
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
        actionType: 'github.issue.create',
        status: 'failure',
        requestJson: { owner, repo, title: title.substring(0, 50) },
        responseJson: { reason: 'repository_disabled' },
        githubUrl: null,
        errorMessage: 'Repository is disabled',
      });

      return Response.json(
        { error: 'Repository is disabled' },
        { status: 403 }
      );
    }

    // Check capability: issue:create
    const capabilities = repository.capabilitiesJson || {};
    if (!capabilities['issue:create']) {
      await base44.asServiceRole.entities.RepoActionLog.create({
        repositoryFullName: repoKey,
        repositoryId: repository.id,
        actorUserId: user.id,
        actionType: 'github.issue.create',
        status: 'failure',
        requestJson: { owner, repo, title: title.substring(0, 50) },
        responseJson: { reason: 'capability_denied' },
        githubUrl: null,
        errorMessage: 'issue:create capability not enabled',
      });

      return Response.json(
        { error: 'issue:create capability not enabled for this repository' },
        { status: 403 }
      );
    }

    // Build issue body with provenance footer
    const provenanceFooter = [
      '',
      '---',
      `*GovernanceHub Issue Dispatch · Audit: \`${auditId ?? 'unknown'}\` · Source: ${source ?? 'unknown'} · Readiness: ${readiness ?? 'unknown'}*`,
    ].join('\n');

    const issueBody = body + provenanceFooter;

    // Prevent duplicate issues: search for existing issue with same auditId in this repo
    if (auditId && auditId !== 'unknown') {
      const searchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (searchRes.ok) {
        const existingIssues = await searchRes.json();
        const auditMarker = `Audit: \`${auditId}\``;

        for (const issue of existingIssues) {
          if (issue.body && issue.body.includes(auditMarker)) {
            // Found existing issue for this audit
            await base44.asServiceRole.entities.RepoActionLog.create({
              repositoryFullName: repoKey,
              repositoryId: repository.id,
              actorUserId: user.id,
              actionType: 'github.issue.create',
              status: 'failure',
              requestJson: { owner, repo, title: title.substring(0, 50), auditId },
              responseJson: { reason: 'issue_already_exists', existingIssueNumber: issue.number },
              githubUrl: issue.html_url,
              errorMessage: `Issue #${issue.number} already exists for audit ${auditId}`,
            });

            return Response.json({
              success: false,
              error: 'issue_already_exists',
              message: 'An issue already exists for this audit in this repository.',
              existing_issue_number: issue.number,
              existing_issue_url: issue.html_url,
              existing_issue_title: issue.title,
            }, { status: 409 });
          }
        }
      }
    }

    // Create issue via GitHub REST API
    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ title, body: issueBody, labels: normalizedLabels }),
    });

    const ghData = await ghRes.json();

    if (!ghRes.ok) {
      let errorMsg = ghData.message ?? 'GitHub API error';
      if (ghData.errors && Array.isArray(ghData.errors)) {
        const labelErrors = ghData.errors.filter((e) => e.field === 'labels');
        if (labelErrors.length > 0) {
          errorMsg += ' (invalid labels; ensure they exist on the repository)';
        }
      }

      await base44.asServiceRole.entities.RepoActionLog.create({
        repositoryFullName: repoKey,
        repositoryId: repository.id,
        actorUserId: user.id,
        actionType: 'github.issue.create',
        status: 'failure',
        requestJson: { owner, repo, title: title.substring(0, 50), labelCount: normalizedLabels.length },
        responseJson: { status: ghRes.status, message: errorMsg },
        githubUrl: null,
        errorMessage: errorMsg,
      });

      return Response.json({
        error: 'github_api_error',
        message: errorMsg,
      }, { status: ghRes.status });
    }

    // Log success
    await base44.asServiceRole.entities.RepoActionLog.create({
      repositoryFullName: repoKey,
      repositoryId: repository.id,
      actorUserId: user.id,
      actionType: 'github.issue.create',
      status: 'success',
      requestJson: { owner, repo, title: title.substring(0, 50), labelCount: normalizedLabels.length },
      responseJson: { issueNumber: ghData.number, issueUrl: ghData.html_url },
      githubUrl: ghData.html_url,
      errorMessage: null,
    });

    return Response.json({
      success: true,
      issue_number: ghData.number,
      issue_url: ghData.html_url,
      title: ghData.title,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * createGithubIssue
 * Creates a single GitHub issue using the authorized GitHub app connector.
 *
 * Expected payload:
 *   owner       {string} — GitHub repo owner (user or org)
 *   repo        {string} — GitHub repo name
 *   title       {string} — Issue title
 *   body        {string} — Issue body (markdown)
 *   labels      {string[]} — Existing GitHub label names (optional)
 *   auditId     {string} — Provenance: source audit ID
 *   readiness   {string} — Provenance: readiness tier
 *   source      {string} — Provenance: AUDIT_INDEX or Audit Runner
 */
Deno.serve(async (req) => {
  try {
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
        message: 'GitHub connector is not authorized. Connect it from the GovernanceHub admin settings.',
      }, { status: 503 });
    }

    const payload = await req.json();
    const { owner, repo, title, body, labels = [], auditId, readiness, source } = payload;

    if (!owner || !repo || !title || !body) {
      return Response.json({ error: 'Missing required fields: owner, repo, title, body' }, { status: 400 });
    }

    // Normalize labels: trim whitespace, remove duplicates, skip empty values
    const normalizedLabels = Array.isArray(labels)
      ? [...new Set(labels.map((l) => String(l).trim()).filter(Boolean))]
      : [];

    // GovernanceHub phase A: restrict issue creation to approved owner repositories.
    // This allowlist is intentionally designed to expand in phase B as multi-user support is added.
    const ALLOWED_REPOS = [
      'Luckywolf82/governancehub',
      'Luckywolf82/tankradar',
    ];

    const repoKey = `${owner}/${repo}`;
    if (!ALLOWED_REPOS.includes(repoKey)) {
      return Response.json(
        { error: 'Repository not allowed for issue creation' },
        { status: 403 }
      );
    }

    // Append provenance footer to body
    const provenanceFooter = [
      '',
      '---',
      `*GovernanceHub Issue Dispatch · Audit: \`${auditId ?? 'unknown'}\` · Source: ${source ?? 'unknown'} · Readiness: ${readiness ?? 'unknown'}*`,
    ].join('\n');

    const issueBody = body + provenanceFooter;

    // Create the issue via GitHub REST API
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
      return Response.json({
        error: 'github_api_error',
        message: ghData.message ?? 'GitHub API returned an error',
        details: ghData,
      }, { status: ghRes.status });
    }

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
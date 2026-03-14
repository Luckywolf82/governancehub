import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only access
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const payload = await req.json();
    const { owner, repo, auditId } = payload;

    if (!owner || !repo || !auditId) {
      return Response.json(
        { error: 'Missing required parameters: owner, repo, auditId' },
        { status: 400 }
      );
    }

    // Get GitHub access token from connector
    let accessToken;
    try {
      const connection = await base44.asServiceRole.connectors.getConnection('github');
      accessToken = connection.accessToken;
    } catch (err) {
      return Response.json(
        { error: 'GitHub connector not authorized' },
        { status: 503 }
      );
    }

    // Query GitHub open PRs in the repo
    const searchRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (!searchRes.ok) {
      return Response.json(
        { error: 'Failed to query GitHub PRs', status: searchRes.status },
        { status: searchRes.status }
      );
    }

    const prs = await searchRes.json();

    // Search for the auditId marker in PR title or body
    const auditMarker = `Audit: ${auditId}`;

    for (const pr of prs) {
      const titleMatch = pr.title && pr.title.includes(auditMarker);
      const bodyMatch = pr.body && pr.body.includes(auditMarker);

      if (titleMatch || bodyMatch) {
        // Found the PR for this audit
        return Response.json({
          found: true,
          number: pr.number,
          url: pr.html_url,
          title: pr.title,
          state: pr.state,
        });
      }
    }

    // Not found
    return Response.json({ found: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
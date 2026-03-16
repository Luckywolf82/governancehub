import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * verifyExecutionLogEntry
 *
 * Determines the actual verification state of an execution-log entry by
 * querying the GitHub API directly. The app calls this on load so that
 * verification status is derived from real GitHub state, not from manually
 * authored free-text fields.
 *
 * Supported verificationTargetType values:
 *   "pull_request" — verified if the PR is merged
 *   "commit"       — verified if the commit exists and is reachable on main
 *
 * Unsupported types return verificationStatus: "unknown" rather than guessing.
 *
 * Payload:
 * {
 *   owner: string,
 *   repo: string,
 *   entryId: string,
 *   verificationTargetType: "pull_request" | "commit",
 *   verificationTargetValue: string   // PR number, branch name, or commit SHA
 * }
 *
 * Returns:
 * {
 *   verificationStatus: "verified" | "unverified" | "unknown",
 *   verifiedAt?: string,           // ISO timestamp when verified (e.g. PR merged_at)
 *   verificationEvidence?: string  // Human-readable summary of what was checked
 * }
 */

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    let accessToken: string;
    try {
      const conn = await base44.asServiceRole.connectors.getConnection('github');
      accessToken = conn.accessToken;
    } catch {
      return Response.json(
        { error: 'github_not_connected', message: 'GitHub connector is not authorized.' },
        { status: 503 }
      );
    }

    let payload: Record<string, string>;
    try {
      payload = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { owner, repo, entryId, verificationTargetType, verificationTargetValue } = payload;

    if (!owner || !repo || !entryId || !verificationTargetType || !verificationTargetValue) {
      return Response.json(
        { error: 'Missing required fields: owner, repo, entryId, verificationTargetType, verificationTargetValue' },
        { status: 400 }
      );
    }

    const ghHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    // Minimal shape for GitHub PR API responses used in this function
    interface GithubPr {
      number: number;
      title: string;
      state: string;
      merged_at: string | null;
      base?: { ref: string };
    }

    // ── pull_request: verified if the PR is merged ────────────────────────────

    if (verificationTargetType === 'pull_request') {
      const asNumber = parseInt(verificationTargetValue, 10);
      const isNumeric = !isNaN(asNumber) && String(asNumber) === verificationTargetValue;

      let prData: GithubPr | null = null;

      if (isNumeric) {
        // Fetch PR directly by number
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/pulls/${asNumber}`,
          { headers: ghHeaders }
        );
        if (res.ok) {
          prData = await res.json() as GithubPr;
        }
      } else {
        // Look up PR by head branch name across all states
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/pulls?head=${owner}:${verificationTargetValue}&state=all&per_page=10`,
          { headers: ghHeaders }
        );
        if (res.ok) {
          const prs: GithubPr[] = await res.json();
          // Prefer a merged PR; fall back to the most recent found PR
          prData = prs.find((p) => p.merged_at !== null) ?? prs[0] ?? null;
        }
      }

      if (!prData) {
        return Response.json({
          verificationStatus: 'unverified',
          verificationEvidence: `No pull request found for target: ${verificationTargetValue}`,
        });
      }

      if (prData.merged_at) {
        return Response.json({
          verificationStatus: 'verified',
          verifiedAt: prData.merged_at,
          verificationEvidence: `PR #${prData.number} "${prData.title}" merged into ${prData.base?.ref ?? 'main'} at ${prData.merged_at}`,
        });
      }

      if (prData.state === 'open') {
        return Response.json({
          verificationStatus: 'unverified',
          verificationEvidence: `PR #${prData.number} "${prData.title}" is open but not yet merged`,
        });
      }

      return Response.json({
        verificationStatus: 'unverified',
        verificationEvidence: `PR #${prData.number} "${prData.title}" is closed but was not merged`,
      });
    }

    // ── commit: verified if it exists and is reachable on main ───────────────

    if (verificationTargetType === 'commit') {
      const commitRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits/${verificationTargetValue}`,
        { headers: ghHeaders }
      );

      if (!commitRes.ok) {
        return Response.json({
          verificationStatus: 'unverified',
          verificationEvidence: `Commit ${verificationTargetValue} not found (HTTP ${commitRes.status})`,
        });
      }

      const commitData = await commitRes.json();

      // Reachability check: compare main...commit
      // status "behind" or "identical" means the commit is an ancestor of (or is) HEAD of main
      const compareRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/compare/main...${verificationTargetValue}`,
        { headers: ghHeaders }
      );

      if (!compareRes.ok) {
        return Response.json({
          verificationStatus: 'unverified',
          verificationEvidence: `Commit ${verificationTargetValue} found but reachability on main could not be confirmed (HTTP ${compareRes.status})`,
        });
      }

      const compareData = await compareRes.json();
      const onMain = compareData.status === 'identical' || compareData.status === 'behind';

      if (onMain) {
        return Response.json({
          verificationStatus: 'verified',
          verifiedAt: commitData.commit?.committer?.date ?? new Date().toISOString(),
          verificationEvidence: `Commit ${verificationTargetValue} is present and reachable on main — "${commitData.commit?.message?.split('\n')[0] ?? ''}"`,
        });
      }

      return Response.json({
        verificationStatus: 'unverified',
        verificationEvidence: `Commit ${verificationTargetValue} exists but is not yet reachable on main (compare status: ${compareData.status})`,
      });
    }

    // ── Unsupported target type ───────────────────────────────────────────────

    return Response.json({
      verificationStatus: 'unknown',
      verificationEvidence: `Unsupported verificationTargetType: "${verificationTargetType}". Automatic verification is not available for this target type.`,
    });

  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});

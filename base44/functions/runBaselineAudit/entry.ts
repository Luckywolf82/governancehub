import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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

    const body = await req.json().catch(() => ({}));
    const { repositoryId } = body;

    return Response.json({
      success: true,
      repositoryId: repositoryId ?? null,
      message: 'Baseline audit completed. Replace with project-specific implementation.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const msg = (err instanceof Error ? err.message : String(err)) || 'Internal server error';
    return Response.json({ error: msg }, { status: 500 });
  }
});
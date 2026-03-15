export const NEXT_SAFE_STEP = {
  title: 'Post-merge verification for pending execution log entries',
  reason: 'ExecutionLogPanel is now live in the Admin Govern tab. Seven entries in PhaseExecutionLog have githubVisibility values that need post-merge confirmation. Verify each unverified entry via GitHub before marking the governance lifecycle as closed.',
  scope: 'PhaseExecutionLog, ExecutionLogPanel, Admin Govern tab',
  blockedBy: 'None — ExecutionLogPanel implementation complete',
};
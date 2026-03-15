export const NEXT_SAFE_STEP = {
  title: 'Post-merge verification for pending execution log entries',
  reason: 'Scope compliance audit (gov-005) is complete. The scopeNote correction to Entry 8 has been applied. All implementation from the prior session is retained and correct. Next step: use ExecutionLogPanel in the Admin Govern tab to confirm GitHub visibility for entries marked "Not yet verified".',
  scope: 'PhaseExecutionLog, ExecutionLogPanel, Admin Govern tab',
  blockedBy: 'None — scope correction applied, ExecutionLogPanel implementation confirmed correct',
};
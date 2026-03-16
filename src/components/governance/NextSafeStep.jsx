export const NEXT_SAFE_STEP = {
  title: 'Post-merge verification — gov-004 implementation',
  reason: 'ExecutionLogPanel.jsx has been added to the Admin Govern tab (gov-004). Unverified PhaseExecutionLog entries must be confirmed visible in GitHub after merge to close the governance lifecycle for this step.',
  scope: 'ExecutionLogPanel, Admin Govern tab, PhaseExecutionLog unverified entries',
  blockedBy: 'gov-004 implementation merge',
  lifecycleStage: 'implementation_complete_pending_verification',
};
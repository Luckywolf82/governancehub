export const PHASE_EXECUTION_LOG = {
  entries: [
    {
      id: 'Entry 1',
      date: 'YYYY-MM-DD',
      task: 'Bootstrap governance and admin framework',
      changedFiles: [
        'src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx',
        'src/components/admin/AdminDashboard.jsx'
      ],
      diffSummary: 'Initial project scaffolding',
      githubVisibility: 'Not yet verified',
      lockedFileVerification: 'Pending',
    },
    {
      id: 'Entry 2',
      date: '2026-03-14',
      task: 'Governance Source-of-Truth Alignment',
      taskRequested: 'Align locked file registry and governance state after baseline governance audit.',
      changedFiles: [
        'src/components/governance/LockedFiles.jsx',
        'src/components/governance/AI_STATE.jsx',
        'src/components/governance/NextSafeStep.jsx',
      ],
      diffSummary: [
        'Locked file registry expanded to match governance policy (added PhaseExecutionLog, AUDIT_INDEX, AUDIT_SYSTEM_GUIDE)',
        'Governance system state initialized for GovernanceHub (projectName, phase, status, lastVerified)',
        'Next safe step updated after baseline audit completion',
      ],
      githubVisibility: 'Files exist in repository — verified via live repo index',
      lockedFileVerification: 'Locked files not modified directly. LockedFiles.jsx extended through allowed registry update only.',
    },
  ],
};
export const PHASE_EXECUTION_LOG = {
  entries: [
    {
      id: 'Entry 1',
      date: 'YYYY-MM-DD',
      task: 'Bootstrap governance and admin framework',
      changedFiles: [
        'src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx',
        'src/pages/AdminDashboard.jsx'
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
    {
      id: 'Entry 3',
      date: '2026-03-15',
      task: 'Normalize locked-file definitions across governance files',
      changedFiles: [
        'src/components/governance/LockedFiles.jsx',
        'src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx',
        '.github/COPILOT_REVIEW_CHECKLIST.md',
        '.github/copilot-instructions.md',
      ],
      diffSummary: [
        'LockedFiles.jsx: removed INSTALL_POLICY.jsx and STARTER_KIT_VERSION.jsx (starter-kit-only, not present in main repo)',
        'AI_PROJECT_INSTRUCTIONS.jsx: added AI_PROJECT_INSTRUCTIONS.jsx and LockedFiles.jsx to LOCKED FILES section',
        '.github/COPILOT_REVIEW_CHECKLIST.md: added AI_PROJECT_INSTRUCTIONS.jsx and LockedFiles.jsx to locked files list',
        '.github/copilot-instructions.md: added LockedFiles.jsx to high-sensitivity files list',
      ],
      githubVisibility: 'verified — changes visible in GitHub on branch copilot/normalize-locked-file-definitions',
      lockedFileVerification: 'AI_PROJECT_INSTRUCTIONS.jsx and LockedFiles.jsx modified as explicitly required by this normalization task.',
    },
    {
      id: 'Entry 4',
      date: '2026-03-15',
      task: 'Execution Log Schema Consistency Audit',
      taskRequested: 'Audit execution log schema consistency across PhaseExecutionLog.jsx, AI_PROJECT_INSTRUCTIONS.jsx, and INSTALL_POLICY.jsx. Identify field drift and report findings.',
      changedFiles: [
        'src/components/audits/governance/execution-log-schema-audit-2026-03-15.jsx',
        'src/components/audits/AUDIT_INDEX.jsx',
        'src/components/governance/PhaseExecutionLog.jsx',
      ],
      diffSummary: [
        'Created governance audit file: execution-log-schema-audit-2026-03-15.jsx — documents schema drift findings for gov-003',
        'AUDIT_INDEX.jsx: added gov-003 entry (Execution Log Schema Consistency, verified)',
        'PhaseExecutionLog.jsx: appended Entry 4 for this audit execution',
      ],
      githubVisibility: 'Not yet verified',
      lockedFileVerification: 'AUDIT_INDEX.jsx modified to register new audit entry per audit system rules. PhaseExecutionLog.jsx appended with this entry. No other locked files modified.',
    },
  ],
};
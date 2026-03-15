export const LOCKED_FILES = {
  files: [
    {
      path: 'src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx',
      rule: 'Update only with explicit version bump.'
    },
    {
      path: 'src/components/governance/LockedFiles.jsx',
      rule: 'Do not weaken locked-file rules silently.'
    },
    {
      path: 'src/components/governance/INSTALL_POLICY.jsx',
      rule: 'Policy file. Do not modify without governance approval.'
    },
    {
      path: 'src/components/governance/STARTER_KIT_VERSION.jsx',
      rule: 'Version definition. Only update during starter-kit release.'
    },
    {
      path: 'src/components/governance/PhaseExecutionLog.jsx',
      rule: 'Append only. Do not rewrite or delete existing entries.'
    },
    {
      path: 'src/components/audits/AUDIT_INDEX.jsx',
      rule: 'Add entries only. Do not remove or alter existing audit records.'
    },
    {
      path: 'src/components/audits/AUDIT_SYSTEM_GUIDE.jsx',
      rule: 'Update only when audit protocol changes with explicit justification.'
    },
  ],
};

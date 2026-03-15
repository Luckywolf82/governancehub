/**
 * LOCKED FILE REGISTRY
 *
 * Files that cannot be modified by AI without explicit approval.
 */

export const LOCKED_FILES = {
  files: [
    {
      path: "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
      rule: "Core governance rules."
    },
    {
      path: "src/components/governance/LockedFiles.jsx",
      rule: "Defines locked files."
    },
    {
      path: "src/components/governance/PhaseExecutionLog.jsx",
      rule: "System change history."
    },
    {
      path: "src/components/audits/AUDIT_INDEX.jsx",
      rule: "Canonical audit registry."
    },
    {
      path: "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx",
      rule: "Audit system specification."
    }
  ]
};

/*
 * LockedFiles
 *
 * Defines repository files that are protected from automatic modification.
 * These guardrails ensure that AI agents do not accidentally modify critical
 * governance infrastructure.
 */

export const LockedFiles = {

  description: "Defines governance files that are protected from automatic modification.",

  hardLocked: [
    "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
    "src/components/governance/INSTALL_POLICY.jsx",
    "src/components/governance/STARTER_KIT_VERSION.jsx"
  ],

  reviewLocked: [
    "src/components/governance/AI_STATE.jsx",
    "src/components/governance/NextSafeStep.jsx",
    "src/components/governance/PhaseExecutionLog.jsx",
    "src/components/projects/PROJECT_REGISTRY.jsx"
  ],

  informational: [
    "src/components/audits/AUDIT_INDEX.jsx",
    "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx"
  ],

  rules: {

    hardLocked: [
      "AI must never modify these files automatically.",
      "Changes require explicit human approval.",
      "Any modification must be recorded in PhaseExecutionLog."
    ],

    reviewLocked: [
      "AI may read and propose changes.",
      "AI must not directly modify these files.",
      "Changes require human confirmation."
    ],

    informational: [
      "Files may be read and referenced by AI.",
      "AI may propose documentation improvements.",
      "Structural changes should still be reviewed."
    ]
  }

};

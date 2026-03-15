/*
 * STARTER_KIT_VERSION
 *
 * Canonical version definition for GovernanceHub Starter Kit.
 * Used to track installed governance baseline inside target repositories.
 */

export const STARTER_KIT_VERSION = {
  name: "GovernanceHub Starter Kit",

  version: "1.0.0",

  releaseDate: "2026-03-15",

  governanceModules: [
    "AI_PROJECT_INSTRUCTIONS",
    "INSTALL_POLICY",
    "AI_STATE",
    "LockedFiles",
    "NextSafeStep",
    "PhaseExecutionLog"
  ],

  auditModules: [
    "AUDIT_INDEX",
    "AUDIT_SYSTEM_GUIDE"
  ],

  projectModules: [
    "PROJECT_REGISTRY"
  ],

  description: "Initial GovernanceHub starter governance baseline.",

  installedVia: "manual-starter-kit-install",

  notes: [
    "Starter kit provides minimal governance framework for AI-assisted repositories.",
    "INSTALL_POLICY defines installer constraints and safety rules.",
    "AI_STATE stores runtime AI governance state.",
    "PhaseExecutionLog records governance changes and operations."
  ]
};

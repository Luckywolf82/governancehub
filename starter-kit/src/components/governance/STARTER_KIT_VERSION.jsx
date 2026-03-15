/**
 * STARTER KIT VERSION
 *
 * Defines the version of governance starter kit
 * installed in a repository.
 */

export const STARTER_KIT_VERSION = {
  name: "GovernanceHub Starter Kit",

  version: "1.0.0",

  releaseDate: "2026-03-15",

  description:
    "Bootstrap governance package for AI-governed repositories.",

  compatibility: {
    governanceHub: ">=1.0.0"
  },

  modules: {
    governance: [
      "AI_STATE",
      "AI_PROJECT_INSTRUCTIONS",
      "LockedFiles",
      "NextSafeStep",
      "PhaseExecutionLog"
    ],

    audits: [
      "AUDIT_INDEX",
      "AUDIT_SYSTEM_GUIDE"
    ],

    projects: [
      "PROJECT_REGISTRY"
    ]
  }
};

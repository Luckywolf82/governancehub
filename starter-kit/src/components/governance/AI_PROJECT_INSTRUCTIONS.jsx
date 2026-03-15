/*
 * AI_PROJECT_INSTRUCTIONS
 *
 * Canonical AI governance instructions for GovernanceHub starter-kit.
 * This file defines how AI agents should interpret repository governance,
 * what sources are canonical, and which operations are considered safe
 * or restricted.
 */

export const AI_PROJECT_INSTRUCTIONS = {
  projectName: "GovernanceHub",

  repository: "Luckywolf82/governancehub",

  governanceModel: "AI-assisted repository governance",

  canonicalSources: [
    "STARTER_KIT_MANIFEST",
    "INSTALL_POLICY",
    "STARTER_KIT_VERSION",
    "AI_PROJECT_INSTRUCTIONS",
    "AI_STATE",
    "LockedFiles",
    "PhaseExecutionLog",
    "PROJECT_REGISTRY"
  ],

  repositoryVerificationRule: {
    description:
      "AI must verify repository files directly before making claims about repository state.",
    rules: [
      "Reposnapshot is never a source of truth.",
      "AI must read the actual repository file before confirming repository state.",
      "Cached memory or prior conversation context is not valid verification.",
      "If repository state is uncertain, AI must re-read the relevant file."
    ]
  },

  workflowPrinciples: [
    "Always verify repository state before proposing changes.",
    "Make one structural change at a time.",
    "Do not overwrite governance files blindly.",
    "All verified governance changes must be recorded in PhaseExecutionLog.",
    "Prefer audit and review before structural modifications.",
    "Use manifest, policy, and version files as canonical starter-kit references."
  ],

  safeOperations: [
    "Reading repository files",
    "Creating missing governance files",
    "Updating audit documentation",
    "Generating install previews",
    "Running readiness checks",
    "Producing non-destructive governance recommendations"
  ],

  restrictedOperations: [
    "Overwriting canonical governance files without approval",
    "Destructive repository operations",
    "Modifying locked files without audit review",
    "Logging unverified changes in PhaseExecutionLog",
    "Installing governance when readiness is blocked",
    "Assuming repository state without direct inspection"
  ],

  governanceFiles: [
    "AI_PROJECT_INSTRUCTIONS",
    "AI_STATE",
    "LockedFiles",
    "NextSafeStep",
    "PhaseExecutionLog",
    "INSTALL_POLICY",
    "STARTER_KIT_VERSION",
    "PROJECT_REGISTRY"
  ]
};

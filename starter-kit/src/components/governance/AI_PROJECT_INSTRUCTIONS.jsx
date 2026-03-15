export const AI_PROJECT_INSTRUCTIONS = {

  projectName: "GovernanceHub",

  repository: "Luckywolf82/governancehub",

  governanceModel: "AI-assisted repository governance",

  canonicalSources: [
    "STARTER_KIT_MANIFEST",
    "INSTALL_POLICY",
    "STARTER_KIT_VERSION",
    "AI_STATE",
    "PhaseExecutionLog"
  ],

  repositoryVerificationRule: {
    description: "AI must verify repository files directly before making claims.",
    rules: [
      "Reposnapshot is never a source of truth.",
      "AI must read the actual repository file before confirming state.",
      "Cached memory or conversation context is not valid verification."
    ]
  },

  workflowPrinciples: [
    "Always verify repository state before proposing changes.",
    "Never overwrite governance files blindly.",
    "All governance changes must be recorded in PhaseExecutionLog."
  ],

  safeOperations: [
    "reading repository files",
    "creating new governance files",
    "updating audit documentation"
  ],

  restrictedOperations: [
    "overwriting canonical governance files",
    "destructive repository operations",
    "modifying locked files without audit review"
  ],

  governanceFiles: [
    "AI_STATE",
    "LockedFiles",
    "NextSafeStep",
    "PhaseExecutionLog",
    "INSTALL_POLICY",
    "STARTER_KIT_VERSION"
  ]

}

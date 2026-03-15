export const AI_PROJECT_INSTRUCTIONS = {
  projectName: "GovernanceHub",

  repository: "Luckywolf82/governancehub",

  governanceModel: "AI-assisted multi-project repository governance",

  version: "v2.1",

  canonicalSources: [
    "STARTER_KIT_MANIFEST",
    "INSTALL_POLICY",
    "STARTER_KIT_VERSION",
    "AI_PROJECT_INSTRUCTIONS",
    "AI_STATE",
    "LockedFiles",
    "PhaseExecutionLog",
    "WORKSTREAM_REGISTRY"
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
    "WORKSTREAM_REGISTRY"
  ],

  multiProjectGovernance: {
    description: "GovernanceHub manages multiple projects.",
    rules: [
      "Every audit, task, and execution log entry must reference a specific project.",
      "No governance action is project-agnostic.",
      "Project identity must be confirmed at the start of every governance session.",
      "Cross-project actions require explicit identification of each affected project.",
      "Audits and tasks created without a project reference are invalid.",
      "All audits, tasks, and execution logs must include projectId and projectSlug."
    ]
  },

  auditSystem: {
    canonicalFiles: [
      "src/components/audits/AUDIT_INDEX.jsx",
      "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx"
    ],
    rules: [
      "All structural changes require an audit when system state is unclear.",
      "Audit entries must identify: project, date, change description, affected files, and outcome.",
      "Audit index must be updated when a new audit is created.",
      "Modifying a locked file requires an audit.",
      "Adding a new project to GovernanceHub requires an audit.",
      "Cross-project dependencies being affected requires an audit."
    ]
  },

  lockedFiles: [
    "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
    "src/components/governance/LockedFiles.jsx",
    "src/components/governance/INSTALL_POLICY.jsx",
    "src/components/governance/STARTER_KIT_VERSION.jsx",
    "src/components/governance/PhaseExecutionLog.jsx",
    "src/components/audits/AUDIT_INDEX.jsx",
    "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx"
  ],

  executionLog: {
    file: "src/components/governance/PhaseExecutionLog.jsx",
    requiredFields: [
      "id",
      "date",
      "task",
      "taskRequested",
      "changedFiles",
      "diffSummary",
      "githubVisibility",
      "lockedFileVerification"
    ],
    rule: "Add an entry after every verified change. GitHub visibility must be confirmed before setting githubVisibility to verified."
  },

  repositoryVisibilityProtocol: [
    "Implement the change.",
    "Confirm the file is saved and committed.",
    "Confirm GitHub shows the updated file.",
    "Record the confirmed state in the execution log.",
    "Only then mark the task complete."
  ],

  completionRule: {
    conditions: [
      "The change is visible in the GitHub repository.",
      "The execution log entry is written and visible in GitHub.",
      "Locked files are confirmed unmodified."
    ]
  },

  developmentLoop: "verify → propose → implement → publish → verify",

  versionHistory: [
    "v1.0 — Initial Base44 template",
    "v2.0 — Upgraded to GovernanceHub multi-project governance specification",
    "v2.1 — Updated canonicalSources and governanceFiles to use WORKSTREAM_REGISTRY following component-layer rename from PROJECT_REGISTRY"
  ]
};

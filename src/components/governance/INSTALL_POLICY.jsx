/*
 * INSTALL_POLICY
 *
 * Canonical installer policy for GovernanceHub starter-kit.
 * Defines the exact rules that govern how starter-kit installation must behave
 * in target repositories before any write/install automation is implemented.
 *
 * This is the single source of truth for all installation constraints.
 */

export const INSTALL_POLICY = {
  // ── installMode ────────────────────────────────────────────────────────────
  installMode: {
    name: "preview-and-manual-install",
    description:
      "Starter-kit installation is policy-driven and explicitly gated. No automatic repo writes are performed.",
    current: "preview and manual copy only",
    future: "automated install via approved backend function",
    constraints: [
      "All installation steps must follow this policy exactly.",
      "Dry-run preview is shown before any action is taken.",
      "Only safe_to_install readiness state permits copy action.",
      "No destructive operations are allowed.",
      "All writes must be verified against this policy.",
    ],
  },

  // ── createRules ────────────────────────────────────────────────────────────
  createRules: {
    description:
      "Files and folders may be created only when they do not already exist.",
    files: [
      "Create target files if they do not exist in the repository.",
      "File paths are derived from manifest: src/components/{module}/{filename}",
      "File names and casing must match exactly (case-sensitive).",
      "Do not rename or transform file paths during copy.",
    ],
    folders: [
      "Create parent folders under src/components/ as needed.",
      "Folder structure is inferred from manifest file paths.",
      "Use standard folder structure: src/components/{module}/",
      "Preserve naming case exactly as defined in manifest.",
    ],
  },

  // ── overwriteRules ────────────────────────────────────────────────────────
  overwriteRules: {
    description:
      "Files must never be blindly overwritten. Strict preservation logic applies.",
    lockedFiles: [
      "Never overwrite canonical locked governance files without explicit approval.",
      "Locked files include AI_STATE, LockedFiles, PhaseExecutionLog, AI_PROJECT_INSTRUCTIONS, and WORKSTREAM_REGISTRY when used as canonical governance identity.",
      "If a locked file exists and is non-empty, manual audit/merge decision is required.",
      "Locked file verification must be recorded in PhaseExecutionLog.",
    ],
    projectSpecific: [
      "Never overwrite files containing real project-specific content.",
      "Project-specific files are identified by having non-placeholder, non-empty export bodies.",
      "If such a file exists, move it to requires_manual_review.",
      "User must manually merge or decide which version to keep.",
    ],
    placeholders: [
      "Only replace obvious placeholder stubs such as null, TODO, PLACEHOLDER, or empty export bodies.",
      "If unclear whether a file is placeholder or project-specific, require manual review.",
      "Use a conservative approach: when in doubt, do not overwrite.",
    ],
  },

  // ── lockedFileRules ───────────────────────────────────────────────────────
  lockedFileRules: {
    description:
      "Locked files are system governance files that must not be overwritten blindly.",
    canonicalLockedFiles: [
      "src/components/governance/AI_STATE.jsx",
      "src/components/governance/LockedFiles.jsx",
      "src/components/governance/PhaseExecutionLog.jsx",
      "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
      "src/components/projects/WORKSTREAM_REGISTRY.jsx",
    ],
    approvalRequirement: [
      "If canonical locked governance files already exist in target repo, installation must not proceed blindly.",
      "Existing or partial governance requires audit/merge review before installation.",
      "Operator must compare starter-kit canonical version with existing project version before any manual replacement.",
    ],
  },

  // ── reviewRules ────────────────────────────────────────────────────────────
  reviewRules: {
    description:
      "Manual review is required whenever safe installation conditions are not fully met.",
    existingGovernance: [
      "If canonical governance already exists, do not install blindly.",
      "Block install guidance until audit/merge review is completed.",
    ],
    partialGovernance: [
      "If only some canonical governance files exist, audit/merge is required first.",
      "Reconcile missing vs existing files before any install action.",
    ],
    conflictingFiles: [
      "If a non-locked target file already exists and is not a placeholder, classify it as requires_manual_review.",
      "Do not automatically overwrite non-placeholder content.",
    ],
    verificationFailure: [
      "If repository verification fails, installation is blocked.",
      "Resolve access, repo selection, or verification errors before proceeding.",
    ],
  },

  // ── verificationRules ──────────────────────────────────────────────────────
  verificationRules: {
    description:
      "After any installation action, verification must confirm exact state before logging.",
    pathVerification: [
      "Verify exact target path exists after copy.",
      "Path format must match src/components/{module}/{filename}.",
      "Path mismatch means installation failure.",
    ],
    casingVerification: [
      "Verify file names and casing match exactly.",
      "Case-sensitive correctness must be preserved even on case-insensitive systems.",
    ],
    contentVerification: [
      "Verify copied files are not unintended placeholder stubs.",
      "Final files must not remain empty exports unless intentionally defined that way by the starter kit.",
    ],
    lockedFileVerification: [
      "Verify locked files were not unintentionally changed.",
      "If a locked file was touched, record exact rationale in PhaseExecutionLog.lockedFileVerification.",
      "If unchanged, record 'confirmed unchanged'.",
    ],
  },

  // ── loggingRules ───────────────────────────────────────────────────────────
  loggingRules: {
    description:
      "Installation must be recorded in PhaseExecutionLog only after verification is complete.",
    timing: [
      "Never append PhaseExecutionLog entry until installation is fully verified.",
      "Do not create draft or speculative execution-log entries.",
    ],
    // This schema is an explicit extension of the canonical runtime execution log schema
    // defined in AI_PROJECT_INSTRUCTIONS.executionLog.requiredFields.
    // All eight canonical required fields are included below.
    // Install-specific extensions are annotated where they appear.
    schema: [
      // ── Canonical required fields (from AI_PROJECT_INSTRUCTIONS.executionLog.requiredFields) ──
      "id: next integer after last entry in PhaseExecutionLog",
      "date: ISO date string (YYYY-MM-DD)",
      "task: short label describing the install action (e.g. 'Install GovernanceHub Starter Kit')",
      "taskRequested: 'Install GovernanceHub Starter Kit'",
      // changedFiles is satisfied in the install context by the more granular
      // filesCreated + filesModified fields defined below (install-context extension).
      "changedFiles: combined list of all target paths created or modified during install",
      "diffSummary: 'Installed GovernanceHub Starter Kit v{version} from starter manifest.'",
      "githubVisibility: 'verified' only after target file existence is confirmed",
      "lockedFileVerification: 'confirmed unchanged' or exact description if locked files were touched",
      // ── Install-context extensions (additions beyond the canonical minimum) ──
      // filesCreated and filesModified are a granular decomposition of changedFiles,
      // providing install-specific distinction between newly created and updated files.
      "filesCreated: list of target paths that were newly created (install-context extension of changedFiles)",
      "filesModified: list of target paths that were updated or merged (install-context extension of changedFiles)",
      // commitRef is optional and only used when an actual commit SHA is known after a verified write.
      "commitRef: null unless actual commit SHA is known",
    ],
  },

  // ── currentStatus ──────────────────────────────────────────────────────────
  currentStatus: {
    description:
      "Starter-kit installation is currently preview-only. No automatic writes are allowed.",
    implemented: [
      "Manifest-driven file list",
      "Readiness check for canonical governance files",
      "Dry-run preview showing will_create, already_exists, and requires_manual_review",
      "Install-prompt with governance rules and step-by-step instructions",
      "Manual copy action gated by safe_to_install state only",
      "Canonical INSTALL_POLICY as explicit source of truth",
    ],
    notImplemented: [
      "Automatic repository writes",
      "Automatic installation function",
      "Automatic PhaseExecutionLog updates",
      "Destructive overwrite behavior",
      "Automated schema validation",
    ],
  },
};

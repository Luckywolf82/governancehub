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
  // Governance model for starter-kit installation lifecycle
  installMode: {
    name: "preview-and-manual-install",
    description: "Starter-kit installation is policy-driven and explicitly gated. No automatic repo writes are performed.",
    current: "preview and manual copy only",
    future: "automated install via approved backend function",
    constraints: [
      "All installation steps must follow this policy exactly.",
      "Dry-run preview is shown before any action is taken.",
      "Only safe-to-install readiness state permits copy action.",
      "No destructive operations are allowed.",
      "All writes must be verified against this policy.",
    ],
  },

  // ── createRules ────────────────────────────────────────────────────────────
  // Rules for creating new files and folders
  createRules: {
    description: "Files and folders may be created only when they do not already exist.",
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
  // Rules for handling files that already exist
  overwriteRules: {
    description: "Files must never be blindly overwritten. Strict preservation logic applies.",
    locked_files: [
      "NEVER overwrite canonical locked governance files without explicit approval.",
      "Locked files: AI_STATE, LockedFiles, PhaseExecutionLog, AI_PROJECT_INSTRUCTIONS",
      "If locked file exists and is non-empty → requires manual audit/merge decision.",
      "Locked file verification must be recorded in PhaseExecutionLog.",
    ],
    project_specific: [
      "NEVER overwrite files containing real project-specific content.",
      "Project-specific files are identified by having non-placeholder, non-empty export bodies.",
      "If such a file exists → move to requires_manual_review category.",
      "User must manually merge or decide which version to keep.",
    ],
    placeholders: [
      "Only replace obvious placeholder stubs (null, TODO, PLACEHOLDER, empty export bodies).",
      "Placeholder detection: check for export stub with no implementation.",
      "If unclear whether file is placeholder or project-specific → require manual review.",
      "Conservative approach: when in doubt, ask user to decide.",
    ],
  },

  // ── lockedFileRules ────────────────────────────────────────────────────────
  // Explicit locked file constraints
  lockedFileRules: {
    description: "Locked files are system governance files that must not be overwritten blindly.",
    canonical_locked_files: [
      "src/components/governance/AI_STATE.jsx",
      "src/components/governance/LockedFiles.jsx",
      "src/components/governance/PhaseExecutionLog.jsx",
      "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
      "src/components/projects/PROJECT_REGISTRY.jsx",
    ],
    approval_requirement: [
      "If any canonical locked file already exists in target repo → installation is blocked.",
      "Blocked state: existing_governance_detected",
      "User must perform audit/merge review before proceeding.",
      "Guidance for user: compare starter-kit canonical version with existing project version.",
    ],
    partial_governance: [
      "If only some locked files exist (not all) → partial_governance_detected state.",
      "Partial state also requires audit/merge review before installation.",
      "User must reconcile which files should be updated and which should remain.",
    ],
  },

  // ── reviewRules ────────────────────────────────────────────────────────────
  // Rules for requiring manual review
  reviewRules: {
    description: "Manual review is required when safe-to-install conditions are not met.",
    existing_governance: [
      "Trigger: All canonical locked governance files exist in target repo.",
      "Action: Block installation. User must audit and decide on merge strategy.",
      "Message: 'Eksisterende governance oppdaget — ikke installer blindt. Gjør en audit/merge-vurdering først.'",
    ],
    partial_governance: [
      "Trigger: Some (but not all) canonical locked files exist.",
      "Action: Block installation. User must reconcile missing vs. existing files.",
      "Message: 'Delvis governance oppdaget — audit/merge kreves før installasjon.'",
    ],
    conflicting_files: [
      "Trigger: Non-locked files exist but are not empty placeholders.",
      "Action: Classify as requires_manual_review, not will_create.",
      "User must decide: keep existing or accept starter-kit version.",
    ],
  },

  // ── verificationRules ──────────────────────────────────────────────────────
  // Rules for verifying successful installation
  verificationRules: {
    description: "After any installation action, verification must confirm exact state.",
    path_verification: [
      "Verify exact target path exists after copy (case-sensitive).",
      "Path format: src/components/{module}/{filename}",
      "Mismatch = installation failure. Do not record until verified.",
    ],
    casing_verification: [
      "Verify file names and casing match exactly.",
      "Case-sensitive file systems must match case; case-insensitive systems must still use correct casing in records.",
      "Casing error = installation failure.",
    ],
    content_verification: [
      "Verify copied files are not placeholder stubs.",
      "No null, TODO, PLACEHOLDER, or empty export bodies in final file.",
      "Content error = installation failure.",
    ],
    locked_file_verification: [
      "Verify locked files (AI_STATE, LockedFiles, PhaseExecutionLog, AI_PROJECT_INSTRUCTIONS) were not unintentionally modified.",
      "If locked files were touched → record exact changes in PhaseExecutionLog.lockedFileVerification.",
      "Verify unchanged = 'confirmed unchanged'",
      "Verify changed = describe exact change rationale",
    ],
  },

  // ── readinessRules ────────────────────────────────────────────────────────
  // Rules governing installation readiness state machine
  readinessRules: {
    description: "Installation readiness is determined by repository governance state.",
    safe_to_install: [
      "Condition: No canonical locked governance files exist in target repo.",
      "Result: safe_to_install readiness state.",
      "Action: Copy button is enabled. User can copy install-prompt.",
      "Message: 'Starter kit er klar for installasjon'",
    ],
    existing_governance_detected: [
      "Condition: All canonical locked files (4 files) exist in target repo.",
      "Result: existing_governance_detected readiness state.",
      "Action: Installation is BLOCKED. Copy button disabled.",
      "Message: 'Eksisterende governance oppdaget — ikke installer blindt.'",
    ],
    partial_governance_detected: [
      "Condition: Some (1-3) canonical locked files exist.",
      "Result: partial_governance_detected readiness state.",
      "Action: Installation is BLOCKED. Copy button disabled.",
      "Message: 'Delvis governance oppdaget — audit/merge kreves før installasjon.'",
    ],
    verification_failed: [
      "Condition: Repository verification call fails (API error, no access, etc.).",
      "Result: verification_failed readiness state.",
      "Action: Installation is BLOCKED. Copy button disabled.",
      "Message: 'Verifisering feilet — bekreft repo-tilgang før installasjon.'",
    ],
    idle: [
      "Condition: No readiness check has been run yet.",
      "Result: idle readiness state.",
      "Action: Copy button is disabled. User must run readiness check first.",
      "Message: 'Kjør readiness-sjekken ovenfor for å aktivere denne handlingen.'",
    ],
    checking: [
      "Condition: Readiness check is currently running.",
      "Result: checking readiness state.",
      "Action: Copy button is disabled. User waits for check to complete.",
      "Message: 'Sjekker repo for eksisterende governance-filer…'",
    ],
    repo_not_connected: [
      "Condition: No active repository is selected.",
      "Result: repo_not_connected readiness state.",
      "Action: All functionality blocked. User must select repo first.",
      "Message: 'Velg et aktivt repo og kjør readiness-sjekk før installasjon.'",
    ],
  },

  // ── previewRules ───────────────────────────────────────────────────────────
  // Rules for dry-run preview display
  previewRules: {
    description: "Preview shows exact installation plan without performing any writes.",
    three_groups: [
      "will_create: Target files that do not exist (will be created)",
      "already_exists: Target files that exist AND are canonical governance files",
      "requires_manual_review: Files with API errors OR files that exist but are non-canonical",
    ],
    computation: [
      "For each manifest file: construct target path src/components/{path}",
      "Check target path existence via getGithubRepoContents function",
      "Classify based on existence + canonical status",
    ],
    display: [
      "Show file counts for each group.",
      "Expandable sections list files in each group.",
      "Mark errors in requires_manual_review group.",
      "Preview is read-only. No actions triggered from preview.",
    ],
  },

  // ── loggingRules ───────────────────────────────────────────────────────────
  // Rules for recording installation in PhaseExecutionLog
  loggingRules: {
    description: "Installation must be recorded in PhaseExecutionLog only after verification is complete.",
    timing: [
      "NEVER append PhaseExecutionLog entry until installation is fully verified.",
      "PhaseExecutionLog entry is appended after all files are confirmed in target repo.",
      "Premature logging = audit failure. Do not create draft entries.",
    ],
    schema: [
      "id: next integer after last entry in PhaseExecutionLog",
      "date: ISO date string (YYYY-MM-DD) of installation date",
      "taskRequested: 'Install GovernanceHub Starter Kit'",
      "filesCreated: [ /* list of target paths that were newly created */ ]",
      "filesModified: [ /* list of target paths that were updated or merged */ ]",
      "diffSummary: 'Installed GovernanceHub Starter Kit v{version} from starter manifest.'",
      "commitRef: null (set to commit SHA if known)",
      "githubVisibility: 'verified' (only after file existence is confirmed)",
      "lockedFileVerification: 'confirmed unchanged' (or describe changes if locked files were touched)",
    ],
  },

  // ── currentStatus ──────────────────────────────────────────────────────────
  // Current implementation status
  currentStatus: {
    description: "Starter-kit installation is in preview-only phase. No automatic writes.",
    implemented: [
      "Manifest-driven file list",
      "Readiness check for canonical locked files",
      "Dry-run preview showing will_create, already_exists, requires_manual_review",
      "Install-prompt with governance rules and step-by-step instructions",
      "Manual copy action (gated by safe_to_install state only)",
      "This INSTALL_POLICY as explicit source of truth",
    ],
    not_implemented: [
      "Automatic repository writes",
      "Automatic installation function",
      "Automatic PhaseExecutionLog updates",
      "Destructive overwrite behavior",
      "Automated schema validation",
    ],
    future_phases: [
      "Phase 2: Approved write automation (backend function)",
      "Phase 3: Full CI/CD integration",
      "Phase 4: Multi-repo batch installation",
      "Phase 5: Governance reconciliation automation",
    ],
  },
};
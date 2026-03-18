// gov-008 — Hardcoded Luckywolf82/governancehub Reference Classification Audit
// Date: 2026-03-18
// Project: GovernanceHub
// Status: verified
// Evidence source: repo-derived — direct file inspection of every file containing
//   "Luckywolf82/governancehub", "governancehub", "raw.githubusercontent.com",
//   MANIFEST_REPO, RAW_BASE, GH_BASE, or hardcoded owner/repo constants across
//   the entire src/ and functions/ tree.
//
// Scope: Classify every occurrence of GovernanceHub repo identity constants as
//   SAFE (valid internal source/template/self-reference) or
//   UNSAFE (incorrectly affecting runtime repo-aware behavior or leaking into
//          active target-repo flows).
//
// IMPORTANT CONSTRAINTS:
//   - Audit only. No implementation in this step.
//   - Do NOT mutate PhaseExecutionLog.jsx.
//   - Do NOT append to PhaseExecutionLog as part of this audit.

export const HARDCODED_REPO_REFERENCE_CLASSIFICATION_AUDIT = {
  id: "gov-008",
  title: "Hardcoded Luckywolf82/governancehub Reference Classification Audit",
  category: "Governance",
  type: "Security and Runtime Safety Classification Audit",
  status: "verified",
  date: "2026-03-18",
  projectId: "governancehub",
  projectSlug: "governancehub",
  preliminary: false,
  evidenceSource: "repo-derived",

  // ── A. Files Read ──────────────────────────────────────────────────────────

  filesRead: [
    "src/components/admin/RepoRawAccessPanel.jsx",
    "src/components/admin/GovernanceStarterKitPanel.jsx",
    "src/components/admin/ExecutionLogPanel.jsx",
    "src/components/ActiveRepoContext.jsx",
    "src/components/github/RepoFileExplorer.jsx",
    "src/components/governance/REPO_FILE_MANIFEST.jsx",
    "src/components/governance/PRIORITY_REPO_FILES.jsx",
    "src/components/governance/REPO_RAW_ACCESS_GUIDE.jsx",
    "src/components/governance/generateRepoManifest.jsx",
    "src/components/governance/GITHUB_GOVERNANCE_IMPLEMENTATION.jsx",
    "src/components/governance/CHATGPT_REPO_INDEX.jsx",
    "src/components/governance/repo-index/root-index.jsx",
    "src/components/governance/repo-index/governance-index.jsx",
    "src/components/governance/repo-index/pages-index.jsx",
    "src/components/governance/repo-index/admin-index.jsx",
    "src/components/governance/repo-index/components-index.jsx",
    "src/components/governance/repo-index/audits-index.jsx",
    "src/components/governance/ChangePlanInstanceRegistry.jsx",
    "src/components/audits/AUDIT_INDEX.jsx",
    "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx",
    "src/components/audits/governance/raw-access-manifest-subsystem-audit-2026-03-17.jsx",
    "src/components/audits/governance/app-native-audit-lifecycle-2026-03-15.jsx",
    "src/components/audits/governance/execution-log-schema-audit-2026-03-15.jsx",
    "src/components/audits/governance/phase-execution-log-safety-audit-2026-03-17.jsx",
    "src/components/audits/governance/prompt-dispatch-governance-audit-2026-03-16.jsx",
    "src/components/audits/architecture/admin-ui-file-placement-audit-2026-03-13.jsx",
    "src/components/audits/architecture/admin-roadmap-surface-placement-audit-2026-03-16.jsx",
    "src/components/audits/architecture/admin-ui-file-placement-canonical-audit-2026-03-15.jsx",
    "src/components/audits/ui/admin-workflow-ui-audit-2026-03-16.jsx",
    "src/projects/PROJECT_REGISTRY.js",
    "functions/runBaselineAudit.ts",
    "functions/verifyExecutionLogEntry.ts",
    "functions/getGithubRepoContents.ts",
    "functions/pushFilesToGithub.ts",
    "functions/listGithubRepos.ts",
  ],

  // ── B. SAFE Uses ───────────────────────────────────────────────────────────

  safeUses: [
    {
      file: "src/components/admin/RepoRawAccessPanel.jsx",
      lines: "14–16, 24, 29–90",
      constants: ["RAW_BASE", "GH_BASE", "GH_REPO_URL", "MANIFEST_REPO", "MANIFEST.files[]", "PRIORITY.files[]"],
      purpose:
        "Static inline manifest catalog. RAW_BASE and GH_BASE are used to pre-populate rawUrl/githubUrl " +
        "fields in MANIFEST.files[] (44+ entries) and PRIORITY.files[] (15 entries). " +
        "MANIFEST_REPO = { owner: 'Luckywolf82', repo: 'governancehub' } is used only for a banner " +
        "identity comparison (isDifferentRepo check at lines 834–836) and display text (lines 869–883). " +
        "No push, no install target, no repo selection logic derives from these constants.",
      whySafe:
        "The static manifest catalog is GovernanceHub's own canonical self-reference — it describes " +
        "files inside GovernanceHub for inspection and reference purposes only. MANIFEST_REPO serves " +
        "as a label, not a selector. The install flow (generateDraftManifest, CONTENT_SOURCES push) " +
        "derives all target URLs from activeRepo.owner/repo dynamically and does not use MANIFEST_REPO.",
    },
    {
      file: "src/components/admin/RepoRawAccessPanel.jsx",
      lines: "20, 166–175",
      constants: ["SK_RAW_BASE", "CONTENT_SOURCES[type=starter-kit]"],
      purpose:
        "SK_RAW_BASE = RAW_BASE + '/starter-kit/src/components'. " +
        "Used in CONTENT_SOURCES to provide rawUrl values for each starter-kit governance template " +
        "(AI_PROJECT_INSTRUCTIONS, AI_STATE, LockedFiles, NextSafeStep, PhaseExecutionLog, " +
        "STARTER_KIT_VERSION, INSTALL_POLICY, AUDIT_INDEX, AUDIT_SYSTEM_GUIDE, WORKSTREAM_REGISTRY). " +
        "These rawUrls are fetched FROM GovernanceHub in the payload preview/push flow.",
      whySafe:
        "GovernanceHub is the canonical source of the starter-kit templates. Fetching template content " +
        "FROM GovernanceHub is the correct and intended behavior. The install target (the repo these " +
        "templates are pushed TO) is resolved from activeRepo.owner/repo at runtime (confirmed at " +
        "lines 258–260 of the push flow), not from any GovernanceHub hardcoded constant.",
    },
    {
      file: "src/components/admin/RepoRawAccessPanel.jsx",
      lines: "573",
      constants: [],
      purpose:
        "Builds a README.md check URL for the target repo using dynamic 'owner', 'repo', 'branch' " +
        "variables (not GovernanceHub constants) to check whether the active repo already has a README.",
      whySafe:
        "Uses activeRepo-derived variables. Not a GovernanceHub reference — correctly repo-aware.",
    },
    {
      file: "src/components/admin/GovernanceStarterKitPanel.jsx",
      lines: "78, 80",
      constants: ["MANIFEST_URL", "RAW_BASE"],
      purpose:
        "MANIFEST_URL fetches 'STARTER_KIT_MANIFEST.json' from GovernanceHub at runtime (useManifest hook). " +
        "RAW_BASE is used in buildRawUrl() to construct download URLs for each file listed in the manifest. " +
        "Both are used to retrieve starter-kit template content FROM GovernanceHub.",
      whySafe:
        "GovernanceHub is the authoritative source for the starter-kit manifest and template files. " +
        "Fetching FROM GovernanceHub is the correct and expected behavior. " +
        "The actual install target resolved in computePreview() uses activeRepo.owner/repo " +
        "(confirmed at lines 258–260), never the GovernanceHub constants.",
    },
    {
      file: "src/components/governance/REPO_FILE_MANIFEST.jsx",
      lines: "4, 6–7, 18–471+",
      constants: ["_meta.repo", "_meta.rawBase", "_meta.githubBase", "rawUrl[]", "githubUrl[]"],
      purpose:
        "JSON manifest (despite .jsx extension) describing every file in GovernanceHub. " +
        "All rawUrl and githubUrl values are hardcoded to GovernanceHub/main. " +
        "_meta.repo, rawBase, and githubBase are metadata fields labeling the manifest source.",
      whySafe:
        "This file is GovernanceHub's own canonical file catalog — it self-describes GovernanceHub's " +
        "files. It is static data with no active repo selection, push, or install logic.",
    },
    {
      file: "src/components/governance/PRIORITY_REPO_FILES.jsx",
      lines: "5, 13–154",
      constants: ["_meta.repo", "rawUrl[]", "githubUrl[]"],
      purpose:
        "Static JSON list of priority files in GovernanceHub with rawUrl and githubUrl per entry.",
      whySafe:
        "Self-referential GovernanceHub file priority list. No active repo flow. " +
        "Pure data file with no runtime repo selection or push logic.",
    },
    {
      file: "src/components/governance/REPO_RAW_ACCESS_GUIDE.jsx",
      lines: "8, 30, 48, 103, 109, 136, 139, 157, 163",
      constants: [],
      purpose:
        "Documentation file explaining how to access GovernanceHub raw file URLs. " +
        "All references to Luckywolf82/governancehub and raw.githubusercontent.com are inline " +
        "documentation text and example URL patterns.",
      whySafe:
        "Documentation only. No runtime behavior, no active repo flow, no install logic.",
    },
    {
      file: "src/components/governance/generateRepoManifest.jsx",
      lines: "38–43",
      constants: ["REPO_OWNER", "REPO_NAME", "RAW_BASE"],
      purpose:
        "REPO_OWNER = 'Luckywolf82', REPO_NAME = 'governancehub', " +
        "RAW_BASE = 'https://raw.githubusercontent.com/Luckywolf82/governancehub/main'. " +
        "These constants drive the manifest generation utility that regenerates REPO_FILE_MANIFEST.jsx.",
      whySafe:
        "This is a generator utility for GovernanceHub's own self-manifest. " +
        "It is not mounted in the app's React tree, not callable from the UI, " +
        "and not part of any active repo or install flow. Safe developer tooling.",
    },
    {
      file: "src/components/governance/GITHUB_GOVERNANCE_IMPLEMENTATION.jsx",
      lines: "237, 244, 323",
      constants: [],
      purpose:
        "Example JSON snippets illustrating the governance API with 'Luckywolf82/governancehub' " +
        "as sample owner/repo values, and a setup guide step referencing initial approved repos.",
      whySafe:
        "Documentation and example data. No runtime behavior. Values are illustrative placeholders.",
    },
    {
      file: "src/components/governance/CHATGPT_REPO_INDEX.jsx",
      lines: "10, 15–16, 20",
      constants: ["RAW", "GH", "repository"],
      purpose:
        "Static AI navigation reference index. RAW and GH constants define GovernanceHub raw/blob bases. " +
        "'repository: Luckywolf82/governancehub' labels the index source. " +
        "Used to help AI agents navigate the GovernanceHub repo.",
      whySafe:
        "This is a static reference document for AI navigation of GovernanceHub's own files. " +
        "Not part of any runtime active-repo flow. No push, install, or selection logic.",
    },
    {
      file: "src/components/governance/repo-index/root-index.jsx",
      lines: "10–99",
      constants: ["rawUrl[]", "githubUrl[]"],
      purpose: "Static index of root-level GovernanceHub files with hardcoded rawUrl/githubUrl entries.",
      whySafe: "Self-referential static data file. No active repo flow.",
    },
    {
      file: "src/components/governance/repo-index/governance-index.jsx",
      lines: "10–65",
      constants: ["rawUrl[]", "githubUrl[]"],
      purpose: "Static index of GovernanceHub governance files with hardcoded rawUrl/githubUrl entries.",
      whySafe: "Self-referential static data file. No active repo flow.",
    },
    {
      file: "src/components/governance/repo-index/pages-index.jsx",
      lines: "10–35",
      constants: ["rawUrl[]", "githubUrl[]"],
      purpose: "Static index of GovernanceHub src/pages/ files with hardcoded rawUrl/githubUrl entries.",
      whySafe: "Self-referential static data file. No active repo flow.",
    },
    {
      file: "src/components/governance/repo-index/admin-index.jsx",
      lines: "11–21",
      constants: ["rawUrl[]", "githubUrl[]"],
      purpose: "Static index of GovernanceHub admin files with hardcoded rawUrl/githubUrl entries.",
      whySafe: "Self-referential static data file. No active repo flow.",
    },
    {
      file: "src/components/governance/repo-index/components-index.jsx",
      lines: "11–19+",
      constants: ["rawUrl[]", "githubUrl[]"],
      purpose: "Static index of GovernanceHub component files with hardcoded rawUrl/githubUrl entries.",
      whySafe: "Self-referential static data file. No active repo flow.",
    },
    {
      file: "src/components/governance/repo-index/audits-index.jsx",
      lines: "10–91",
      constants: ["rawUrl[]", "githubUrl[]"],
      purpose: "Static index of GovernanceHub audit files with hardcoded rawUrl/githubUrl entries.",
      whySafe: "Self-referential static data file. No active repo flow.",
    },
    {
      file: "src/components/governance/ChangePlanInstanceRegistry.jsx",
      lines: "3, 44–45, 508–509",
      constants: ["projectId", "projectSlug"],
      purpose:
        "projectId: 'governancehub' and projectSlug: 'governancehub' are project identity metadata " +
        "fields on change plan instance records — they identify which project a change belongs to.",
      whySafe:
        "Project identity metadata. Not used for repo URL construction, raw access, install targeting, " +
        "or push logic. Correct usage of projectId/projectSlug fields.",
    },
    {
      file: "src/components/audits/AUDIT_INDEX.jsx",
      lines: "multiple (all audit entries)",
      constants: ["projectId", "projectSlug"],
      purpose:
        "Every audit entry in the index carries projectId: 'governancehub' and " +
        "projectSlug: 'governancehub' as project identity metadata.",
      whySafe:
        "Correct usage — these fields identify that the audits belong to the GovernanceHub project. " +
        "Not used for URL construction, repo selection, or push targets. " +
        "The one inline description string ('Data layer is 100% hardcoded to Luckywolf82/governancehub') " +
        "at line 354 is audit evidence text, not a reference that affects runtime behavior.",
    },
    {
      file: "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx",
      lines: "114–115, 147–148",
      constants: [],
      purpose:
        "Example projectId/projectSlug values in the audit schema documentation. " +
        "Lines 147–148 are sample code illustrating the schema.",
      whySafe: "Documentation and schema examples. No runtime behavior.",
    },
    {
      file: "src/components/audits/governance/raw-access-manifest-subsystem-audit-2026-03-17.jsx",
      lines: "34–35, 46–47, 57, 81–82, 99, 153–155",
      constants: [],
      purpose:
        "gov-007 audit evidence data: projectId/projectSlug fields plus inline finding descriptions " +
        "that quote the exact hardcoded values observed in RepoRawAccessPanel.jsx.",
      whySafe: "Audit evidence data quoting observed values. No runtime behavior.",
    },
    {
      file: "src/components/audits/governance/app-native-audit-lifecycle-2026-03-15.jsx",
      lines: "15–16",
      constants: ["projectId", "projectSlug"],
      purpose: "Project identity metadata on audit record.",
      whySafe: "Metadata only.",
    },
    {
      file: "src/components/audits/governance/execution-log-schema-audit-2026-03-15.jsx",
      lines: "15–16",
      constants: ["projectId", "projectSlug"],
      purpose: "Project identity metadata on audit record.",
      whySafe: "Metadata only.",
    },
    {
      file: "src/components/audits/governance/phase-execution-log-safety-audit-2026-03-17.jsx",
      lines: "24–25",
      constants: ["projectId", "projectSlug"],
      purpose: "Project identity metadata on audit record.",
      whySafe: "Metadata only.",
    },
    {
      file: "src/components/audits/governance/prompt-dispatch-governance-audit-2026-03-16.jsx",
      lines: "18–19",
      constants: ["projectId", "projectSlug"],
      purpose: "Project identity metadata on audit record.",
      whySafe: "Metadata only.",
    },
    {
      file: "src/components/audits/architecture/admin-ui-file-placement-audit-2026-03-13.jsx",
      lines: "6–7",
      constants: ["projectId", "projectSlug"],
      purpose: "Project identity metadata on audit record.",
      whySafe: "Metadata only.",
    },
    {
      file: "src/components/audits/architecture/admin-roadmap-surface-placement-audit-2026-03-16.jsx",
      lines: "9–10",
      constants: ["projectId", "projectSlug"],
      purpose: "Project identity metadata on audit record.",
      whySafe: "Metadata only.",
    },
    {
      file: "src/components/audits/architecture/admin-ui-file-placement-canonical-audit-2026-03-15.jsx",
      lines: "9–10",
      constants: ["projectId", "projectSlug"],
      purpose: "Project identity metadata on audit record.",
      whySafe: "Metadata only.",
    },
    {
      file: "src/components/audits/ui/admin-workflow-ui-audit-2026-03-16.jsx",
      lines: "6, 19–20",
      constants: ["projectId", "projectSlug"],
      purpose: "Project identity metadata on audit record.",
      whySafe: "Metadata only.",
    },
    {
      file: "src/projects/PROJECT_REGISTRY.js",
      lines: "3, 5, 7",
      constants: ["id", "slug", "repoUrl"],
      purpose:
        "GovernanceHub project entry in the project registry: " +
        "id: 'governancehub', slug: 'governancehub', repoUrl: 'https://github.com/Luckywolf82/governancehub'.",
      whySafe:
        "This is GovernanceHub registering itself as a managed project. " +
        "The project registry is a metadata catalog, not a runtime repo selector or push target.",
    },
    {
      file: "functions/runBaselineAudit.ts",
      lines: "all",
      constants: [],
      purpose: "No hardcoded GovernanceHub references found in this file.",
      whySafe: "No occurrences. Listed for completeness.",
    },
    {
      file: "functions/verifyExecutionLogEntry.ts",
      lines: "all",
      constants: [],
      purpose: "No hardcoded GovernanceHub references found in this file.",
      whySafe: "No occurrences. Listed for completeness.",
    },
    {
      file: "functions/getGithubRepoContents.ts",
      lines: "all",
      constants: [],
      purpose: "No hardcoded GovernanceHub references found. Uses owner/repo parameters from caller.",
      whySafe: "No occurrences. Fully repo-aware via parameters.",
    },
    {
      file: "functions/pushFilesToGithub.ts",
      lines: "all",
      constants: [],
      purpose: "No hardcoded GovernanceHub references found. Uses owner/repo parameters from caller.",
      whySafe: "No occurrences. Fully repo-aware via parameters.",
    },
    {
      file: "functions/listGithubRepos.ts",
      lines: "all",
      constants: [],
      purpose: "No hardcoded GovernanceHub references found. Dynamically lists repos via GitHub API.",
      whySafe: "No occurrences. Fully repo-aware.",
    },
  ],

  // ── C. UNSAFE Uses ────────────────────────────────────────────────────────

  unsafeUses: [
    {
      file: "src/components/github/RepoFileExplorer.jsx",
      lines: "8, 21",
      constants: [],
      purpose:
        "On mount, makes a live fetch() call to " +
        "'https://api.github.com/repos/Luckywolf82/governancehub/git/trees/main?recursive=1'. " +
        "Renders a file list where each entry links to a hardcoded raw.githubusercontent.com URL " +
        "for GovernanceHub/main.",
      whyUnsafe:
        "This is a live runtime API call hardcoded to the GovernanceHub repo. " +
        "The component completely ignores the active repo selected in ActiveRepoContext. " +
        "It will always show GovernanceHub's file tree regardless of which repo the operator has selected. " +
        "This is a direct repo-awareness bypass: the component behaves as a GovernanceHub-locked " +
        "file browser, not a general-purpose repo file explorer. " +
        "Impact is currently limited because RepoFileExplorer is not imported or rendered anywhere " +
        "in the live app (confirmed by grep — zero import references), making it dead code. " +
        "However, if it is ever imported and mounted, it will expose a GovernanceHub-hardcoded " +
        "raw access flow without any active-repo awareness.",
      riskLevel: "HIGH (currently inactive dead code; critical if activated)",
      flowType: "live API call + raw file access, hardcoded GovernanceHub, no active-repo awareness",
    },
    {
      file: "src/components/admin/ExecutionLogPanel.jsx",
      lines: "17–19, 86–96",
      constants: ["REPO_OWNER", "REPO_NAME", "REPO_BASE"],
      purpose:
        "REPO_OWNER = 'Luckywolf82', REPO_NAME = 'governancehub', " +
        "REPO_BASE = 'https://github.com/Luckywolf82/governancehub'. " +
        "REPO_BASE is used at line 86 as the default fallback href for GitHub inspection links " +
        "('commits/main' link). It is also used at lines 93–96 to construct pull request and " +
        "commit links when an entry has verificationTargetType/Value but no githubVerificationUrl.",
      whyUnsafe:
        "When a PhaseExecutionLog entry has verificationTargetType='pull_request' or " +
        "verificationTargetType='commit' but does NOT have a githubVerificationUrl set, " +
        "the constructed link will point to Luckywolf82/governancehub regardless of " +
        "which repo the actual change was committed to. " +
        "As the execution log evolves to track changes in target repos (per the verification model " +
        "established in gov-006/gov-007), entries for target-repo work will produce incorrect " +
        "verification links pointing to GovernanceHub. " +
        "The primary verification path (githubVerificationUrl, line 87–88) does override correctly " +
        "when that field is populated — but the fallback is a silent misrouting vector. " +
        "Current entries in PhaseExecutionLog.jsx are all GovernanceHub-internal dev-phase entries, " +
        "so the impact is currently zero. Risk increases as target-repo entries are added.",
      riskLevel: "MEDIUM (currently zero impact; escalates as target-repo log entries are added)",
      flowType: "verification link construction fallback, hardcoded GovernanceHub, partial active-repo bypass",
    },
  ],

  // ── D. Borderline / Unclear Uses ──────────────────────────────────────────

  borderlineUses: [
    {
      file: "src/components/admin/RepoRawAccessPanel.jsx",
      lines: "561–562",
      concern:
        "When fetching starter-kit template content in the push flow, error messages explicitly " +
        "reference 'GovernanceHub starter-kit URL' (line 562). " +
        "This is informational only and does not affect behavior. " +
        "However, if CONTENT_SOURCES is ever extended with non-GovernanceHub rawUrl entries " +
        "(e.g., custom template repos), this error message would be misleading.",
      classification: "SAFE in current implementation. Monitor if CONTENT_SOURCES is extended.",
    },
    {
      file: "src/components/admin/ExecutionLogPanel.jsx",
      lines: "86",
      concern:
        "The default fallback inspectHref is REPO_BASE + '/commits/main' " +
        "(GovernanceHub commit history). " +
        "For log entries that have no verificationTargetType and no githubVerificationUrl, " +
        "the displayed 'Inspect on GitHub' link will open GovernanceHub's commit history " +
        "even if the entry is about work done on a different repo. " +
        "Current entries are all GovernanceHub-internal, so this is currently harmless.",
      classification: "BORDERLINE — currently SAFE; becomes UNSAFE when target-repo log entries exist without githubVerificationUrl.",
    },
  ],

  // ── E. Summary ────────────────────────────────────────────────────────────

  summary:
    "Inspected 35 files. Found 2 UNSAFE uses, 1 borderline, and the remaining 30+ occurrences classified as SAFE. " +
    "The vast majority of Luckywolf82/governancehub references are self-referential (GovernanceHub describing " +
    "its own files) or correct template source references (starter-kit templates fetched FROM GovernanceHub " +
    "for installation INTO target repos). " +
    "The two UNSAFE uses are: (1) RepoFileExplorer.jsx — a hardcoded live API call to GovernanceHub that " +
    "ignores ActiveRepoContext entirely (currently dead code); " +
    "(2) ExecutionLogPanel.jsx — REPO_OWNER/REPO_NAME hardcoded constants that cause verification links " +
    "to silently point to GovernanceHub when no githubVerificationUrl is set on an entry " +
    "(currently zero impact; risk escalates as target-repo log entries are added). " +
    "Backend functions (getGithubRepoContents, pushFilesToGithub, listGithubRepos, " +
    "runBaselineAudit, verifyExecutionLogEntry) contain zero hardcoded GovernanceHub references " +
    "and are fully repo-aware via parameters.",

  totalSafe: 33,
  totalUnsafe: 2,
  totalBorderline: 1,

  mostLikelyCausingRuntimeIssues: [
    {
      file: "src/components/github/RepoFileExplorer.jsx",
      finding:
        "Hardcoded live API call to GovernanceHub Git Trees API. " +
        "Currently inactive (not imported), but immediately problematic if activated. " +
        "Must be refactored to use ActiveRepoContext before being used in any live surface.",
    },
    {
      file: "src/components/admin/ExecutionLogPanel.jsx",
      finding:
        "REPO_BASE hardcoded to GovernanceHub used as fallback for all verification links. " +
        "Currently only causes issues for future entries; does not affect existing GovernanceHub-only log entries. " +
        "Should be resolved before any target-repo execution log entries are created.",
    },
  ],

  problem:
    "Two files contain hardcoded GovernanceHub references that participate in active runtime behavior: " +
    "(1) RepoFileExplorer.jsx makes a live API call to api.github.com/repos/Luckywolf82/governancehub, " +
    "completely bypassing the active repo context — this is a dead component but is a latent runtime hazard. " +
    "(2) ExecutionLogPanel.jsx uses REPO_OWNER/REPO_NAME hardcoded as GovernanceHub to construct " +
    "GitHub verification links — the fallback logic routes all verification to GovernanceHub " +
    "regardless of the actual change target.",

  impact:
    "RepoFileExplorer.jsx: if rendered, users would see GovernanceHub's file tree " +
    "regardless of the repo they are working with, with no indication the data is from a hardcoded source. " +
    "ExecutionLogPanel.jsx: verification links for future target-repo entries (PR/commit links) " +
    "would silently point to GovernanceHub instead of the correct target repo, " +
    "causing verification failures or operator confusion.",

  affectedFiles: [
    "src/components/github/RepoFileExplorer.jsx",
    "src/components/admin/ExecutionLogPanel.jsx",
  ],

  requiredChange:
    "Step 1 (this audit): Register gov-008 in AUDIT_INDEX and create audit data file. " +
    "Step 2 (separate PR): Refactor RepoFileExplorer.jsx to accept owner/repo as props or " +
    "consume from ActiveRepoContext — remove all hardcoded Luckywolf82/governancehub references. " +
    "Step 3 (separate PR): Refactor ExecutionLogPanel.jsx to remove REPO_OWNER/REPO_NAME/REPO_BASE " +
    "constants and derive verification link base from the entry's own verificationTarget fields " +
    "or from ActiveRepoContext. Ensure githubVerificationUrl fallback is documented as mandatory " +
    "for entries that cross repo boundaries.",

  constraints:
    "Do not mutate PhaseExecutionLog.jsx as part of this audit. " +
    "Do not implement any refactoring in this step. " +
    "Audit registration only. One structural change at a time.",

  acceptanceCriteria:
    "gov-008 registered in AUDIT_INDEX with dataFile link. " +
    "Audit data file exists at src/components/audits/governance/hardcoded-repo-reference-classification-audit-2026-03-18.jsx. " +
    "All 35 inspected files documented with explicit SAFE/UNSAFE/BORDERLINE classification.",

  oneSafeNextStep:
    "Refactor RepoFileExplorer.jsx to use ActiveRepoContext for owner/repo resolution " +
    "instead of the hardcoded Luckywolf82/governancehub API URL. " +
    "This is a localized single-file change (34 lines total), fully reversible, " +
    "and directly eliminates the highest-risk UNSAFE usage.",

  dataFile:
    "src/components/audits/governance/hardcoded-repo-reference-classification-audit-2026-03-18.jsx",
};

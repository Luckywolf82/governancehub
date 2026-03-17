// gov-007 — Raw-Access / Manifest / Repo-Index Subsystem Audit
// Date: 2026-03-17
// Project: GovernanceHub
// Status: verified
// Evidence source: repo-derived — direct file inspection of:
//   src/components/admin/RepoRawAccessPanel.jsx
//   src/components/ActiveRepoContext.jsx
//   src/components/governance/REPO_FILE_MANIFEST.jsx
//   src/components/governance/repo-index/pages-index.jsx
//   src/components/governance/repo-index/admin-index.jsx
//   src/components/governance/repo-index/components-index.jsx
//   src/components/governance/repo-index/governance-index.jsx
//   src/components/governance/repo-index/root-index.jsx
//   src/components/governance/repo-index/audits-index.jsx
//   src/components/audits/AUDIT_INDEX.jsx
//   src/components/audits/AUDIT_SYSTEM_GUIDE.jsx
//
// Scope: Determine the safest architecture path from the current GovernanceHub-specific
// scaffold mode toward a repo-aware, approval-gated generation/push model.
//
// IMPORTANT CONSTRAINTS (from problem statement):
//   - Audit only. No implementation in this step.
//   - Do NOT mutate PhaseExecutionLog.jsx.
//   - Do NOT append to PhaseExecutionLog as part of this audit.
//   - Explicit approval before push must be treated as a governance requirement.

export const RAW_ACCESS_MANIFEST_SUBSYSTEM_AUDIT = {
  id: "gov-007",
  title: "Raw-Access / Manifest / Repo-Index Subsystem Architecture Audit",
  category: "Governance",
  type: "Architecture and Mode Classification Audit",
  status: "verified",
  date: "2026-03-17",
  projectId: "governancehub",
  projectSlug: "governancehub",
  preliminary: false,
  evidenceSource: "repo-derived",

  // ── A. Files Read ──────────────────────────────────────────────────────────

  filesRead: [
    {
      path: "src/components/admin/RepoRawAccessPanel.jsx",
      purpose: "Primary subject — manifest data layer, repo-awareness shim, UI rendering logic",
      observations: [
        "Defines RAW_BASE and GH_BASE as hardcoded string constants for Luckywolf82/governancehub/main.",
        "Defines MANIFEST_REPO = { owner: 'Luckywolf82', repo: 'governancehub' } — used for repo identity comparison only.",
        "Defines MANIFEST.files — 44+ entries, every rawUrl and githubUrl is hardcoded to RAW_BASE/GH_BASE.",
        "Defines PRIORITY.files — 15 priority entries, all hardcoded URLs.",
        "All exists: true flags are static — not verified at runtime against GitHub API.",
        "Imports useActiveRepo from @/components/ActiveRepoContext.",
        "Reads activeRepo from context and compares owner/repo to MANIFEST_REPO.",
        "Renders a green 'repo-known' banner when activeRepo matches GovernanceHub manifest source.",
        "Renders an amber 'stale manifest' warning when activeRepo is set to a different repo.",
        "Renders a gray 'no active repo' info banner when activeRepo is null.",
        "The amber banner text is in Norwegian (exact text: 'Stale manifest-referanse:'), mixing locales with the English codebase.",
        "The card header always reads 'Inspecting: Luckywolf82/governancehub' regardless of activeRepo.",
        "No generateManifest(), no push, no draft creation, no approval gate exists in this component.",
        "Data layer is entirely static (hardcoded). UI awareness layer is thin (banner only).",
      ],
    },
    {
      path: "src/components/ActiveRepoContext.jsx",
      purpose:
        "Repo identity context — to assess the existing repo-awareness infrastructure",
      observations: [
        "Provides activeRepo, repos, loading, isRefreshing, selectRepo, clearActiveRepo, refreshRepos.",
        "Loads enabled GitHub repositories on mount via base44.entities.Repository.filter.",
        "Stores activeRepo as a full Repository entity object (has .owner, .repo, .fullName, .id).",
        "refreshRepos() validates activeRepo against updated list — clears activeRepo if removed.",
        "This context is a proper multi-repo identity layer. It is NOT GovernanceHub-hardcoded.",
        "No manifest generation, draft management, or push logic exists here.",
        "Actual path is src/components/ActiveRepoContext.jsx — NOT src/contexts/ActiveRepoContext.jsx as documented in problem statement.",
      ],
    },
    {
      path: "src/components/governance/REPO_FILE_MANIFEST.jsx",
      purpose: "Canonical file manifest data source",
      observations: [
        "JSON file (despite .jsx extension) — no JSX or React code.",
        "All rawUrl and githubUrl fields hardcoded to https://raw.githubusercontent.com/Luckywolf82/governancehub/main.",
        "_meta.repo: 'https://github.com/Luckywolf82/governancehub'.",
        "_meta.branch: 'main'.",
        "_meta.generatedAt: '2026-03-14'.",
        "_meta.generatedBy: 'manual-verified'.",
        "_meta.note references Base44 path mapping between components/ and src/components/.",
        "All exists: true values are static — declared but not live-verified.",
        "No imports; this is a pure data artifact.",
        "Not imported by RepoRawAccessPanel.jsx — panel defines its own inline MANIFEST constant instead.",
        "This means two separate manifest representations exist: the JSON file and the inline panel constant. They appear to be in sync but diverge independently.",
      ],
    },
    {
      path: "src/components/governance/repo-index/pages-index.jsx",
      purpose: "Folder-scoped index for src/pages — to assess static vs. dynamic data",
      observations: [
        "JSON artifact (not JSX). No imports, no exports.",
        "folder: 'src/pages', generatedAt: '2026-03-14', fileCount: 4.",
        "All rawUrl/githubUrl hardcoded to Luckywolf82/governancehub/main.",
        "All exists: true — static, unverified.",
      ],
    },
    {
      path: "src/components/governance/repo-index/admin-index.jsx",
      purpose: "Admin-files cross-folder index",
      observations: [
        "JSON artifact. folder: 'admin-related', generatedAt: '2026-03-14', fileCount: 2.",
        "Covers src/pages/Admin.jsx and src/components/AppLayout.jsx.",
        "All hardcoded GovernanceHub URLs.",
      ],
    },
    {
      path: "src/components/governance/repo-index/components-index.jsx",
      purpose: "src/components root-level index",
      observations: [
        "JSON artifact. folder: 'src/components', generatedAt: '2026-03-14', fileCount: 6.",
        "Lists subfolders: audits, github, governance, projects, ui.",
        "All hardcoded GovernanceHub URLs.",
      ],
    },
    {
      path: "src/components/governance/repo-index/governance-index.jsx",
      purpose: "src/components/governance index",
      observations: [
        "JSON artifact. fileCount: 7. Includes locked: true flags on AI_PROJECT_INSTRUCTIONS.jsx and LockedFiles.jsx.",
        "All hardcoded GovernanceHub URLs.",
      ],
    },
    {
      path: "src/components/governance/repo-index/root-index.jsx",
      purpose: "Repository root index",
      observations: [
        "JSON artifact. fileCount: 12. Includes package-lock.json — not listed in the inline MANIFEST.",
        "All hardcoded GovernanceHub URLs.",
      ],
    },
    {
      path: "src/components/governance/repo-index/audits-index.jsx",
      purpose: "src/components/audits index",
      observations: [
        "JSON artifact. fileCount: 11.",
        "Lists 6 subfolders: architecture, data, governance, performance, product, ui.",
        "product-intelligence-audit-2026-03-12.jsx is listed with note: 'Located at src/components/ root — not yet migrated to src/components/audits/product/'",
        "All hardcoded GovernanceHub URLs.",
      ],
    },
  ],

  // ── B. Current Observed Reality ─────────────────────────────────────────────

  currentObservedReality: {
    hardcodedGovernanceHubParts: [
      "RAW_BASE constant in RepoRawAccessPanel.jsx — Luckywolf82/governancehub/main.",
      "GH_BASE constant in RepoRawAccessPanel.jsx — Luckywolf82/governancehub/blob/main.",
      "MANIFEST_REPO = { owner: 'Luckywolf82', repo: 'governancehub' }.",
      "All MANIFEST.files[*].rawUrl and .githubUrl values.",
      "All MANIFEST.files[*].exists flags (static true — not live-verified).",
      "All PRIORITY.files[*].rawUrl and .githubUrl values.",
      "REPO_FILE_MANIFEST.jsx — entire file is GovernanceHub-scoped JSON.",
      "All six repo-index/*.jsx files — entirely GovernanceHub-scoped JSON.",
      "Metadata fields: generatedAt: '2026-03-14', generatedBy: 'manual-verified'.",
    ],
    alreadyActiveRepoAwareParts: [
      "RepoRawAccessPanel.jsx imports useActiveRepo and reads activeRepo.",
      "Panel renders a green banner when activeRepo.owner/repo matches MANIFEST_REPO.",
      "Panel renders an amber warning when activeRepo is set to a different repo.",
      "Panel renders a gray info note when activeRepo is null.",
      "ActiveRepoContext.jsx is a proper multi-repo identity context — not hardcoded.",
    ],
    staticValuesAtRisk: [
      "exists: true on all manifest entries — could drift from actual GitHub repo state.",
      "locked: true/false flags on manifest entries — must stay in sync with LockedFiles.jsx.",
      "generatedAt: '2026-03-14' — manifest may become stale without a re-generation mechanism.",
      "Two parallel manifest representations: REPO_FILE_MANIFEST.jsx (JSON file) and the inline MANIFEST constant in RepoRawAccessPanel.jsx — they can diverge independently.",
      "panel title reads 'Repository Raw Access' without a persistent scope label in the card header.",
      "Amber banner text is in Norwegian while rest of codebase is English — locale inconsistency.",
    ],
  },

  // ── C. Mode Classification ─────────────────────────────────────────────────

  modeClassification: {
    verdict: "GovernanceHub-only scaffold mode with a thin repo-awareness shim",
    explanation: [
      "The data layer (MANIFEST, PRIORITY, all repo-index files) is 100% hardcoded GovernanceHub-only.",
      "No data is dynamically derived from the activeRepo context.",
      "The repo-awareness exists only at the UI warning layer — three conditional banners.",
      "The banners correctly identify the mismatch but the panel does not change behavior based on activeRepo.",
      "MANIFEST_REPO constant is the correct separation marker — it acknowledges GovernanceHub-specific scope.",
      "This is NOT architecture drift: the system started as GovernanceHub scaffold and has not been incorrectly extended beyond its scope.",
      "This is NOT mixed mode: no part of the data layer attempts to serve non-GovernanceHub data.",
      "Classification: intentional GovernanceHub-only scaffold with partial UI-layer awareness — not yet a multi-repo system.",
    ],
  },

  // ── D. Source-of-Truth Boundary ────────────────────────────────────────────

  sourceTruthBoundary: {
    currentGovernanceHubCanonicalArtifacts: [
      "REPO_FILE_MANIFEST.jsx — canonical file manifest for GovernanceHub repo.",
      "All repo-index/*.jsx files — canonical per-folder file indexes for GovernanceHub.",
      "Inline MANIFEST and PRIORITY constants in RepoRawAccessPanel.jsx — runtime version of the same data.",
      "These are valid GovernanceHub reference artifacts. Their content is correct for their declared scope.",
    ],
    currentRepoSpecificDraftArtifacts: [
      "None. No repo-specific draft artifact generation mechanism exists.",
    ],
    currentApprovedPushedArtifacts: [
      "None. No push mechanism exists anywhere in this subsystem.",
    ],
    unclearOrMisleadingBoundaries: [
      "The panel is named 'Repository Raw Access' — without reading the card subtitle or banners, an operator might assume it serves the currently selected repo.",
      "The amber warning only appears when a non-GovernanceHub repo is actively selected — if no repo is selected (default null state), the panel shows GovernanceHub data silently with only a gray info note.",
      "The gray info note says 'Ingen aktivt repo' (Norwegian) and references the top menu for repo selection — this implies the panel will dynamically update when a repo is selected, which it does NOT (data remains GovernanceHub-only).",
      "REPO_FILE_MANIFEST.jsx and the inline MANIFEST constant are not linked — an update to one does not update the other.",
      "exists: true is declared but not verified. An operator relying on these flags for deployment decisions could be misled if files are deleted or renamed.",
    ],
  },

  // ── E. Architecture Options ─────────────────────────────────────────────────

  architectureOptions: [
    {
      id: "option-a",
      name: "Keep GovernanceHub canonical manifests as internal reference artifacts only. No repo-specific generation yet.",
      benefits: [
        "Zero risk of data corruption or unintended pushes.",
        "Existing canonical data remains accurate for its declared scope.",
        "No complexity increase.",
        "Correct current behavior preserved.",
      ],
      risks: [
        "Panel title 'Repository Raw Access' continues to imply broader functionality.",
        "REPO_FILE_MANIFEST.jsx and inline MANIFEST diverge over time.",
        "No path toward multi-repo governance tooling.",
        "Gray info banner implies future dynamic behavior that will never arrive under this option.",
      ],
      complexity: "low",
      fitWithMultiRepoGoals: "minimal — maintains status quo but does not progress multi-repo governance.",
    },
    {
      id: "option-b",
      name: "Make raw-access surfaces fully activeRepo-derived via GitHub API calls.",
      benefits: [
        "True multi-repo awareness — manifest reflects the selected repo's actual state.",
        "exists flags can be live-verified.",
        "No staleness risk.",
      ],
      risks: [
        "Requires GitHub API calls at render time — rate limiting, latency, and token management.",
        "No approval gate — immediate dynamic generation could lead to unintended push surface.",
        "Removes GovernanceHub canonical reference artifacts unless they are separately preserved.",
        "High complexity spike — requires manifest generation service, caching, error handling.",
        "Does not satisfy the 'approval before push' governance requirement without additional gating logic.",
      ],
      complexity: "high",
      fitWithMultiRepoGoals: "achieves multi-repo awareness but skips the governed approval-before-push requirement.",
    },
    {
      id: "option-c",
      name: "Hybrid: GovernanceHub canonical reference artifacts remain; selected repo can receive generated draft artifacts; draft artifacts require explicit approval before push.",
      description: [
        "GovernanceHub manifests and repo-index files remain as canonical reference artifacts in governance/.",
        "A separate draft artifact surface allows generation of repo-specific manifests when a non-GovernanceHub repo is selected.",
        "Draft artifacts are stored with a draft: true marker — they are never auto-pushed.",
        "Draft artifacts can be manually reviewed and adjusted before being approved.",
        "An explicit approval step (operator action) is required before any push to GitHub.",
        "No push occurs without approval, regardless of draft state.",
      ],
      benefits: [
        "Preserves GovernanceHub canonical reference integrity.",
        "Enables repo-specific artifact generation in a governed way.",
        "Satisfies the 'approval before push' governance requirement.",
        "Draft/approved distinction is explicit and auditable.",
        "Manual adjustment of draft files is supported as a first-class step.",
        "Incremental — GovernanceHub continues to function normally while multi-repo capability is added.",
      ],
      risks: [
        "UI must clearly distinguish GovernanceHub canonical view from draft artifact view.",
        "Draft storage mechanism needs to be defined (in-memory? entity store? local file?).",
        "Approval gate needs implementation — not trivial.",
        "If draft artifacts are stored in the entity store, they must not be presented as canonical.",
      ],
      complexity: "medium",
      fitWithMultiRepoGoals: "best fit — enables governed multi-repo generation while preserving canonical reference artifacts and enforcing approval-before-push.",
    },
  ],

  // ── F. Recommended Model ───────────────────────────────────────────────────

  recommendedModel: {
    choice: "option-c",
    rationale: [
      "Option A is safe but stagnant — it preserves the status quo without enabling the intended multi-repo governance direction.",
      "Option B skips the approval-before-push governance requirement, which is a hard constraint.",
      "Option C is the only option that simultaneously: preserves canonical GovernanceHub reference artifacts, enables repo-specific draft generation, enforces approval-before-push, and supports manual draft adjustment.",
      "The existing MANIFEST_REPO constant and amber warning banner in RepoRawAccessPanel.jsx already form the conceptual foundation of Option C — they correctly separate GovernanceHub canonical mode from other-repo mode.",
    ],
    manualEditingRole:
      "Manual file/folder/manifest editing should be a DRAFT-ADJUSTMENT layer only — not a primary model. The primary flow should be: generate draft → review → adjust if needed → approve → push. Manual-only editing bypasses the generation audit trail.",
    smallestSafeNextStep: {
      description:
        "Add a persistent scope label to the RepoRawAccessPanel card header that always identifies this as 'GovernanceHub canonical reference'. This is a cosmetic-only, localized change to RepoRawAccessPanel.jsx that improves clarity for all activeRepo states without any architectural change.",
      targetFile: "src/components/admin/RepoRawAccessPanel.jsx",
      change:
        "Change the card subtitle from the current dynamic string to always show 'GovernanceHub canonical reference · {count} files · Generated {date}' — making the scope label persistent and independent of activeRepo state.",
      rationale:
        "This is the minimum change that prevents the most likely operator misunderstanding (assuming the panel serves the selected repo) without requiring any new architecture or push mechanism. It also eliminates the locale inconsistency in the amber banner text.",
      outOfScope: [
        "Draft manifest generation — not yet.",
        "Approval gate — not yet.",
        "Push mechanism — not yet.",
        "Repo-specific manifest storage — not yet.",
      ],
    },
  },

  // ── G. Risks / Constraints ─────────────────────────────────────────────────

  risksAndConstraints: [
    {
      risk: "Dual manifest representations (REPO_FILE_MANIFEST.jsx and inline MANIFEST in RepoRawAccessPanel.jsx) can diverge silently.",
      severity: "medium",
      mitigationPath: "Consolidate to a single import in RepoRawAccessPanel.jsx after scope label is stabilized.",
    },
    {
      risk: "exists: true flags are static and may become stale as the repository evolves.",
      severity: "medium",
      mitigationPath: "Document as 'last-verified' rather than 'currently-live'. Consider a scheduled re-generation tool.",
    },
    {
      risk: "Gray info banner implies future dynamic behavior ('select active repo for repo-specific view') that does not yet exist.",
      severity: "low",
      mitigationPath: "Reword banner to clarify that the panel always shows GovernanceHub canonical data regardless of repo selection.",
    },
    {
      risk: "Norwegian-language text in amber banner inconsistent with English codebase.",
      severity: "low",
      mitigationPath: "Replace Norwegian text with English in the amber and gray banners during the scope label update.",
    },
    {
      risk: "No approval gate or draft storage mechanism exists — implementing repo-specific generation without these risks unintended push capability.",
      severity: "high",
      mitigationPath: "Do not implement repo-specific generation until draft storage and approval gate are defined and audited.",
    },
    {
      risk: "PhaseExecutionLog must NOT be modified as part of this audit per gov-006 constraints.",
      severity: "constraint",
      mitigationPath: "Do not append to PhaseExecutionLog for this audit. gov-007 registration in AUDIT_INDEX is the only required governance artifact.",
    },
  ],

  // ── H. One Safe Next Step ──────────────────────────────────────────────────

  oneSafeNextStep:
    "Update RepoRawAccessPanel.jsx card header subtitle to always display 'GovernanceHub canonical reference' as a persistent scope label, and replace the Norwegian-language amber and gray banner text with English equivalents. This is a localized, cosmetic-only change to one file that eliminates the primary operator misunderstanding risk without any architectural change.",

  dataFile:
    "src/components/audits/governance/raw-access-manifest-subsystem-audit-2026-03-17.jsx",
};

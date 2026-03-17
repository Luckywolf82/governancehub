// Canonical source of truth for all audits in GovernanceHub.
// Pages must import from here — do not hardcode audit data in page files.
//
// STATUS VOCABULARY (controlled — do not extend without updating this header)
//   "verified"  — audit executed, findings confirmed by direct file inspection, data accessible in registry
//   "orphaned"  — audit was reportedly executed but canonical data file is missing or contains wrong content
//   "planned"   — audit scope defined but execution has not started; all fields are preliminary definitions
//
// EVIDENCE SOURCE VOCABULARY
//   "repo-derived"  — findings come from direct file inspection of the live repository
//   "preliminary"   — no inspection performed yet; fields are scope definitions only
//
// PRELIMINARY FIELD
//   preliminary: false  — audit findings are verified; safe to use in Orchestrator without enrichment
//   preliminary: true   — some or all fields are scope definitions or unverified; requires manual review
//
// ENTRY STATE SUMMARY
//   arch-001  verified   / preliminary: false  — fully usable
//   arch-002  verified   / preliminary: false  — canonical meta/finding model; Admin UI file placement consistency
//   arch-003  verified   / preliminary: false  — AdminDashboard.jsx: deprecation candidate; Admin.jsx: canonical shell; no broken import in AdminDashboard
//   prod-001  orphaned   / preliminary: true   — problem verified; implementation fields preliminary
//   prod-002  orphaned   / preliminary: true   — problem verified; blocked on prod-001 resolution
//   gov-001   planned    / preliminary: true   — scope only; not executed
//   gov-002   verified   / preliminary: false  — locked-file normalization remediation complete
//   gov-003   verified   / preliminary: false  — schema drift identified; recommended model: Option 3 (canonical extension)
//   gov-004   verified   / preliminary: false  — lifecycle gaps identified; ExecutionLogPanel implemented as one safe next step
//   gov-005   verified   / preliminary: false  — audit executed; no partial dispatch arch found; PromptProfileRegistry.jsx is one safe next step
//   gov-006   verified   / preliminary: false  — PhaseExecutionLog safety audit; all 17 entries are non-authoritative for app runtime (dev-phase origin); recommended: archive + reset
//   gov-007   verified   / preliminary: false  — raw-access/manifest/repo-index subsystem audit; GovernanceHub-only scaffold mode confirmed; recommended model: Option C hybrid (canonical refs preserved + approval-gated draft generation)
//   perf-001  planned    / preliminary: true   — scope only; not executed
//   ui-001    verified   / preliminary: false  — Admin workflow/UI clarity audit; Govern tab overload; no onboarding gate; NEXT_SAFE_STEP invisible; 5 non-operational gov-006 panels inflate Govern tab

export const AUDIT_INDEX = {
  entries: [
    {
      id: "arch-001",
      title: "Admin UI File Placement",
      category: "Architecture",
      type: "File Placement",
      status: "verified",
      date: "2026-03-13",
      projectId: "governancehub",
      projectSlug: "governancehub",
      preliminary: false,
      evidenceSource: "repo-derived",
      summary: "Audited placement of Admin UI components against project conventions. Found redundant AdminDashboard duplicate, three misplaced files at components root, broken import paths, and a missing canonical product audit directory.",
      problem: `Multiple file placement violations confirmed by direct file inspection:
1. src/components/AdminDashboard.jsx is a byte-for-byte duplicate of src/pages/AdminDashboard.jsx.
2. src/components/ROADMAP.jsx is misnamed — contains PRODUCT_INTELLIGENCE_AUDIT data, not a roadmap UI component.
3. src/components/product-intelligence-audit-2026-03-12.jsx contains AUDIT_SYSTEM_GUIDE content — filename does not match content.
4. src/components/product-utility-audit-2026-03-11.jsx contains AUDITS_README content — filename does not match content.
5. Both AdminDashboard files import from '../roadmap/ROADMAP' — that path does not exist in the repository.
6. PhaseExecutionLog.jsx references 'src/components/admin/AdminDashboard.jsx' — that path also does not exist.
7. Directory src/components/audits/product/ does not exist, despite being referenced in AUDIT_INDEX entries prod-001 and prod-002.`,
      impact: "Dead code at components root creates navigation confusion. Broken import paths in AdminDashboard make it non-functional if rendered. AUDIT_INDEX references to src/components/audits/product/* point to a directory that does not exist. PhaseExecutionLog contains a stale reference.",
      affectedFiles: [
        "src/components/AdminDashboard.jsx",
        "src/components/ROADMAP.jsx",
        "src/components/product-intelligence-audit-2026-03-12.jsx",
        "src/components/product-utility-audit-2026-03-11.jsx",
        "src/pages/AdminDashboard.jsx",
        "src/components/governance/PhaseExecutionLog.jsx",
      ],
      requiredChange: "Remove src/components/AdminDashboard.jsx — it is an exact duplicate of src/pages/AdminDashboard.jsx and is not registered in the router. This is the one safe first step. Subsequent steps: create src/components/audits/product/, move misplaced audit files, and update PhaseExecutionLog stale reference.",
      constraints: "One structural change at a time. Do not modify src/pages/AdminDashboard.jsx. Do not touch canonical governance files. Append PhaseExecutionLog entry after each verified change.",
      acceptanceCriteria: "src/components/AdminDashboard.jsx removed and confirmed absent from GitHub. No new broken imports introduced. Follow-up issues for misplaced product audit files and missing directory documented.",
      oneSafeNextStep: "src/components/AdminDashboard.jsx confirmed absent (removed in PR #32). Next step: author verified product intelligence audit content at src/components/audits/product/product-intelligence-audit-2026-03-12.jsx to resolve prod-001 orphaned audit.",
    },

    {
      id: "arch-002",
      title: "Admin UI File Placement Consistency",
      category: "architecture",
      type: "File Placement Audit",
      status: "verified",
      date: "2026-03-15",
      projectId: "governancehub",
      projectSlug: "governancehub",
      preliminary: false,
      evidenceSource: "repo-derived",
      dataFile: "src/components/audits/architecture/admin-ui-file-placement-canonical-audit-2026-03-15.jsx",
    },

    {
      id: "arch-003",
      title: "Admin Roadmap Surface Placement Audit",
      category: "architecture",
      type: "Placement and Responsibility Audit",
      status: "verified",
      date: "2026-03-16",
      projectId: "governancehub",
      projectSlug: "governancehub",
      preliminary: false,
      evidenceSource: "repo-derived",
      summary: "src/pages/AdminDashboard.jsx (exports RoadmapAdminPanel) classified as a deprecation candidate. The component is not registered in the router, has empty data objects, and is semantically misnamed. AdminDashboard.jsx itself has no broken import. Admin.jsx is confirmed as the canonical active admin shell. The stale-path issue is in src/components/ROADMAP.jsx, which lists a non-existent evidence path.",
      oneSafeNextStep: "Propose removal of src/pages/AdminDashboard.jsx in a dedicated follow-up task. Before removal: update the stale reference in src/components/ROADMAP.jsx that points to the non-existent src/components/admin/RoadmapAdminPanel.jsx.",
      dataFile: "src/components/audits/architecture/admin-roadmap-surface-placement-audit-2026-03-16.jsx",
    },

    {
      id: "prod-001",
      title: "Product Intelligence Audit",
      category: "Product",
      type: "Product Analysis",
      status: "orphaned",
      date: "2026-03-12",
      projectId: "governancehub",
      projectSlug: "governancehub",
      preliminary: true,
      preliminaryNote: "Problem and impact are verified from arch-001 findings. requiredChange and acceptanceCriteria are preliminary — actual audit content must be authored before this can be marked implementation-ready.",
      evidenceSource: "repo-derived",
      summary: "Product intelligence audit reportedly executed 2026-03-12. ORPHANED: the canonical data file (src/components/audits/product/product-intelligence-audit-2026-03-12.jsx) does not exist. The closest matching path contains AUDIT_SYSTEM_GUIDE content, not this audit's data.",
      problem: "The canonical file declared in AUDIT_INDEX for prod-001 (src/components/audits/product/product-intelligence-audit-2026-03-12.jsx) does not exist. The file at the closest matching path (src/components/product-intelligence-audit-2026-03-12.jsx) is misnamed — it exports AUDIT_SYSTEM_GUIDE, not product intelligence audit data.",
      impact: "The product scoring model and roadmap prioritization data from this audit are not accessible via any verified file path. The audit is structurally orphaned.",
      affectedFiles: [
        "src/components/audits/product/product-intelligence-audit-2026-03-12.jsx",
        "src/components/product-intelligence-audit-2026-03-12.jsx",
        "src/components/audits/AUDIT_INDEX.jsx",
      ],
      requiredChange: "Create src/components/audits/product/ directory. Place the actual product intelligence audit data at src/components/audits/product/product-intelligence-audit-2026-03-12.jsx. Update AUDIT_INDEX reference if path changes.",
      constraints: "Do not fabricate product scoring data. Audit content must come from verified source. One structural change at a time. Depends on arch-001 directory creation step.",
      acceptanceCriteria: "A file at src/components/audits/product/product-intelligence-audit-2026-03-12.jsx exists in GitHub, contains the real product intelligence audit data, and is importable.",
      oneSafeNextStep: "Create src/components/audits/product/ directory and author the product intelligence audit file with verified content.",
    },

    {
      id: "prod-002",
      title: "Product Utility Audit",
      category: "Product",
      type: "Product Analysis",
      status: "orphaned",
      date: "2026-03-11",
      projectId: "governancehub",
      projectSlug: "governancehub",
      preliminary: true,
      preliminaryNote: "Problem and impact are verified from arch-001 findings. requiredChange and acceptanceCriteria are preliminary — depends on prod-001 path resolution and actual audit content authoring.",
      evidenceSource: "repo-derived",
      summary: "Product utility audit reportedly executed 2026-03-11. ORPHANED: the canonical data file (src/components/audits/product/product-utility-audit-2026-03-11.jsx) does not exist. The closest matching path contains AUDITS_README content, not this audit's data.",
      problem: "The canonical file declared in AUDIT_INDEX for prod-002 (src/components/audits/product/product-utility-audit-2026-03-11.jsx) does not exist. The file at the closest matching path (src/components/product-utility-audit-2026-03-11.jsx) is misnamed — it exports AUDITS_README, not product utility audit data.",
      impact: "Product utility audit data is not accessible via any verified file path. The audit is structurally orphaned.",
      affectedFiles: [
        "src/components/audits/product/product-utility-audit-2026-03-11.jsx",
        "src/components/product-utility-audit-2026-03-11.jsx",
        "src/components/audits/AUDIT_INDEX.jsx",
      ],
      requiredChange: "After prod-001 directory creation: place the actual product utility audit data at src/components/audits/product/product-utility-audit-2026-03-11.jsx.",
      constraints: "Do not fabricate product utility data. Must follow arch-001 and prod-001 file placement resolution first. One structural change at a time.",
      acceptanceCriteria: "A file at src/components/audits/product/product-utility-audit-2026-03-11.jsx exists in GitHub, contains the real product utility audit data, and is importable.",
      oneSafeNextStep: "After prod-001 is resolved: author the product utility audit file at the canonical path.",
    },

    {
      id: "gov-001",
      title: "Governance Workflow Review",
      category: "Governance",
      type: "Governance Analysis",
      status: "planned",
      date: null,
      projectId: "governancehub",
      projectSlug: "governancehub",
      preliminary: true,
      preliminaryNote: "All fields are preliminary scope definitions. No file inspection has been performed. Audit must be executed before any field is considered verified.",
      evidenceSource: "preliminary",
      summary: "Governance workflow review planned but not yet executed. Fields below are scope definitions only — not audit findings.",
      problem: "Governance workflow definitions and enforcement coverage have not been formally audited. It is unknown whether all required governance checkpoints are implemented and enforced.",
      impact: "Unaudited governance workflows may allow governance drift — structural changes proceeding without required analysis, execution log entries, or locked-file verification.",
      affectedFiles: [
        "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
        "src/components/governance/LockedFiles.jsx",
        "src/components/governance/PhaseExecutionLog.jsx",
      ],
      requiredChange: "Inspect all governance workflow files. Verify that enforcement coverage matches what is declared in AI_PROJECT_INSTRUCTIONS. Document gaps.",
      constraints: "Read-only analysis only. Do not modify governance files during audit. Follow locked-file policy.",
      acceptanceCriteria: "All governance workflow checkpoints verified against declared policy. Gaps documented with specific findings. One safe next step identified.",
      oneSafeNextStep: "Execute the audit: inspect governance workflow files and document findings. Do not implement changes during the audit.",
    },

    {
      id: "gov-002",
      title: "Locked-File Definition Normalization",
      category: "Governance",
      type: "Governance Drift Remediation",
      status: "verified",
      date: "2026-03-15",
      projectId: "governancehub",
      projectSlug: "governancehub",
      preliminary: false,
      evidenceSource: "repo-derived",
      summary: "Governance drift detected: locked-file definitions were inconsistent across LockedFiles.jsx, AI_PROJECT_INSTRUCTIONS.jsx, .github/copilot-instructions.md, and .github/COPILOT_REVIEW_CHECKLIST.md. LockedFiles.jsx referenced two starter-kit-only files not present in the main repo. Normalization implemented on branch copilot/normalize-locked-file-definitions.",
      problem: "Four governance files defined the locked-file set inconsistently. LockedFiles.jsx included INSTALL_POLICY.jsx and STARTER_KIT_VERSION.jsx which exist only in starter-kit/, not the main repo. AI_PROJECT_INSTRUCTIONS.jsx, copilot-instructions.md, and COPILOT_REVIEW_CHECKLIST.md each described a different subset of locked files.",
      impact: "Inconsistent locked-file definitions could mislead Copilot and governance tooling, creating ambiguity about which files require protection.",
      affectedFiles: [
        "src/components/governance/LockedFiles.jsx",
        "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
        ".github/COPILOT_REVIEW_CHECKLIST.md",
        ".github/copilot-instructions.md",
      ],
      requiredChange: "Remove starter-kit-only file references from LockedFiles.jsx. Align all four files to describe the same canonical 5-file locked set.",
      constraints: "Modify only the four target files. Do not invent files that do not exist. Preserve export structure.",
      acceptanceCriteria: "All four files describe the same canonical locked-file set. No file references non-existent main-repo governance files.",
      oneSafeNextStep: "No further action required. Locked-file normalization is complete and documented in PhaseExecutionLog Entry 3 and this AUDIT_INDEX gov-002 record.",
    },

    {
      id: "gov-003",
      title: "Execution Log Schema Consistency",
      category: "Governance",
      type: "Schema Drift Audit",
      status: "verified",
      date: "2026-03-15",
      projectId: "governancehub",
      projectSlug: "governancehub",
      preliminary: false,
      evidenceSource: "repo-derived",
      summary: "Audited execution log schema across PhaseExecutionLog.jsx, AI_PROJECT_INSTRUCTIONS.jsx, and INSTALL_POLICY.jsx. Two of three PhaseExecutionLog entries (at time of audit) were missing the required 'taskRequested' field. INSTALL_POLICY.loggingRules.schema diverges from the canonical requiredFields: omits 'task' and 'changedFiles', and adds 'filesCreated', 'filesModified', and 'commitRef'. Six of eight canonical fields overlap. Recommended model: treat INSTALL_POLICY schema as an explicit extension of the canonical runtime schema (Option 3).",
      problem: "Entry 1 and Entry 3 in PhaseExecutionLog.jsx omit 'taskRequested', which is listed as a required field in AI_PROJECT_INSTRUCTIONS.executionLog.requiredFields. INSTALL_POLICY.loggingRules.schema defines a logging schema incompatible with the canonical required-field list: it substitutes 'changedFiles' with 'filesCreated'+'filesModified', drops 'task', and introduces 'commitRef'.",
      impact: "Incomplete log entries reduce traceability. INSTALL_POLICY's divergent schema means install-originated log entries would not pass canonical schema validation and would be missing required fields.",
      affectedFiles: [
        "src/components/governance/PhaseExecutionLog.jsx",
        "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
        "src/components/governance/INSTALL_POLICY.jsx",
      ],
      requiredChange: "Step 1: Add 'taskRequested' to PhaseExecutionLog Entry 1 and Entry 3. Step 2: Align INSTALL_POLICY.loggingRules.schema with the canonical required-field list or document install-specific extensions explicitly.",
      constraints: "Both PhaseExecutionLog.jsx and INSTALL_POLICY.jsx are locked files. One structural change at a time. Append PhaseExecutionLog entry after each verified change.",
      acceptanceCriteria: "All PhaseExecutionLog entries include every field in executionLog.requiredFields. INSTALL_POLICY schema is aligned with or explicitly extends the canonical required-field list.",
      oneSafeNextStep: "Add 'taskRequested' to PhaseExecutionLog Entry 1 and Entry 3.",
      dataFile: "src/components/audits/governance/execution-log-schema-audit-2026-03-15.jsx",
    },

    {
      id: "gov-004",
      title: "App-Native Audit Lifecycle Completion",
      category: "Governance",
      type: "Lifecycle Gap Audit",
      status: "verified",
      date: "2026-03-15",
      projectId: "governancehub",
      projectSlug: "governancehub",
      preliminary: false,
      evidenceSource: "repo-derived",
      summary: "Audited GovernanceHub for complete in-app governance lifecycle support with focus on post-merge verification. Found that no ExecutionLogPanel exists, PhaseExecutionLog has no structured lifecycle status field, RepoVerificationPanel is not tied to execution log entries, and the Admin Govern tab workflow is incomplete (stops at task generation, no verify-after-merge step). Implemented ExecutionLogPanel.jsx as the one safe next step.",
      problem: "GovernanceHub has no in-app execution log panel. Operators cannot see PhaseExecutionLog entries from within the application. The githubVisibility field is unstructured free-text with no controlled lifecycle vocabulary (drafted/implemented/merged/verified). Post-merge verification has no in-app action — it is entirely manual and external. The Admin Govern tab workflow is incomplete: it stops at task generation without a 'verify after merge' step.",
      impact: "Without an in-app execution log view, the governance lifecycle cannot close within GovernanceHub. The 'verify → propose → implement → publish → verify' loop described in AI_PROJECT_INSTRUCTIONS.developmentLoop has no in-app endpoint. Governance drift risk increases with each unverified log entry if app-native audit creation is enabled before verification exists.",
      affectedFiles: [
        "src/components/governance/PhaseExecutionLog.jsx",
        "src/components/governance/NextSafeStep.jsx",
        "src/pages/Admin.jsx",
        "src/components/admin/ExecutionLogPanel.jsx",
        "src/components/audits/AUDIT_INDEX.jsx",
      ],
      requiredChange: "Create src/components/admin/ExecutionLogPanel.jsx. Import and render PHASE_EXECUTION_LOG.entries. Display lifecycle status per entry using githubVisibility. Flag 'Not yet verified' entries with a warning badge. Provide GitHub links for post-merge verification. Add ExecutionLogPanel to Admin.jsx Govern tab after GovernanceOrchestratorPanel.",
      constraints: "Modify only Admin.jsx and NextSafeStep.jsx in existing non-locked files. New file ExecutionLogPanel.jsx is a net-new addition. Do not modify locked governance files except PhaseExecutionLog (append entry) and AUDIT_INDEX (register audit). One structural change at a time.",
      acceptanceCriteria: "ExecutionLogPanel.jsx exists and renders PhaseExecutionLog entries. Entries with unverified githubVisibility are visually distinguished. Admin Govern tab includes ExecutionLogPanel after GovernanceOrchestratorPanel. NextSafeStep reflects post-merge verification as the current next step.",
      oneSafeNextStep: "Post-merge verification: use the new ExecutionLogPanel in the Admin Govern tab to confirm GitHub visibility for the execution log entries that remain marked 'Not yet verified'.",
      dataFile: "src/components/audits/governance/app-native-audit-lifecycle-2026-03-15.jsx",
    },

    {
      id: "gov-005",
      title: "App-Native Prompt Dispatch Governance",
      category: "Governance",
      type: "Prompt Dispatch Governance Audit",
      status: "verified",
      date: "2026-03-16",
      projectId: "governancehub",
      projectSlug: "governancehub",
      preliminary: false,
      evidenceSource: "repo-derived",
      summary: "Audit executed by direct file inspection on 2026-03-16. No partial prompt dispatch architecture exists in the Admin system. Global repo context (ActiveRepoContext) exists for repository identity only — operator identity and dispatch scope remain gaps. No prompt profile logic, preview-before-send gate, approval gate, or dispatch log exists anywhere in the repository. PhaseExecutionLog is clean — dispatch history and execution history are not mixed. PromptProfileRegistry.jsx is confirmed as the correct minimum safe first artifact. One safe next step: create PromptProfileRegistry.jsx (schema only, no UI or dispatch logic).",
      problem: "GovernanceHub has no app-native prompt dispatch capability. Operators have no in-app path to generate, tailor, preview, approve, or dispatch prompts while maintaining governance traceability. Implementing dispatch without a phased governance roadmap risks bypassing the approval and audit trail requirements that govern all other structural actions in the system.",
      impact: "Without a governed dispatch mechanism, prompt generation will either be blocked entirely (no capability) or proceed outside the governance layer (no traceability). A planned audit with a staged roadmap provides the framework to implement dispatch incrementally without sacrificing traceability.",
      affectedFiles: [
        "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
        "src/components/governance/LockedFiles.jsx",
        "src/components/governance/PhaseExecutionLog.jsx",
        "src/components/audits/AUDIT_INDEX.jsx",
      ],
      requiredChange: "Execute this audit by inspecting all filesToRead to verify no partial prompt dispatch implementation already exists. Then implement Phase 1 only: create PromptProfileRegistry.jsx with the schema and governance constraints defined in the audit data file.",
      constraints: "No dispatch implementation may proceed until this audit is executed and status is changed to 'verified'. Profile registry creation is the only action permitted in Phase 1. Locked governance files must not be modified during audit execution. One structural change at a time.",
      acceptanceCriteria: "Audit executed by direct file inspection. PromptProfileRegistry.jsx created with all requiredProfileFields. No dispatchable prompt creatable without approvalStatus === 'approved'. Dispatch log implemented separately from PhaseExecutionLog. Preview step is a blocking gate. Staged rollout enforces sequential stage progression with per-stage approval.",
      oneSafeNextStep: "Create src/components/governance/PromptProfileRegistry.jsx with all requiredProfileFields defined in the audit data file. Schema and governance constraints only — no UI component, no dispatch logic.",
      dataFile: "src/components/audits/governance/prompt-dispatch-governance-audit-2026-03-16.jsx",
    },

    {
      id: "gov-006",
      title: "PhaseExecutionLog Safety Audit",
      category: "Governance",
      type: "Log Safety and Eligibility Audit",
      status: "verified",
      date: "2026-03-17",
      projectId: "governancehub",
      projectSlug: "governancehub",
      preliminary: false,
      evidenceSource: "repo-derived",
      summary:
        "All 17 entries in PhaseExecutionLog are of development-phase origin and are not " +
        "authoritative for app runtime state — appended directly " +
        "by Copilot agents outside the app's governance flow. Zero entries meet runtime-eligibility " +
        "criteria. Only two files import PHASE_EXECUTION_LOG: ExecutionLogPanel.jsx (reads .entries) " +
        "and Verification.jsx (reads .entrySchema only — entries not consumed). ExecutionLogPanel " +
        "handles entries: [] gracefully. Recommended model: archive + reset (move entries to " +
        "devPhaseArchive, clear entries: [], add logEligibilityNote to writeStrategy). Reset is safe " +
        "from a code perspective. Reset requires a one-time locked-file governance exception " +
        "justified by this audit.",
      problem:
        "PhaseExecutionLog.entries contains 17 development-phase entries appended by Copilot agents " +
        "via direct file editing. None were produced through the app's runtime governance flow. Entry 1 " +
        "has a placeholder date and missing required field. No entries include the required 'entryType' " +
        "field. The UI (ExecutionLogPanel) presents these entries as runtime governance history.",
      impact:
        "Development-phase entries drive the ExecutionLogPanel UI, presenting Copilot PR history as " +
        "app-native governance execution history. Auto-verification calls GitHub API for PR-scoped " +
        "entries outside the app's execution model. Future runtime entries will be mixed with " +
        "development entries unless the log is reset.",
      affectedFiles: [
        "src/components/governance/PhaseExecutionLog.jsx",
        "src/components/admin/ExecutionLogPanel.jsx",
      ],
      requiredChange:
        "Step 1 (this PR): Register gov-006 in AUDIT_INDEX. " +
        "Step 2 (separate supervised PR): add devPhaseArchive: [...currentEntries] to " +
        "PHASE_EXECUTION_LOG, reset entries: [], add logEligibilityNote to writeStrategy. " +
        "Do NOT append to PhaseExecutionLog as part of this audit.",
      constraints:
        "Do not mutate PhaseExecutionLog.entries as part of audit registration. " +
        "Do not append a PhaseExecutionLog entry for this audit work. " +
        "Reset requires a locked-file governance exception justified by this audit. " +
        "One structural change at a time.",
      acceptanceCriteria:
        "gov-006 registered in AUDIT_INDEX. PHASE_EXECUTION_LOG.entries reset to [] in a " +
        "separate PR. devPhaseArchive preserves all 17 pre-reset entries. logEligibilityNote " +
        "present in writeStrategy. ExecutionLogPanel shows empty state without crash.",
      oneSafeNextStep:
        "In a separate supervised PR: add devPhaseArchive: [...currentEntries] to PHASE_EXECUTION_LOG, " +
        "set entries: [], and add logEligibilityNote to writeStrategy. Reference gov-006 as justification.",
      dataFile: "src/components/audits/governance/phase-execution-log-safety-audit-2026-03-17.jsx",
    },

    {
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
      summary:
        "Audited RepoRawAccessPanel.jsx, ActiveRepoContext.jsx, REPO_FILE_MANIFEST.jsx, and all six " +
        "repo-index/*.jsx files. Classification: GovernanceHub-only scaffold mode with a thin " +
        "repo-awareness shim. Data layer is 100% hardcoded to Luckywolf82/governancehub. ActiveRepoContext " +
        "is a proper multi-repo identity layer but is used only for banner display — not for data generation. " +
        "Two parallel manifest representations (JSON file + inline panel constant) can diverge silently. " +
        "exists: true flags are static and unverified at runtime. Amber/gray banners contain Norwegian text " +
        "inconsistent with English codebase. Recommended model: Option C hybrid — GovernanceHub canonical " +
        "reference artifacts remain; repo-specific draft artifacts generated on demand; explicit approval " +
        "required before any push.",
      problem:
        "The panel title 'Repository Raw Access' implies multi-repo capability that does not yet exist. " +
        "The gray info banner implies the panel will dynamically update when a repo is selected — it will not. " +
        "Two parallel manifest representations (REPO_FILE_MANIFEST.jsx and the inline MANIFEST constant in " +
        "RepoRawAccessPanel.jsx) are not linked and can diverge independently. exists: true flags are static " +
        "declarations, not live-verified values. Amber and gray banner text is in Norwegian while the rest of " +
        "the codebase is English.",
      impact:
        "Operators may incorrectly assume the panel serves the currently selected repo. The static exists: true " +
        "flags may mislead operators relying on them for deployment decisions. Dual manifest representations " +
        "create maintenance confusion. Without a defined draft-generation and approval-gate model, any future " +
        "attempt to add repo-specific generation risks bypassing the approval-before-push governance requirement.",
      affectedFiles: [
        "src/components/admin/RepoRawAccessPanel.jsx",
        "src/components/ActiveRepoContext.jsx",
        "src/components/governance/REPO_FILE_MANIFEST.jsx",
        "src/components/governance/repo-index/pages-index.jsx",
        "src/components/governance/repo-index/admin-index.jsx",
        "src/components/governance/repo-index/components-index.jsx",
        "src/components/governance/repo-index/governance-index.jsx",
        "src/components/governance/repo-index/root-index.jsx",
        "src/components/governance/repo-index/audits-index.jsx",
      ],
      requiredChange:
        "Step 1 (this PR): Register gov-007 in AUDIT_INDEX and create audit data file. " +
        "Step 2 (separate PR): Update RepoRawAccessPanel.jsx card header subtitle to always display " +
        "'GovernanceHub canonical reference' as a persistent scope label; replace Norwegian banner text " +
        "with English equivalents. " +
        "Do NOT implement draft generation or push mechanism until a separate governance audit defines " +
        "the draft storage model and approval gate.",
      constraints:
        "Do not mutate PhaseExecutionLog.jsx as part of this audit. " +
        "Do not implement draft generation, approval gate, or push mechanism in this step. " +
        "Audit registration only. One structural change at a time.",
      acceptanceCriteria:
        "gov-007 registered in AUDIT_INDEX with dataFile link. " +
        "Audit data file exists at src/components/audits/governance/raw-access-manifest-subsystem-audit-2026-03-17.jsx. " +
        "Panel scope label updated in a subsequent PR to prevent operator misunderstanding.",
      oneSafeNextStep:
        "Update RepoRawAccessPanel.jsx card header subtitle to always display 'GovernanceHub canonical reference' " +
        "as a persistent scope label, and replace Norwegian-language amber and gray banner text with English. " +
        "Localized cosmetic-only change to one file.",
      dataFile: "src/components/audits/governance/raw-access-manifest-subsystem-audit-2026-03-17.jsx",
    },

    {
      id: "perf-001",
      title: "Performance Audit Framework",
      category: "Performance",
      type: "Planned Audit",
      status: "planned",
      date: null,
      projectId: "governancehub",
      projectSlug: "governancehub",
      preliminary: true,
      evidenceSource: "preliminary",
      summary: "Placeholder entry defining the future performance audit framework for GovernanceHub.",
      problem: "Performance audits are referenced in documentation but no registered audit entry currently exists.",
      impact: "Performance monitoring and optimization audits cannot be tracked through the audit system until a formal entry exists.",
      affectedFiles: [],
      requiredChange: "Define and execute a performance audit covering bundle size, render performance, and runtime responsiveness.",
      constraints: "Audit definition only. Do not implement performance measurement tooling yet.",
      acceptanceCriteria: "A future performance audit dataFile is created and linked from this entry.",
      oneSafeNextStep: "Design the performance audit scope and measurement criteria.",
    },

    {
      id: "ui-001",
      title: "Admin Workflow and UI Clarity Audit",
      category: "ui",
      type: "Workflow and UX Clarity Audit",
      status: "verified",
      date: "2026-03-16",
      projectId: "governancehub",
      projectSlug: "governancehub",
      preliminary: false,
      evidenceSource: "repo-derived",
      summary:
        "Deep audit of the Admin workflow and UI clarity. Key findings: (1) Govern tab is the default but Setup is the prerequisite — tab ordering is inverted. (2) Govern tab has 8 stacked panels, 5 of which are non-operational gov-006 scaffolding with no current actionable value. (3) NEXT_SAFE_STEP exists as governance data but is never surfaced as a primary CTA. (4) Active repo selector is split between the global header and inline banners across three tabs. (5) There is no onboarding gate, no readiness signal, and no progressive disclosure. (6) Mobile/webview deployment of the current structure is high-risk. One safe next step: wrap the 5 non-operational gov-006 panels in a collapsed-by-default disclosure section in the Govern tab.",
      oneSafeNextStep:
        "Wrap the 5 non-operational gov-006 Govern-tab panels (DispatchReviewPanel, PromptPreviewPanel, ExecutionWorker, Verification, ExecutionLog) in a collapsed-by-default disclosure section in Admin.jsx labeled 'Execution pipeline (preview — non-operational)'. This is a localized Admin.jsx-only change, fully reversible, and immediately reduces Govern tab scroll-depth overload.",
      dataFile:
        "src/components/audits/ui/admin-workflow-ui-audit-2026-03-16.jsx",
    },
  ],
};


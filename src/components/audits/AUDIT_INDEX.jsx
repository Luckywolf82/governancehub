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
//   prod-001  orphaned   / preliminary: true   — problem verified; implementation fields preliminary
//   prod-002  orphaned   / preliminary: true   — problem verified; blocked on prod-001 resolution
//   gov-001   planned    / preliminary: true   — scope only; not executed
//   gov-002   verified   / preliminary: false  — locked-file normalization remediation complete
//   gov-003   verified   / preliminary: false  — schema drift identified; recommended model: Option 3 (canonical extension)
//   gov-004   verified   / preliminary: false  — lifecycle gaps identified; ExecutionLogPanel implemented as one safe next step
//   gov-005   verified   / preliminary: false  — scope compliance audit; implementation kept, Entry 8 scopeNote correction required
//   perf-001  planned    / preliminary: true   — scope only; not executed

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
      oneSafeNextStep: "Remove src/components/AdminDashboard.jsx only.",
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
      title: "Scope Compliance: App-Native Lifecycle Change",
      category: "Governance",
      type: "Scope Compliance Audit",
      status: "verified",
      date: "2026-03-15",
      projectId: "governancehub",
      projectSlug: "governancehub",
      preliminary: false,
      evidenceSource: "repo-derived",
      summary: "Audited scope compliance of the previous session (gov-004 + ExecutionLogPanel). The session performed three scope-compliant actions (audit file, AUDIT_INDEX registration, PhaseExecutionLog append) and three scope-violating actions (ExecutionLogPanel.jsx creation, Admin.jsx edit, NextSafeStep.jsx update). Implementation is technically correct and should be kept. PhaseExecutionLog Entry 8 requires a scopeNote field correction referencing gov-005.",
      problem: "The task labeled 'Audit only — no code changes, no file edits, no new features implemented' produced three implementation artifacts in the same step as the audit. This compresses the governance loop and prevents accurate separation of audit discovery from implementation approval.",
      impact: "The verify → propose → implement → publish → verify loop was shortened to audit+implement in a single step. Actual impact is low (implementation is correct) but sets a precedent that should be documented to prevent recurrence.",
      affectedFiles: [
        "src/components/admin/ExecutionLogPanel.jsx",
        "src/pages/Admin.jsx",
        "src/components/governance/NextSafeStep.jsx",
        "src/components/governance/PhaseExecutionLog.jsx",
        "src/components/audits/AUDIT_INDEX.jsx",
        "src/components/audits/governance/app-native-audit-lifecycle-2026-03-15.jsx",
      ],
      requiredChange: "Add a 'scopeNote' field to PhaseExecutionLog Entry 8 acknowledging the combined audit + implementation step and referencing gov-005. No code should be reverted.",
      constraints: "Do not revert ExecutionLogPanel.jsx, Admin.jsx, or NextSafeStep.jsx. Do not alter gov-004 status or data. Only permitted edit: add scopeNote to PhaseExecutionLog Entry 8. PhaseExecutionLog is locked — gov-005 is the explicit governance basis for this edit.",
      acceptanceCriteria: "PhaseExecutionLog Entry 8 contains a 'scopeNote' field referencing gov-005. gov-005 is registered in AUDIT_INDEX. No implementation files are reverted.",
      oneSafeNextStep: "Add a 'scopeNote' field to PhaseExecutionLog Entry 8 acknowledging the combined audit + implementation step and referencing gov-005.",
      dataFile: "src/components/audits/governance/scope-compliance-audit-2026-03-15.jsx",
    },

    {
      id: "perf-001",
      title: "Performance Baseline",
      category: "Performance",
      type: "Performance Analysis",
      status: "planned",
      date: null,
      projectId: "governancehub",
      projectSlug: "governancehub",
      preliminary: true,
      preliminaryNote: "All fields are preliminary scope definitions. No measurements have been taken. Audit must be executed before any field is considered verified.",
      evidenceSource: "preliminary",
      summary: "Performance baseline audit planned but not yet executed. Fields below are scope definitions only — not audit findings.",
      problem: "No performance baselines have been established for GovernanceHub pages. Critical user-facing pages (Admin, Projects, Audits) have unknown load and render characteristics.",
      impact: "Without baselines, performance regressions cannot be detected. Slow admin panel operations may degrade governance workflow effectiveness.",
      affectedFiles: [
        "src/pages/Admin.jsx",
        "src/pages/Home.jsx",
        "src/pages/Projects.jsx",
        "src/pages/Audits.jsx",
      ],
      requiredChange: "Measure and record baseline load and render times for all critical pages. Document measurement method and tooling used.",
      constraints: "Measurement only — no code changes during audit. Use consistent tooling across all pages.",
      acceptanceCriteria: "Baseline metrics recorded for all listed pages. Measurement method documented. Results stored in a versioned audit file.",
      oneSafeNextStep: "Execute the audit: measure baseline load times for all critical pages using consistent tooling.",
    },
  ],
};
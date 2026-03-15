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
      oneSafeNextStep: "Add PhaseExecutionLog entry and AUDIT_INDEX record to complete the governance documentation for this normalization change.",
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
// Canonical source of truth for all audits in GovernanceHub.
// Pages must import from here — do not hardcode audit data in page files.
//
// Enrichment notes:
// - arch-001: fully enriched from verified audit file (admin-ui-file-placement-audit-2026-03-13.jsx)
// - prod-001: partially enriched; actual product intelligence audit data file not found at declared path — preliminary
// - prod-002: partially enriched; actual product utility audit data file not found at declared path — preliminary
// - gov-001: planned — preliminary fields only, no verified evidence yet
// - perf-001: planned — preliminary fields only, no verified evidence yet

export const AUDIT_INDEX = {
  entries: [
    {
      id: "arch-001",
      title: "Admin UI File Placement",
      category: "Architecture",
      type: "File Placement",
      status: "completed",
      date: "2026-03-13",
      projectId: "governancehub",
      projectSlug: "governancehub",
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
      evidenceSource: "repo-derived",
      oneSafeNextStep: "Remove src/components/AdminDashboard.jsx only.",
    },

    {
      id: "prod-001",
      title: "Product Intelligence Audit",
      category: "Product",
      type: "Product Analysis",
      status: "completed",
      date: "2026-03-12",
      projectId: "governancehub",
      projectSlug: "governancehub",
      summary: "Evaluated product scoring model and roadmap prioritization framework. NOTE: The declared file path for this audit (src/components/audits/product/product-intelligence-audit-2026-03-12.jsx) does not exist. The file at the actual path (src/components/product-intelligence-audit-2026-03-12.jsx) contains AUDIT_SYSTEM_GUIDE content, not this audit's data.",
      problem: "The canonical file declared in AUDIT_INDEX for prod-001 (src/components/audits/product/product-intelligence-audit-2026-03-12.jsx) does not exist. The file at the closest matching path (src/components/product-intelligence-audit-2026-03-12.jsx) is misnamed — it exports AUDIT_SYSTEM_GUIDE, not product intelligence audit data.",
      impact: "The product scoring model and roadmap prioritization data from this audit are not accessible via any verified file path. The audit is structurally orphaned.",
      affectedFiles: [
        "src/components/audits/product/product-intelligence-audit-2026-03-12.jsx",
        "src/components/product-intelligence-audit-2026-03-12.jsx",
        "src/components/audits/AUDIT_INDEX.jsx",
      ],
      requiredChange: "Create src/components/audits/product/ directory. Place the actual product intelligence audit data at src/components/audits/product/product-intelligence-audit-2026-03-12.jsx. Update AUDIT_INDEX reference if path changes.",
      constraints: "Do not fabricate product scoring data. Audit content must come from verified source. One structural change at a time.",
      acceptanceCriteria: "A file at src/components/audits/product/product-intelligence-audit-2026-03-12.jsx exists in GitHub, contains the real product intelligence audit data, and is importable.",
      evidenceSource: "repo-derived",
      preliminary: true,
      preliminaryNote: "Problem and impact are verified. requiredChange and acceptanceCriteria are preliminary — actual audit content must be authored before this can be marked implementation-ready.",
    },

    {
      id: "prod-002",
      title: "Product Utility Audit",
      category: "Product",
      type: "Product Analysis",
      status: "completed",
      date: "2026-03-11",
      projectId: "governancehub",
      projectSlug: "governancehub",
      summary: "Reviewed product utility standards and audit documentation template. NOTE: The declared file path for this audit (src/components/audits/product/product-utility-audit-2026-03-11.jsx) does not exist. The file at the closest matching path exports AUDITS_README content, not this audit's data.",
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
      evidenceSource: "repo-derived",
      preliminary: true,
      preliminaryNote: "Problem and impact are verified. requiredChange and acceptanceCriteria are preliminary — depends on prod-001 path resolution and actual audit content authoring.",
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
      summary: "Review governance workflow definitions and enforcement coverage. Not yet started — fields below are preliminary scope definitions only.",
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
      evidenceSource: "preliminary — no file inspection completed yet",
      preliminary: true,
      preliminaryNote: "All fields are preliminary scope definitions. No evidence has been gathered. Audit must be executed before these fields are considered verified.",
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
      summary: "Establish performance baselines for critical user-facing pages. Not yet started — fields below are preliminary scope definitions only.",
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
      evidenceSource: "preliminary — no measurement completed yet",
      preliminary: true,
      preliminaryNote: "All fields are preliminary scope definitions. No measurements have been taken. Audit must be executed before these fields are considered verified.",
    },
  ],
};
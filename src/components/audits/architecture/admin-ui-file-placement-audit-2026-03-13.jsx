export const ADMIN_UI_FILE_PLACEMENT_AUDIT = {
  auditId: "admin-ui-file-placement-audit-2026-03-13",
  auditType: "architecture",
  date: "2026-03-13",
  status: "complete",
  projectId: "governancehub",
  projectSlug: "governancehub",

  title: "Audit admin and UI file placement consistency in GovernanceHub",

  purpose: [
    "Inspect current placement of AdminDashboard, ROADMAP, and product audit files",
    "Determine whether a canonical AdminDashboard file exists and whether one is redundant",
    "Determine whether product audit files are misplaced",
    "Determine whether ROADMAP.jsx is correctly located",
    "Recommend exactly one safe next step",
  ],

  evidenceBasis: [
    "Direct file inspection of all affected paths",
    "Directory listing of src/components, src/components/ui, src/components/audits",
    "Content inspection of src/pages/AdminDashboard.jsx",
    "Content inspection of src/components/AdminDashboard.jsx",
    "Content inspection of src/components/ROADMAP.jsx",
    "Content inspection of src/components/product-intelligence-audit-2026-03-12.jsx",
    "Content inspection of src/components/product-utility-audit-2026-03-11.jsx",
    "Content inspection of src/components/audits/AUDIT_SYSTEM_GUIDE.jsx",
    "Content inspection of src/components/README.jsx (AUDIT_INDEX)",
    "Import path analysis of both AdminDashboard files",
  ],

  correctionToIssuePaths: {
    note: "The issue listed file paths under src/components/ui/. Those files do not exist there. The actual files are under src/components/ (one level up). The audit below is based on the actual locations confirmed by direct inspection.",
    listedInIssue: [
      "src/components/ui/AdminDashboard.jsx — DOES NOT EXIST",
      "src/components/ui/ROADMAP.jsx — DOES NOT EXIST",
      "src/components/ui/product-intelligence-audit-2026-03-12.jsx — DOES NOT EXIST",
      "src/components/ui/product-utility-audit-2026-03-11.jsx — DOES NOT EXIST",
    ],
    actualLocations: [
      "src/pages/AdminDashboard.jsx — EXISTS",
      "src/components/AdminDashboard.jsx — EXISTS",
      "src/components/ROADMAP.jsx — EXISTS",
      "src/components/product-intelligence-audit-2026-03-12.jsx — EXISTS",
      "src/components/product-utility-audit-2026-03-11.jsx — EXISTS",
    ],
  },

  findings: {
    adminDashboard: {
      canonicalFile: "src/pages/AdminDashboard.jsx",
      duplicateFile: "src/components/AdminDashboard.jsx",
      canonicalStatus: "correct location for a page component; not yet registered in pages.config.js",
      duplicateStatus: "redundant — content is byte-for-byte identical to src/pages/AdminDashboard.jsx",
      exportedSymbol: "RoadmapAdminPanel (function name does not match filename in either location)",
      brokenImport: "Both files import from '../roadmap/ROADMAP' — that path resolves to src/roadmap/ROADMAP.jsx or src/pages/roadmap/ROADMAP.jsx, neither of which exists in the repository",
      routingStatus: "AdminDashboard is not registered in pages.config.js and is therefore unreachable through the router",
      additionalNote: "PhaseExecutionLog.jsx references 'src/components/admin/AdminDashboard.jsx' — a third path that also does not exist",
    },

    roadmapJsx: {
      actualPath: "src/components/ROADMAP.jsx",
      actualContent: "Exports PRODUCT_INTELLIGENCE_AUDIT — a product audit data object, not a roadmap UI component",
      namingStatus: "misnamed — file is named ROADMAP.jsx but contains audit data",
      placementStatus: "misplaced — per AUDIT_SYSTEM_GUIDE, product audits belong in src/components/audits/product/",
      canonicalTargetPath: "src/components/audits/product/product-intelligence-audit-2026-03-12.jsx",
      canonicalTargetNote: "This path is already declared in AUDIT_INDEX as the intended location for the P2 product intelligence audit entry",
    },

    productIntelligenceAuditFile: {
      actualPath: "src/components/product-intelligence-audit-2026-03-12.jsx",
      actualContent: "Exports AUDIT_SYSTEM_GUIDE — audit system guide content, not product intelligence audit data",
      namingStatus: "content does not match filename",
      placementStatus: "misplaced at components root; if content were correct it should be in src/components/audits/product/",
      duplicate: "AUDIT_SYSTEM_GUIDE content already exists correctly at src/components/audits/AUDIT_SYSTEM_GUIDE.jsx",
    },

    productUtilityAuditFile: {
      actualPath: "src/components/product-utility-audit-2026-03-11.jsx",
      actualContent: "Exports AUDITS_README — audit README content, not product utility audit data",
      namingStatus: "content does not match filename",
      placementStatus: "misplaced at components root; if content were correct it should be in src/components/audits/product/",
      duplicate: "AUDITS_README content already exists correctly at src/components/audits/README.jsx",
    },

    missingDirectory: {
      path: "src/components/audits/product/",
      status: "DOES NOT EXIST",
      note: "This directory is specified as the canonical location for product audits by AUDIT_SYSTEM_GUIDE and is referenced in AUDIT_INDEX entries P1 and P2, but it has not been created",
    },
  },

  summary: {
    redundant: [
      "src/components/AdminDashboard.jsx — identical duplicate of src/pages/AdminDashboard.jsx",
    ],
    misplaced: [
      "src/components/ROADMAP.jsx — product audit data living at components root with a misleading name",
      "src/components/product-intelligence-audit-2026-03-12.jsx — audit system guide content at components root with a misleading name (duplicates src/components/audits/AUDIT_SYSTEM_GUIDE.jsx)",
      "src/components/product-utility-audit-2026-03-11.jsx — audit README content at components root with a misleading name (duplicates src/components/audits/README.jsx)",
    ],
    broken: [
      "Both AdminDashboard files import from '../roadmap/ROADMAP' — that path does not exist",
      "PhaseExecutionLog.jsx references 'src/components/admin/AdminDashboard.jsx' — that path does not exist",
      "AUDIT_INDEX entries P1 and P2 reference src/components/audits/product/* — that directory does not exist",
    ],
    canonicalLocations: {
      "AdminDashboard (page)": "src/pages/AdminDashboard.jsx — canonical; should be the only AdminDashboard",
      "Product intelligence audit": "src/components/audits/product/product-intelligence-audit-2026-03-12.jsx — currently missing; content is at wrong path",
      "Product utility audit": "src/components/audits/product/product-utility-audit-2026-03-11.jsx — currently missing; content is at wrong path",
      "AUDIT_SYSTEM_GUIDE": "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx — already correct",
      "AUDIT_INDEX": "src/components/audits/AUDIT_INDEX.jsx — already correct; references reflect intended but unimplemented structure",
    },
  },

  oneSafeNextStep:
    "Remove src/components/AdminDashboard.jsx. It is an exact duplicate of src/pages/AdminDashboard.jsx. Removing it resolves the AdminDashboard redundancy without touching any audit or roadmap files, and carries zero risk of breaking anything since neither file is currently registered in the router.",
};

export const ADMIN_ROADMAP_SURFACE_PLACEMENT_AUDIT = {
  meta: {
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
  },

  finding: {
    summary:
      "src/pages/AdminDashboard.jsx exports RoadmapAdminPanel but is not registered in the router, contains empty data objects, and is semantically misnamed. Admin.jsx is the confirmed canonical active admin shell. AdminDashboard.jsx is classified as a deprecation candidate. Its own imports resolve correctly; the stale path issue resides in src/components/ROADMAP.jsx, which lists a non-existent evidence path.",

    problem:
      "The repository has two competing admin surface concepts. src/pages/Admin.jsx functions as the active admin shell with auth, tabs, and operational panels. src/pages/AdminDashboard.jsx exports a component named RoadmapAdminPanel — a semantic mismatch between filename and exported symbol. Additionally, all data objects in AdminDashboard.jsx are empty (FEATURES = [], PHASE_BASELINE = {}, STATUS_DEFINITIONS = {}), making the component functionally inert. AdminDashboard.jsx itself contains no broken import: its imports (react, @/components/ui/card, @/components/ui/badge, lucide-react) all resolve correctly. The stale-path issue is in src/components/ROADMAP.jsx, which lists 'src/components/admin/RoadmapAdminPanel.jsx' as a verified evidence path — that file does not exist anywhere in the repository.",

    impact:
      "AdminDashboard.jsx is inactive code: it is not routed, not imported by any active component, and renders no data. Its imports would resolve correctly if it were ever rendered. The semantic mismatch between the filename and the exported function name creates governance traceability confusion. The stale evidence reference in src/components/ROADMAP.jsx to the non-existent path 'src/components/admin/RoadmapAdminPanel.jsx' propagates incorrect state into governance artifacts.",

    affectedFiles: [
      "src/pages/Admin.jsx",
      "src/pages/AdminDashboard.jsx",
      "src/components/ROADMAP.jsx",
      "src/components/admin/*",
      "src/pages.config.js",
    ],

    verifiedFindings: [
      "Admin.jsx is the canonical active admin shell: confirmed by router registration in App.jsx (Route path='/Admin'), 4-tab layout (Govern, Setup, Build Prep, Strategy), and 10 imported admin components from src/components/admin/.",
      "AdminDashboard.jsx is NOT registered in the App.jsx router. No Route element or import for AdminDashboard exists in App.jsx.",
      "pages.config.js registers only Home as a page. AdminDashboard is not declared as a canonical route in pages.config.js.",
      "AdminDashboard.jsx FEATURES, PHASE_BASELINE, and STATUS_DEFINITIONS are all empty ([], {}, {}). The component renders no data.",
      "The exported symbol in AdminDashboard.jsx is 'RoadmapAdminPanel' — not 'AdminDashboard'. Filename and export are semantically misaligned.",
      "AdminDashboard.jsx has no broken import. Its four imports (react, @/components/ui/card, @/components/ui/badge, lucide-react) are all resolvable. The stale-path issue is a stale evidence reference string in src/components/ROADMAP.jsx, not an import inside AdminDashboard.jsx.",
      "src/components/admin/RoadmapAdminPanel.jsx does not exist. src/components/ROADMAP.jsx references it as an evidence path in its verifiedFromTankRadar array — that reference is stale and should be corrected.",
      "Classification result: DEPRECATION CANDIDATE. AdminDashboard.jsx is not an active standalone page, not a functional admin subpanel, and not imported anywhere in the live application.",
    ],

    classificationDetail: {
      "admin-shell": "canonical-active-admin-shell — Admin.jsx is router-registered at /Admin, auth-gated, 4-tab layout, 10 imported admin components",
      "admin-dashboard": "inactive-page / deprecation-candidate — AdminDashboard.jsx is not router-registered, not imported, has empty data objects, and has a semantic mismatch between filename and export",
      "roadmap-jsx-evidence-ref": "stale-roadmap-reference — src/components/ROADMAP.jsx lists 'src/components/admin/RoadmapAdminPanel.jsx' as a verified evidence path but that file does not exist",
      "roadmap-admin-panel-placement": "unresolved-roadmap-placement-decision — RoadmapAdminPanel could be integrated into Admin.jsx Strategy tab, moved to src/components/admin, or removed; no decision made yet",
    },

    requiredChange:
      "Do not move or delete src/pages/AdminDashboard.jsx in this step. The next safe structural step is to formally propose removal of src/pages/AdminDashboard.jsx in a follow-up task after this audit is registered, and to update the stale reference in src/components/ROADMAP.jsx.",

    constraints: [
      "Implement one structural change at a time.",
      "Do not remove src/pages/AdminDashboard.jsx during this audit step.",
      "Do not move RoadmapAdminPanel based on naming alone.",
      "Do not assume AdminDashboard is dead solely because Admin.jsx exists — verify by router and import inspection.",
      "Verification must be based on actual repository files, not prior summaries.",
    ],

    acceptanceCriteria: [
      "The audit classifies RoadmapAdminPanel as a deprecation candidate based on: not routed, empty data objects, semantic mismatch, no active consumers.",
      "The audit confirms Admin.jsx is the canonical active admin shell.",
      "The audit confirms pages.config.js and App.jsx do not support AdminDashboard as an active route.",
      "The audit recommends exactly one safe next step.",
    ],
  },

  oneSafeNextStep:
    "Propose removal of src/pages/AdminDashboard.jsx in a dedicated follow-up task. Before removal: update the stale reference in src/components/ROADMAP.jsx that points to the non-existent src/components/admin/RoadmapAdminPanel.jsx.",
};

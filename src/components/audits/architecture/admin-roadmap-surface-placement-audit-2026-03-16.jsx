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
      "src/pages/AdminDashboard.jsx exports RoadmapAdminPanel but is not registered in the router, contains empty data objects, has a broken import path, and is semantically misnamed. Admin.jsx is the confirmed canonical active admin shell. AdminDashboard.jsx is classified as a deprecation candidate.",

    problem:
      "The repository has two competing admin surface concepts. src/pages/Admin.jsx functions as the active admin shell with auth, tabs, and operational panels. src/pages/AdminDashboard.jsx exports a component named RoadmapAdminPanel — a semantic mismatch between filename and exported symbol. Additionally, all data objects in AdminDashboard.jsx are empty (FEATURES = [], PHASE_BASELINE = {}, STATUS_DEFINITIONS = {}), making the component functionally inert. The component references a '../roadmap/ROADMAP' import path that does not exist in the repository. src/components/admin/RoadmapAdminPanel.jsx is referenced in src/components/ROADMAP.jsx as an evidence path but does not exist.",

    impact:
      "AdminDashboard.jsx is dead code: it is not routed, not imported by any active component, has empty data, and would fail at runtime if rendered due to a broken import. The semantic mismatch between the filename and the exported function name creates governance traceability confusion. The stale reference in src/components/ROADMAP.jsx to a non-existent path propagates incorrect state into governance artifacts.",

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
      "src/components/admin/RoadmapAdminPanel.jsx does not exist. src/components/ROADMAP.jsx references it as an evidence path — that reference is stale.",
      "Classification result: DEPRECATION CANDIDATE. AdminDashboard.jsx is not an active standalone page, not a functional admin subpanel, and not imported anywhere in the live application.",
    ],

    classification: "deprecation-candidate",

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
      "The audit classifies RoadmapAdminPanel as a deprecation candidate based on: not routed, empty data, broken import, no active consumers.",
      "The audit confirms Admin.jsx is the canonical active admin shell.",
      "The audit confirms pages.config.js and App.jsx do not support AdminDashboard as an active route.",
      "The audit recommends exactly one safe next step.",
    ],
  },

  oneSafeNextStep:
    "Propose removal of src/pages/AdminDashboard.jsx in a dedicated follow-up task. Before removal: update the stale reference in src/components/ROADMAP.jsx that points to the non-existent src/components/admin/RoadmapAdminPanel.jsx.",
};

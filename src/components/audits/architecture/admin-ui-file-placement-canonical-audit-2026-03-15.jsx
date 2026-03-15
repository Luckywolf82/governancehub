export const ADMIN_UI_FILE_PLACEMENT_CANONICAL_AUDIT = {
  meta: {
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
  },

  finding: {
    summary:
      "Ensure Admin UI files live in correct directories and imports resolve correctly.",

    problem:
      "Admin UI components may drift between src/pages and src/components/admin which creates confusion and import instability.",

    impact:
      "Incorrect placement can break routing assumptions, create duplicate components, and produce misleading imports.",

    affectedFiles: [
      "src/pages/AdminDashboard.jsx",
      "src/components/admin",
    ],

    requiredChange:
      "Confirm that AdminDashboard exists only in src/pages and that supporting admin panels live under src/components/admin.",

    constraints:
      "Do not move files unless duplicates are confirmed. Maintain router stability.",

    acceptanceCriteria:
      "AdminDashboard exists only once in src/pages and all supporting admin components live under src/components/admin.",

    oneSafeNextStep:
      "Verify there is no duplicate AdminDashboard component outside src/pages.",
  },
};

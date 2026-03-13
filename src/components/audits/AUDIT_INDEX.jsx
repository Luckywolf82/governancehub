// Canonical source of truth for all audits in GovernanceHub.
// Pages must import from here — do not hardcode audit data in page files.

export const AUDIT_INDEX = {
  entries: [
    {
      id: "arch-001",
      title: "Admin UI File Placement",
      category: "Architecture",
      status: "completed",
      date: "2026-03-13",
      summary: "Audited placement of Admin UI components against project conventions.",
    },
    {
      id: "prod-001",
      title: "Product Intelligence Audit",
      category: "Product",
      status: "completed",
      date: "2026-03-12",
      summary: "Evaluated product scoring model and roadmap prioritization framework.",
    },
    {
      id: "prod-002",
      title: "Product Utility Audit",
      category: "Product",
      status: "completed",
      date: "2026-03-11",
      summary: "Reviewed product utility standards and audit documentation template.",
    },
    {
      id: "gov-001",
      title: "Governance Workflow Review",
      category: "Governance",
      status: "planned",
      date: null,
      summary: "Review governance workflow definitions and enforcement coverage.",
    },
    {
      id: "perf-001",
      title: "Performance Baseline",
      category: "Performance",
      status: "planned",
      date: null,
      summary: "Establish performance baselines for critical user-facing pages.",
    },
  ],
};
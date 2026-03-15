// Internal workstream and subsystem registry for GovernanceHub.
// This file tracks internal workstreams/subsystems — NOT governed external repositories.
// For governed repositories, see src/projects/PROJECT_REGISTRY.js instead.
// Pages must import from here — do not hardcode workstream data in page files.

export const WORKSTREAM_REGISTRY = {
  entries: [
    {
      id: "proj-001",
      name: "GovernanceHub Core",
      description: "Core platform infrastructure, routing, and authentication.",
      status: "active",
      phase: "Phase 1",
      owner: "Platform Team",
    },
    {
      id: "proj-002",
      name: "Audit Trail System",
      description: "Structured audit logging and compliance reporting for all governance actions.",
      status: "in-progress",
      phase: "Phase 2",
      owner: "Compliance Team",
    },
    {
      id: "proj-003",
      name: "Admin Dashboard",
      description: "Administrative panel for managing users, roles, and system configuration.",
      status: "in-progress",
      phase: "Phase 1",
      owner: "Platform Team",
    },
    {
      id: "proj-004",
      name: "Policy Management",
      description: "Define, publish, and enforce organizational policies across teams.",
      status: "planned",
      phase: "Phase 3",
      owner: "Governance Team",
    },
    {
      id: "proj-005",
      name: "Execution Logs",
      description: "Full history of process executions with filtering and export.",
      status: "planned",
      phase: "Phase 3",
      owner: "Platform Team",
    },
  ],
};

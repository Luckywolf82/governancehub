/**
 * WORKSTREAM REGISTRY
 *
 * Internal workstream and subsystem registry for GovernanceHub.
 * This file tracks internal workstreams/subsystems — NOT governed external repositories.
 * For governed repositories, see src/projects/PROJECT_REGISTRY.js instead.
 */

export const WORKSTREAM_REGISTRY = {
  entries: [
    {
      id: "example-project",

      slug: "example-project",

      name: "Example Project",

      description:
        "Starter project initialized with GovernanceHub.",

      phase: "bootstrap",

      status: "active",

      owner: "repository-owner",

      repo: {
        owner: "repository-owner",
        name: "repository-name",
        fullName: "repository-owner/repository-name"
      }
    }
  ]
};

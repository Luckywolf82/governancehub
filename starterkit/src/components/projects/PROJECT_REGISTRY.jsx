/**
 * PROJECT REGISTRY
 *
 * Canonical list of projects managed by GovernanceHub.
 */

export const PROJECT_REGISTRY = {
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

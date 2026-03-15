/**
 * AI STATE
 *
 * Current project state used by governance engine.
 */

export const AI_STATE = {
  projectId: "example-project",
  projectSlug: "example-project",

  projectName: "Example Project",

  repo: {
    owner: "repo-owner",
    name: "repo-name",
    fullName: "repo-owner/repo-name"
  },

  phase: "bootstrap",

  status: "initializing",

  lastVerified: null,

  activeWorkstream: "governance-bootstrap"
};

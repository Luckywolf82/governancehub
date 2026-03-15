/**
 * AI STATE
 *
 * Current project state used by governance engine.
 */

export const AI_STATE = {
  projectId: null,
  projectSlug: null,

  projectName: null,

  repo: {
    owner: null,
    name: null,
    fullName: null
  },

  phase: "bootstrap",

  status: "initializing",

  lastVerified: null,

  activeWorkstream: "governance-bootstrap"
};

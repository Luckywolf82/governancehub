/**
 * NEXT SAFE STEP
 *
 * Defines the current approved action for the AI agent.
 */

export const NEXT_SAFE_STEP = {
  title: "Baseline Repository Audit",

  reason:
    "Verify repository structure before implementing governance features.",

  scope: [
    "inspect repo structure",
    "verify governance files",
    "identify missing dependencies"
  ],

  blockedBy: []
};

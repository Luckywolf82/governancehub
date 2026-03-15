/**
 * AI PROJECT INSTRUCTIONS — GovernanceHub Starter
 *
 * Core governance rules for AI agents working in this repository.
 *
 * These instructions define:
 * - repository verification protocol
 * - audit workflow
 * - development loop
 * - locked file protection
 */

export const AI_PROJECT_INSTRUCTIONS = {
  version: "starter-1.0",

  repositoryVerification: {
    rule: "Always read repository files before making changes.",
    principle: "Verification requires direct repository inspection.",
    forbiddenSources: [
      "memory",
      "cached repo snapshots",
      "assumptions"
    ]
  },

  developmentLoop: [
    "verify",
    "audit",
    "propose",
    "implement",
    "publish",
    "verify"
  ],

  criticalRules: [
    "Implement one structural change at a time.",
    "Do not modify locked files without explicit approval.",
    "Never assume repository structure.",
    "Always verify repository state before and after changes."
  ],

  auditRequirement: {
    requiredWhen: [
      "architecture unclear",
      "routing broken",
      "multiple cleanup paths",
      "structural changes required"
    ]
  }
};

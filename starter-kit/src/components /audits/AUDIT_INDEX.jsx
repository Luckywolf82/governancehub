/**
 * AUDIT INDEX
 *
 * Canonical registry of all audits.
 */

export const AUDIT_INDEX = {
  entries: [
    {
      auditId: "baseline-repo-audit",

      projectId: "example-project",
      projectSlug: "example-project",

      title: "Baseline Repository Audit",

      type: "architecture",

      status: "pending",

      date: "bootstrap",

      problem:
        "Repository structure not yet verified.",

      impact:
        "Potential architecture inconsistencies.",

      affectedFiles: [],

      requiredChange:
        "Inspect repository and confirm structure.",

      constraints: [
        "Do not modify locked files."
      ],

      acceptanceCriteria: [
        "Repository structure verified",
        "Governance files confirmed"
      ],

      oneSafeNextStep: "Run baseline audit."
    }
  ]
};

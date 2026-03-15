/**
 * AUDIT SYSTEM GUIDE
 *
 * Defines the structure and requirements for system audits.
 */

export const AUDIT_SYSTEM_GUIDE = {
  auditStructure: [
    "Audit Title",
    "Type",
    "Problem",
    "Impact",
    "Affected Files",
    "Required Change",
    "Constraints",
    "Acceptance Criteria"
  ],

  purpose:
    "Audits diagnose architectural or structural issues before implementation.",

  rules: [
    "Audits must precede structural changes when system state is unclear.",
    "Audits must include affected files.",
    "Audits must define acceptance criteria."
  ]
};

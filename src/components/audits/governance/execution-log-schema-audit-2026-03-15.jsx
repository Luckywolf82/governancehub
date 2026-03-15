// gov-003 — Execution Log Schema Consistency Audit
// Date: 2026-03-15
// Project: GovernanceHub
// Status: verified
// Evidence source: repo-derived — direct file inspection of PhaseExecutionLog.jsx,
//   AI_PROJECT_INSTRUCTIONS.jsx, and INSTALL_POLICY.jsx

export const EXECUTION_LOG_SCHEMA_AUDIT = {
  id: "gov-003",
  title: "Execution Log Schema Consistency",
  category: "Governance",
  type: "Schema Drift Audit",
  status: "verified",
  date: "2026-03-15",
  projectId: "governancehub",
  projectSlug: "governancehub",
  preliminary: false,
  evidenceSource: "repo-derived",

  summary:
    "Audited execution log schema consistency across PhaseExecutionLog.jsx, AI_PROJECT_INSTRUCTIONS.jsx, and INSTALL_POLICY.jsx. " +
    "Two of the three PhaseExecutionLog entries are missing the required 'taskRequested' field. " +
    "INSTALL_POLICY.jsx defines a divergent logging schema that omits two required fields ('task', 'changedFiles') " +
    "and adds three fields not present in the canonical required-field list ('filesCreated', 'filesModified', 'commitRef').",

  // ── Canonical required fields ───────────────────────────────────────────────
  // Source: AI_PROJECT_INSTRUCTIONS.jsx → executionLog.requiredFields
  canonicalRequiredFields: [
    "id",
    "date",
    "task",
    "taskRequested",
    "changedFiles",
    "diffSummary",
    "githubVisibility",
    "lockedFileVerification",
  ],

  // ── PhaseExecutionLog entry analysis ───────────────────────────────────────
  phaseExecutionLogFindings: {
    file: "src/components/governance/PhaseExecutionLog.jsx",
    totalEntries: 3,
    entries: [
      {
        entryId: "Entry 1",
        fieldsPresent: [
          "id",
          "date",
          "task",
          "changedFiles",
          "diffSummary",
          "githubVisibility",
          "lockedFileVerification",
        ],
        missingRequiredFields: ["taskRequested"],
        schemaDrift: true,
        note: "taskRequested field is absent. All other required fields are present.",
      },
      {
        entryId: "Entry 2",
        fieldsPresent: [
          "id",
          "date",
          "task",
          "taskRequested",
          "changedFiles",
          "diffSummary",
          "githubVisibility",
          "lockedFileVerification",
        ],
        missingRequiredFields: [],
        schemaDrift: false,
        note: "All canonical required fields are present. No drift detected.",
      },
      {
        entryId: "Entry 3",
        fieldsPresent: [
          "id",
          "date",
          "task",
          "changedFiles",
          "diffSummary",
          "githubVisibility",
          "lockedFileVerification",
        ],
        missingRequiredFields: ["taskRequested"],
        schemaDrift: true,
        note: "taskRequested field is absent. All other required fields are present.",
      },
    ],
  },

  // ── INSTALL_POLICY schema analysis ─────────────────────────────────────────
  installPolicyFindings: {
    file: "src/components/governance/INSTALL_POLICY.jsx",
    section: "loggingRules.schema",
    schemaFieldsDeclared: [
      "id",
      "date",
      "taskRequested",
      "filesCreated",
      "filesModified",
      "diffSummary",
      "commitRef",
      "githubVisibility",
      "lockedFileVerification",
    ],
    missingVsCanonical: ["task", "changedFiles"],
    extraVsCanonical: ["filesCreated", "filesModified", "commitRef"],
    schemaDrift: true,
    note:
      "INSTALL_POLICY.loggingRules.schema is installation-specific. It replaces 'changedFiles' with " +
      "the more granular 'filesCreated' + 'filesModified', omits 'task' (uses 'taskRequested' only), " +
      "and adds 'commitRef'. These deviations are contextually explained by the install use case but " +
      "are formally incompatible with the canonical requiredFields list in AI_PROJECT_INSTRUCTIONS.",
  },

  // ── Consolidated drift report ──────────────────────────────────────────────
  problem: `Schema drift detected in two of three places:

1. PhaseExecutionLog.jsx — Entry 1 and Entry 3 each omit 'taskRequested'.
   Entry 2 is fully compliant. The required field is inconsistently applied.

2. INSTALL_POLICY.jsx — The loggingRules.schema block defines a logging schema
   that diverges from AI_PROJECT_INSTRUCTIONS.executionLog.requiredFields:
   - MISSING from INSTALL_POLICY schema: 'task', 'changedFiles'
   - EXTRA in INSTALL_POLICY schema (not in requiredFields): 'filesCreated',
     'filesModified', 'commitRef'
   INSTALL_POLICY's schema is install-operation-specific and was never aligned
   with the canonical required-field list.`,

  impact:
    "Incomplete entries in PhaseExecutionLog reduce traceability — it is not clear what was " +
    "requested for Entry 1 and Entry 3 versus what was inferred as the task. " +
    "INSTALL_POLICY's divergent schema means any install-logged entry would fail schema validation " +
    "against the canonical requiredFields and would be missing 'task' and 'changedFiles' while " +
    "carrying undeclared extra fields.",

  affectedFiles: [
    "src/components/governance/PhaseExecutionLog.jsx",
    "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
    "src/components/governance/INSTALL_POLICY.jsx",
  ],

  requiredChange: `Two remediation steps are required (one at a time):

Step 1 — PhaseExecutionLog.jsx:
  Add 'taskRequested' to Entry 1 and Entry 3. Value should describe what was
  originally requested (infer from 'task' if no original request text is available,
  or mark as 'Not recorded at time of entry').

Step 2 — INSTALL_POLICY.jsx loggingRules.schema:
  Align the install-specific schema with the canonical requiredFields. Options:
  a) Add 'task' and replace 'filesCreated'+'filesModified' with 'changedFiles',
     and remove 'commitRef'; or
  b) Keep the install-specific extensions and note them as additions beyond the
     canonical minimum, making 'task' and 'changedFiles' explicit in the schema.`,

  constraints:
    "Both files are locked. Modifications require audit review. " +
    "One structural change at a time. Append PhaseExecutionLog entry after each verified change. " +
    "Do not fabricate taskRequested values — only record what is verifiable.",

  acceptanceCriteria:
    "All PhaseExecutionLog entries include every field in executionLog.requiredFields. " +
    "INSTALL_POLICY.loggingRules.schema either matches the canonical required-field list " +
    "or explicitly documents which fields are additions and which satisfy which canonical field.",

  oneSafeNextStep:
    "Add 'taskRequested' to PhaseExecutionLog Entry 1 and Entry 3 — the minimum change " +
    "needed to bring existing log entries into compliance with the declared required-field schema.",
};

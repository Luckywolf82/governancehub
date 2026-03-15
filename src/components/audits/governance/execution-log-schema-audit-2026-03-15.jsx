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

  // ── Field overlap analysis ─────────────────────────────────────────────────
  // Answers question 4: Which fields overlap?
  overlappingFields: {
    description:
      "Fields present in both AI_PROJECT_INSTRUCTIONS.executionLog.requiredFields and INSTALL_POLICY.loggingRules.schema",
    fields: [
      "id",
      "date",
      "taskRequested",
      "diffSummary",
      "githubVisibility",
      "lockedFileVerification",
    ],
    count: 6,
    note:
      "Six of the eight canonical required fields are already present in INSTALL_POLICY.loggingRules.schema.",
  },

  // ── Intentional divergence analysis ───────────────────────────────────────
  // Answers question 6: Is the divergence intentional and justifiable?
  intentionalDivergenceAnalysis: {
    assessment: "partially intentional",
    justification: [
      "'filesCreated' and 'filesModified' are install-specific granularizations of 'changedFiles'. " +
        "An install operation has a meaningful distinction between files it creates versus files it modifies. " +
        "This distinction is not present in general runtime execution entries.",
      "'commitRef' is install-specific: it captures the commit SHA after an install write, " +
        "which is not applicable to general runtime governance changes. Its presence is justified.",
      "Omitting 'task' is not clearly justified. The canonical schema treats 'task' as a required field. " +
        "Install log entries should record a 'task' value to remain canonical-schema-compliant.",
      "The divergence is partially intentional (granular file tracking via 'filesCreated'/'filesModified', " +
        "and 'commitRef' for install traceability) and partially accidental (missing 'task').",
    ],
  },

  // ── Options considered ────────────────────────────────────────────────────
  // Answers question 7 via enumerated options
  optionsConsidered: [
    {
      option: 1,
      label: "Exact match — align INSTALL_POLICY schema to the canonical requiredFields exactly",
      description:
        "Replace 'filesCreated' + 'filesModified' with 'changedFiles', add 'task', remove 'commitRef'.",
      tradeoffs:
        "Loses meaningful install granularity. 'filesCreated' vs 'filesModified' is a useful distinction " +
        "for install auditing. 'commitRef' provides install traceability with no equivalent in runtime logs.",
      suitable: false,
    },
    {
      option: 2,
      label: "Explicit install-specific subschema — treat INSTALL_POLICY schema as fully independent",
      description:
        "Declare INSTALL_POLICY.loggingRules.schema as a separate schema with no obligation to conform " +
        "to the canonical required-field list.",
      tradeoffs:
        "Install-originated log entries would fail canonical validation. Governance tooling and audit " +
        "checks could not treat all PhaseExecutionLog entries uniformly.",
      suitable: false,
    },
    {
      option: 3,
      label: "Extension of canonical runtime schema — treat INSTALL_POLICY schema as a documented superset",
      description:
        "Require INSTALL_POLICY.loggingRules.schema to include all canonical required fields, then explicitly " +
        "allow additional install-specific fields. Add 'task' to INSTALL_POLICY schema. Document " +
        "'filesCreated' and 'filesModified' as the install-granular substitution for 'changedFiles'. " +
        "Retain 'commitRef' as an approved install-specific extension.",
      tradeoffs:
        "Requires adding 'task' to INSTALL_POLICY.loggingRules.schema (a locked file). Minor change but " +
        "justified by schema alignment. All extensions are explicitly documented.",
      suitable: true,
    },
  ],

  // ── Recommended model ──────────────────────────────────────────────────────
  // Answers question 7: What should be the canonical relationship?
  recommendedModel: {
    option: 3,
    label: "Extension of canonical runtime schema",
    rationale: [
      "Six of the eight canonical required fields are already present in INSTALL_POLICY.loggingRules.schema, " +
        "confirming the install schema was designed with the canonical schema in mind.",
      "The two missing canonical fields can be resolved minimally: add 'task' explicitly to the schema, " +
        "and document 'filesCreated' + 'filesModified' as the install-granular equivalent of 'changedFiles'.",
      "'filesCreated', 'filesModified', and 'commitRef' are genuine install-context additions that " +
        "improve traceability without conflicting with canonical fields.",
      "Option 1 loses install-specific granularity with no governance benefit. " +
        "Option 2 creates a non-canonical schema class that cannot be uniformly validated.",
    ],
    minimumChangeRequired:
      "Add 'task' to INSTALL_POLICY.loggingRules.schema and annotate 'filesCreated' + 'filesModified' " +
      "as the install-approved substitution for 'changedFiles'.",
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

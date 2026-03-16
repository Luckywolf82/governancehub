// ApprovedChangePromptSpec — governance schema/data artifact
// gov-006 Phase 2 — created 2026-03-16
// Project: GovernanceHub (projectId: governancehub, projectSlug: governancehub)
//
// This file is a pure schema/data artifact.
// It defines the fixed structure, required sections, and blocked capabilities
// for any implementation prompt generated from an ApprovedChangePlan.
// It does NOT implement prompt generation, execution logic, PR creation,
// dispatch capability, state mutation, or any runtime workflow.
//
// Conceptual position:
//   ApprovedChangePlan → [ApprovedChangePromptSpec] → future prompt generator
//
// Separation of concerns:
//   ApprovedChangePlanSpec.jsx       — schema contract between approval and execution
//   ApprovedChangePromptSpec.jsx     — schema contract for prompt generation from an approved plan (this file)
//   Future: prompt generator         — may only be built after this spec is verified in GitHub
//   Future: execution components     — may only be built after the prompt generator is verified

// ── Spec metadata ──────────────────────────────────────────────────────────────

export const specMeta = {
  specId: "approved-change-prompt-spec",
  version: "1.0.0",
  governedBy: "gov-006",
  projectId: "governancehub",
  projectSlug: "governancehub",
  createdAt: "2026-03-16",
  description:
    "Defines the fixed structure, required sections, and blocked capabilities for any " +
    "implementation prompt generated from an ApprovedChangePlan. " +
    "This spec sits between the approved change plan layer and any future prompt generator. " +
    "Prompt generation does not imply dispatch. Prompt generation does not imply execution. " +
    "Prompts must preserve the repo binding, allowedFiles, outOfScope, locked-file restrictions, " +
    "acceptance criteria, and post-merge verification requirements from the source plan exactly.",
  status: "schema-only",
  dispatchable: false,
  autoExecutable: false,
  promptGenerationImplemented: false,
  note:
    "This spec does not implement prompt generation. A future prompt generator component must be " +
    "built separately, must reference this spec, and must not be created until this spec is " +
    "verified in GitHub.",
};

// ── Required prompt inputs ─────────────────────────────────────────────────────
// Every prompt generated from an ApprovedChangePlan must be derived from these
// source fields. A generator that omits any required input field must be rejected.
// Field names map directly to ApprovedChangePlanSpec.requiredPlanFields.

export const requiredPromptInputs = [
  {
    field: "repoFullName",
    sourcePlanField: "repoFullName",
    purpose:
      "Binds the prompt to its specific repository. Must appear in the REPOSITORY section of the prompt. " +
      "Prompts without an explicit repo binding are not valid.",
    mustBePreservedExactly: true,
  },
  {
    field: "goal",
    sourcePlanField: "goal",
    purpose:
      "Defines the objective of the implementation prompt. Must appear in the GOAL section. " +
      "The goal must not be paraphrased, expanded, or narrowed by the generator.",
    mustBePreservedExactly: true,
  },
  {
    field: "allowedFiles",
    sourcePlanField: "allowedFiles",
    purpose:
      "Defines the exhaustive list of files the prompt may authorize for change. " +
      "Must appear in the FILES YOU MAY CHANGE section. " +
      "No file outside this list may be added by the generator.",
    mustBePreservedExactly: true,
  },
  {
    field: "outOfScope",
    sourcePlanField: "outOfScope",
    purpose:
      "Defines the explicit list of excluded actions, files, and capabilities. " +
      "Must appear in the OUT OF SCOPE section. " +
      "The generator must not remove or reorder any outOfScope item.",
    mustBePreservedExactly: true,
  },
  {
    field: "acceptanceCriteria",
    sourcePlanField: "acceptanceCriteria",
    purpose:
      "Defines the verifiable conditions the implementation must satisfy. " +
      "Must appear in the ACCEPTANCE CRITERIA section verbatim.",
    mustBePreservedExactly: true,
  },
  {
    field: "verificationBranch",
    sourcePlanField: "verificationBranch",
    purpose:
      "Identifies the Git branch against which post-merge verification must occur. " +
      "Must appear in the POST-MERGE VERIFICATION NOTES section.",
    mustBePreservedExactly: true,
  },
  {
    field: "requiresPostMergeVerification",
    sourcePlanField: "requiresPostMergeVerification",
    purpose:
      "Confirms that a post-merge verification step is required and must be noted in the prompt. " +
      "A prompt derived from a plan where this field is false must be rejected.",
    mustBePreservedExactly: true,
  },
  {
    field: "id",
    sourcePlanField: "id",
    purpose:
      "Provides the plan identity for audit traceability. Must appear in the TASK section " +
      "to make the prompt traceable to its source plan.",
    mustBePreservedExactly: true,
  },
  {
    field: "title",
    sourcePlanField: "title",
    purpose:
      "Provides the human-readable task title for the TASK section of the prompt.",
    mustBePreservedExactly: true,
  },
  {
    field: "approvalStatus",
    sourcePlanField: "approvalStatus",
    purpose:
      "Must be confirmed as 'approved' before a prompt may be generated. " +
      "A generator that produces a prompt from a plan with approvalStatus !== 'approved' " +
      "is in violation of this spec.",
    mustBePreservedExactly: false,
    validationOnly: true,
    validationRule: "approvalStatus must equal 'approved'",
  },
  {
    field: "singleStepOnly",
    sourcePlanField: "singleStepOnly",
    purpose:
      "Must be confirmed as true before a prompt may be generated. " +
      "A generator that produces a multi-step prompt violates the one-safe-change-at-a-time principle.",
    mustBePreservedExactly: false,
    validationOnly: true,
    validationRule: "singleStepOnly must be true",
  },
];

// ── Prompt sections ────────────────────────────────────────────────────────────
// Defines the fixed set of sections that every generated prompt must contain.
// Section labels are canonical — a generator must not rename, merge, reorder
// (except as permitted by sectionOrderingRules), or omit any section listed here.

export const promptSections = [
  {
    sectionKey: "TASK",
    label: "TASK",
    required: true,
    sourceFields: ["id", "title"],
    description:
      "Identifies the specific change task. Must include the plan id for audit traceability " +
      "and the plan title as the human-readable task description. " +
      "Must not describe actions outside the plan's allowedFiles.",
  },
  {
    sectionKey: "REPOSITORY",
    label: "REPOSITORY",
    required: true,
    sourceFields: ["repoFullName"],
    description:
      "Identifies the target repository. Must use the exact repoFullName value from the source plan. " +
      "Prompts that omit or alter the repository binding are not valid.",
  },
  {
    sectionKey: "GOAL",
    label: "GOAL",
    required: true,
    sourceFields: ["goal"],
    description:
      "States the objective of the implementation. Must use the exact goal text from the source plan. " +
      "The generator must not paraphrase, expand, or narrow the goal.",
  },
  {
    sectionKey: "FILES_YOU_MAY_CHANGE",
    label: "FILES YOU MAY CHANGE",
    required: true,
    sourceFields: ["allowedFiles"],
    description:
      "Lists every file path the implementer is permitted to change. " +
      "Must reproduce the allowedFiles array from the source plan exactly. " +
      "No additional files may be added. No file may be removed from this list.",
  },
  {
    sectionKey: "FILES_YOU_MUST_NOT_CHANGE",
    label: "FILES YOU MUST NOT CHANGE",
    required: true,
    sourceFields: ["allowedFiles"],
    derivedFrom:
      "All locked file paths from lockedFilePromptRules that do not appear in allowedFiles " +
      "must be listed here explicitly. Additionally, any project file not in allowedFiles " +
      "must be treated as must-not-change.",
    description:
      "Lists files that must not be modified under this prompt. Must always include all locked files " +
      "not present in allowedFiles. Must be populated by the generator — an empty section is " +
      "not permitted unless every locked file appears in allowedFiles with explicit approval.",
  },
  {
    sectionKey: "OUT_OF_SCOPE",
    label: "OUT OF SCOPE",
    required: true,
    sourceFields: ["outOfScope"],
    description:
      "Lists all actions, files, and capabilities explicitly excluded from this prompt. " +
      "Must reproduce the outOfScope array from the source plan exactly. " +
      "The generator must not remove or reorder any out-of-scope item.",
  },
  {
    sectionKey: "ACCEPTANCE_CRITERIA",
    label: "ACCEPTANCE CRITERIA",
    required: true,
    sourceFields: ["acceptanceCriteria"],
    description:
      "Lists the verifiable conditions the implementation must satisfy. " +
      "Must reproduce the acceptanceCriteria array from the source plan verbatim. " +
      "The generator must not weaken, generalize, or remove any criterion.",
  },
  {
    sectionKey: "LOCKED_FILE_RULES",
    label: "LOCKED FILE RULES",
    required: true,
    sourceFields: [],
    derivedFrom: "lockedFilePromptRules",
    description:
      "States the locked-file restrictions that apply to this prompt. " +
      "Must list every locked file path and its governing rule as defined in lockedFilePromptRules. " +
      "Must explicitly note which locked files may not be modified under this plan.",
  },
  {
    sectionKey: "DELIVERABLES_REQUIRED",
    label: "DELIVERABLES REQUIRED",
    required: true,
    sourceFields: [],
    derivedFrom: "deliverablesFormatRequirements",
    description:
      "Lists the specific deliverables the implementer must produce. " +
      "Format and required items are governed by deliverablesFormatRequirements.",
  },
  {
    sectionKey: "POST_MERGE_VERIFICATION_NOTES",
    label: "POST-MERGE VERIFICATION NOTES",
    required: true,
    sourceFields: ["verificationBranch", "requiresPostMergeVerification"],
    description:
      "States the post-merge verification requirements for this prompt. " +
      "Must include the verificationBranch value from the source plan. " +
      "Must note that post-merge verification is required and must be recorded " +
      "in the execution log before the task is marked complete.",
  },
];

// ── Section ordering rules ─────────────────────────────────────────────────────
// Defines the required section order for a valid generated prompt.
// Sections must appear in the order defined here.
// No section may be inserted between required sections without updating this spec.

export const sectionOrderingRules = {
  orderedSections: [
    "TASK",
    "REPOSITORY",
    "GOAL",
    "FILES YOU MAY CHANGE",
    "FILES YOU MUST NOT CHANGE",
    "OUT OF SCOPE",
    "ACCEPTANCE CRITERIA",
    "LOCKED FILE RULES",
    "DELIVERABLES REQUIRED",
    "POST-MERGE VERIFICATION NOTES",
  ],
  rules: [
    "Sections must appear in the exact order listed above.",
    "No section may be omitted.",
    "No section may be renamed.",
    "No new section may be inserted between existing sections without updating this spec first.",
    "A new section may only be appended after POST-MERGE VERIFICATION NOTES, and only after this spec is updated to declare it.",
  ],
};

// ── Prompt output constraints ──────────────────────────────────────────────────
// Constraints that govern the overall output of any generated prompt.
// These apply in addition to the per-section rules in promptSections.

export const promptOutputConstraints = [
  {
    constraint: "Repo binding must be preserved",
    detail:
      "The generated prompt must include the exact repoFullName value from the source plan. " +
      "A prompt without an explicit, unaltered repository binding is invalid.",
  },
  {
    constraint: "allowedFiles must be preserved exactly",
    detail:
      "The FILES YOU MAY CHANGE section must list the allowedFiles array from the source plan " +
      "without additions, removals, or reordering.",
  },
  {
    constraint: "outOfScope must be preserved exactly",
    detail:
      "The OUT OF SCOPE section must reproduce the outOfScope array from the source plan " +
      "without removals or reordering. Additional items may be appended only if they are " +
      "derivable from blockedPromptCapabilities and not already present.",
  },
  {
    constraint: "acceptanceCriteria must be preserved verbatim",
    detail:
      "The ACCEPTANCE CRITERIA section must reproduce every criterion from the source plan " +
      "without weakening, generalizing, or removing any item.",
  },
  {
    constraint: "Locked-file restrictions must be stated explicitly",
    detail:
      "The LOCKED FILE RULES section must list every locked file and its governing rule. " +
      "Omitting a locked file from this section is not permitted.",
  },
  {
    constraint: "Post-merge verification must be stated",
    detail:
      "The POST-MERGE VERIFICATION NOTES section must explicitly state that post-merge " +
      "verification is required and must name the verificationBranch from the source plan.",
  },
  {
    constraint: "Prompt must be derived from an approved plan only",
    detail:
      "A prompt may only be generated from a plan with approvalStatus === 'approved'. " +
      "Draft, pending-review, rejected, and superseded plans must not produce prompts.",
  },
  {
    constraint: "Prompt generation does not imply dispatch",
    detail:
      "Generating a prompt from this spec is not a dispatch action. " +
      "No dispatch component, dispatch log, or dispatch workflow may be triggered by or " +
      "inferred from the existence of a generated prompt.",
  },
  {
    constraint: "Prompt generation does not imply execution",
    detail:
      "Generating a prompt from this spec is not an execution action. " +
      "A generated prompt is an artifact for human review — it does not authorize, trigger, " +
      "or schedule any code change, merge, or deployment.",
  },
  {
    constraint: "Prompt must cover a single safe step only",
    detail:
      "singleStepOnly must be true in the source plan. A prompt that covers or implies " +
      "multiple structural change steps violates the one-safe-change-at-a-time principle " +
      "and must not be generated.",
  },
];

// ── Blocked prompt capabilities ────────────────────────────────────────────────
// Capabilities that must never appear in, be implied by, or be triggered by
// a prompt generated under this spec, regardless of the source plan's content.

export const blockedPromptCapabilities = [
  {
    capability: "Dispatch instructions",
    blocked: true,
    reason:
      "A generated prompt must not include instructions to dispatch any artifact, message, " +
      "or action to any target. Dispatch is governed by a separate track and is not part of " +
      "the change-plan-to-prompt pipeline.",
  },
  {
    capability: "Execution trigger",
    blocked: true,
    reason:
      "A generated prompt must not include instructions to auto-execute, auto-merge, or " +
      "auto-deploy any change. Execution requires a separately verified execution component.",
  },
  {
    capability: "PR creation instructions",
    blocked: true,
    reason:
      "A generated prompt must not include instructions to create a pull request. " +
      "PR creation is a future governance phase not authorized by this spec.",
  },
  {
    capability: "Backend change instructions",
    blocked: true,
    reason:
      "A generated prompt must not include instructions to modify backend services, " +
      "APIs, databases, or infrastructure. This spec governs front-end governance schema " +
      "artifacts only.",
  },
  {
    capability: "Locked file modification without explicit approval",
    blocked: true,
    reason:
      "A generated prompt must not instruct the implementer to modify any locked file unless " +
      "that file appears in the source plan's allowedFiles with approvedForThisPlan === true " +
      "in its lockedFileHandling entry.",
  },
  {
    capability: "Multi-step execution plan",
    blocked: true,
    reason:
      "A generated prompt must not describe or imply more than one structural change step. " +
      "singleStepOnly is a required invariant of the source plan.",
  },
  {
    capability: "Variable resolution for dispatch",
    blocked: true,
    reason:
      "A generated prompt must not include resolved variable substitutions intended for a " +
      "dispatch target. Prompt variable resolution for dispatch is governed by " +
      "PromptProfileApprovalPolicy and requires separately verified governance phases.",
  },
  {
    capability: "Approval state transition",
    blocked: true,
    reason:
      "A generated prompt must not include instructions to change the approvalStatus of any " +
      "plan, profile, or governance artifact. Approval transitions are governed by their " +
      "respective policy artifacts.",
  },
];

// ── Blocked interpretations ────────────────────────────────────────────────────
// Explicit statements of what this spec must never be interpreted as authorizing.

export const blockedInterpretations = [
  {
    interpretation: "spec existence === prompt generator available",
    blocked: true,
    reason:
      "The existence of this spec artifact does not mean a prompt generator is available. " +
      "This spec defines the schema contract only. No prompt generation may occur until " +
      "a generator component is separately created and verified in GitHub.",
  },
  {
    interpretation: "generated prompt === execution authorized",
    blocked: true,
    reason:
      "A generated prompt is a human-review artifact only. It does not authorize, schedule, " +
      "or trigger execution of any code change. Execution authorization requires a separately " +
      "verified execution component.",
  },
  {
    interpretation: "generated prompt === dispatch authorized",
    blocked: true,
    reason:
      "A generated prompt is not a dispatch artifact. Generating a prompt does not grant " +
      "dispatch rights. Dispatch requires a separately verified dispatch governance path.",
  },
  {
    interpretation: "approved plan === prompt already generated",
    blocked: true,
    reason:
      "An approved change plan does not imply that a prompt has been generated from it. " +
      "Plan approval and prompt generation are separate steps in the governance pipeline.",
  },
  {
    interpretation: "prompt generation === PR creation",
    blocked: true,
    reason:
      "Generating a prompt from an approved plan does not create a PR. " +
      "PR creation is a future governance phase and is not part of this spec.",
  },
  {
    interpretation: "allowedFiles in prompt === files modified",
    blocked: true,
    reason:
      "The FILES YOU MAY CHANGE section of a generated prompt describes the permitted scope — " +
      "it does not mean those files have been, or will be, modified. Modification only occurs " +
      "after a human implementer acts on the prompt through the verified execution path.",
  },
];

// ── Locked file prompt rules ───────────────────────────────────────────────────
// Governs how locked files must be handled in every generated prompt.
// The LOCKED FILE RULES section of a generated prompt must reproduce these rules.
// A generator must not omit any locked file from the LOCKED FILE RULES section.

export const lockedFilePromptRules = {
  policy:
    "Every generated prompt must include a LOCKED FILE RULES section that lists all locked files " +
    "and their governing rules. A locked file may only appear in FILES YOU MAY CHANGE if its " +
    "corresponding source plan entry has approvedForThisPlan === true. " +
    "All other locked files must appear in FILES YOU MUST NOT CHANGE.",
  lockedFilePaths: [
    "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
    "src/components/governance/LockedFiles.jsx",
    "src/components/governance/INSTALL_POLICY.jsx",
    "src/components/governance/STARTER_KIT_VERSION.jsx",
    "src/components/governance/PhaseExecutionLog.jsx",
    "src/components/audits/AUDIT_INDEX.jsx",
    "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx",
  ],
  rules: [
    {
      file: "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
      promptInstruction:
        "Do not modify this file. Update only with explicit version bump and audit review.",
    },
    {
      file: "src/components/governance/LockedFiles.jsx",
      promptInstruction:
        "Do not modify this file. Do not weaken locked-file rules silently.",
    },
    {
      file: "src/components/governance/INSTALL_POLICY.jsx",
      promptInstruction:
        "Do not modify this file. Update only when install policy changes with explicit justification and audit review.",
    },
    {
      file: "src/components/governance/STARTER_KIT_VERSION.jsx",
      promptInstruction:
        "Do not modify this file. Update only with explicit version bump and audit review.",
    },
    {
      file: "src/components/governance/PhaseExecutionLog.jsx",
      promptInstruction:
        "Do not modify existing entries. Append-only. May appear in FILES YOU MAY CHANGE " +
        "only if the source plan's changeType is 'execution-log-entry' and approvedForThisPlan is true.",
    },
    {
      file: "src/components/audits/AUDIT_INDEX.jsx",
      promptInstruction:
        "Do not remove or alter existing audit records. Add entries only. May appear in FILES YOU MAY CHANGE " +
        "only if the source plan's changeType is 'audit-record-addition' and approvedForThisPlan is true.",
    },
    {
      file: "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx",
      promptInstruction:
        "Do not modify this file. Update only when audit protocol changes with explicit justification and audit review.",
    },
  ],
};

// ── Out-of-scope prompt requirements ──────────────────────────────────────────
// Items that must always be present in the OUT OF SCOPE section of any generated prompt.
// These mirror the outOfScopeRequirements from ApprovedChangePlanSpec and add
// prompt-generation–specific items.

export const outOfScopePromptRequirements = [
  {
    item: "Prompt generation runtime logic",
    mustBeDeclaredOutOfScope:
      "This spec defines the schema contract only. Any prompt generated under this spec must " +
      "explicitly exclude prompt generation runtime logic from its scope.",
  },
  {
    item: "Execution logic",
    mustBeDeclaredOutOfScope:
      "A prompt generated from this spec must not include execution logic and must explicitly " +
      "list 'Execution logic' in its OUT OF SCOPE section.",
  },
  {
    item: "PR creation",
    mustBeDeclaredOutOfScope:
      "PR creation is blocked. Any generated prompt must explicitly list 'PR creation' " +
      "in its OUT OF SCOPE section.",
  },
  {
    item: "Dispatch to any target",
    mustBeDeclaredOutOfScope:
      "Dispatch capability is blocked. Any generated prompt must explicitly list " +
      "'Dispatch to any target' in its OUT OF SCOPE section.",
  },
  {
    item: "Backend changes",
    mustBeDeclaredOutOfScope:
      "Backend changes are out of scope. Any generated prompt must explicitly list " +
      "'Backend changes' in its OUT OF SCOPE section.",
  },
  {
    item: "Multi-step execution",
    mustBeDeclaredOutOfScope:
      "singleStepOnly is required. Any generated prompt must explicitly list " +
      "'Multi-step execution' in its OUT OF SCOPE section.",
  },
  {
    item: "Approval state transitions",
    mustBeDeclaredOutOfScope:
      "Modifying approval states is blocked. Any generated prompt must explicitly list " +
      "'Approval state transitions' in its OUT OF SCOPE section.",
  },
];

// ── Deliverables format requirements ──────────────────────────────────────────
// Governs the format and required items for the DELIVERABLES REQUIRED section
// of every generated prompt.

export const deliverablesFormatRequirements = {
  policy:
    "Every generated prompt must include a DELIVERABLES REQUIRED section that lists exactly " +
    "what the implementer must produce and confirm. The section must be enumerated, not prose. " +
    "Each deliverable must be independently verifiable.",
  requiredDeliverables: [
    {
      deliverable: "A. Files read",
      description:
        "The implementer must list every file they read as part of the implementation, " +
        "confirming that they consulted the source plan and all governance artifacts referenced in this prompt.",
    },
    {
      deliverable: "B. Exact file created or modified",
      description:
        "The implementer must identify the exact file path created or changed, " +
        "confirming it is within the allowedFiles list from the source plan.",
    },
    {
      deliverable: "C. Exact exports added",
      description:
        "If the change creates or modifies a schema/governance artifact, the implementer must " +
        "list every named export added or changed, confirming no unplanned exports were introduced.",
    },
    {
      deliverable: "D. How this change fits the governance pipeline",
      description:
        "The implementer must describe how the change connects upstream (to its source plan) " +
        "and downstream (to any planned consuming components), confirming architectural position.",
    },
    {
      deliverable: "E. Confirmation that no runtime generation, dispatch, or execution logic was introduced",
      description:
        "The implementer must explicitly confirm that the delivered artifact contains no " +
        "runtime generation, dispatch, or execution logic, consistent with blockedPromptCapabilities.",
    },
    {
      deliverable: "F. Safe next step",
      description:
        "The implementer must identify the single next safe governance step after this change, " +
        "consistent with the consumingComponentsPlanned list and the one-safe-change-at-a-time principle.",
    },
  ],
};

// ── Consuming components planned ───────────────────────────────────────────────
// Future components that will consume this spec. Listed here to make downstream
// usage explicit without coupling to any implementation.

export const consumingComponentsPlanned = [
  {
    component: "src/components/governance/ApprovedChangePromptGenerator.jsx",
    phase: "gov-006 Phase 3",
    usage:
      "Will generate implementation prompts from approved change plans following the section " +
      "structure, ordering, and constraints defined in this spec. " +
      "Must read requiredPromptInputs, promptSections, sectionOrderingRules, " +
      "promptOutputConstraints, blockedPromptCapabilities, lockedFilePromptRules, " +
      "and deliverablesFormatRequirements from this spec. " +
      "Must not implement dispatch logic, execution logic, or PR creation logic. " +
      "Must not be created until this spec is verified in GitHub.",
    mustNotBeCreatedUntil:
      "This ApprovedChangePromptSpec artifact is verified in the GitHub repository.",
  },
  {
    component: "src/components/admin/PromptPreviewPanel.jsx",
    phase: "gov-006 Phase 4",
    usage:
      "Will render a human-visible preview of a generated prompt for review and acknowledgment " +
      "before any execution step may proceed. Must enforce all blockedPromptCapabilities at the " +
      "display layer. Must not be created until ApprovedChangePromptGenerator is verified.",
    mustNotBeCreatedUntil:
      "ApprovedChangePromptGenerator is created and verified in the GitHub repository.",
  },
];

// ApprovedChangePlanInstanceSpec — governance schema/data artifact
// gov-006 Phase 3 — created 2026-03-16
// Project: GovernanceHub (projectId: governancehub, projectSlug: governancehub)
//
// This file is a pure schema/data artifact.
// It defines the canonical working plan instance that moves through the governed
// execution pipeline.  It does NOT implement execution logic, dispatch authorization,
// PR creation, prompt generation, storage/runtime persistence, state mutation,
// or any runtime workflow.
//
// Conceptual position:
//   audit/orchestrator output
//     → approved plan (ApprovedChangePlanSpec)
//       → [ApprovedChangePlanInstanceSpec]  ← this file
//         → approved prompt (ApprovedChangePromptSpec)
//           → dispatch → execution → verification → execution log
//
// Separation of concerns:
//   ApprovedChangePlanSpec.jsx         — schema contract for an approved change plan
//   ApprovedChangePromptSpec.jsx       — schema contract for a prompt generated from a plan
//   ApprovedChangePlanInstanceSpec.jsx — canonical working plan instance contract (this file)
//   Future: dispatch components        — may only be built after this spec is verified
//   Future: execution components       — may only be built after dispatch is verified
//
// Key distinctions:
//   • An approved plan spec is NOT the same as a plan instance.
//   • A plan instance is NOT the same as a dispatch record.
//   • A plan instance is NOT the same as an execution record.
//   • One approved working plan instance corresponds to exactly one governed execution path.
//   • Plan instance identity fields are immutable once the instance is created.
//   • Downstream status fields (lifecycle, dispatch, execution, verification) may evolve,
//     but they must never repurpose identity fields.

// ── Spec metadata ──────────────────────────────────────────────────────────────

export const specMeta = {
  specId: "approved-change-plan-instance-spec",
  version: "1.0.0",
  governedBy: "gov-006",
  projectId: "governancehub",
  projectSlug: "governancehub",
  createdAt: "2026-03-16",
  description:
    "Defines the canonical working plan instance object that future runtime layers must " +
    "reference when moving from an approved change plan through prompt generation, dispatch, " +
    "execution, verification, and execution log entry. " +
    "This is the single source-of-truth object for plan identity across the full governed " +
    "execution pipeline. " +
    "An approved plan spec defines what a plan must look like. " +
    "This instance spec defines the working object that carries that plan's identity " +
    "and lifecycle linkage fields through each pipeline stage. " +
    "This spec does not implement storage, persistence, dispatch, execution, or PR creation.",
  status: "schema-only",
  dispatchable: false,
  autoExecutable: false,
  instanceManagementImplemented: false,
  note:
    "This spec does not authorize any execution or dispatch. Future runtime layers must " +
    "be built separately, must reference this spec, and must not be created until this spec " +
    "is verified in GitHub.",
};

// ── Required instance fields ───────────────────────────────────────────────────
// Every plan instance must carry all fields listed here.
// A plan instance missing any required field must be rejected before entering
// any dispatch or execution consideration.

export const requiredInstanceFields = [
  // Identity / core
  "planId",
  "sourceType",
  "sourceId",
  "repoFullName",
  "title",
  "goal",
  "changeType",
  // Scope / governance
  "allowedFiles",
  "outOfScope",
  "acceptanceCriteria",
  "approvalStatus",
  "singleStepOnly",
  "requiresPreviewBeforeExecution",
  "requiresPostMergeVerification",
  // Lifecycle
  "lifecycleStage",
  "dispatchStatus",
  "executionStatus",
  "verificationStatus",
  // Linkage
  "sourceAuditId",
  "promptId",
  "executionLogEntryId",
  "verificationTargetType",
  "verificationTargetValue",
  "verificationBranch",
];

// ── Instance field definitions ─────────────────────────────────────────────────
// Describes the purpose, type, and constraints of each required instance field.
// Identity fields are marked immutable — they must not be altered after instance creation.

export const instanceFieldDefinitions = [
  // ── Identity / core ─────────────────────────────────────────────────────────
  {
    field: "planId",
    type: "string",
    immutable: true,
    description:
      "Globally unique identifier for this plan instance. " +
      "All downstream layers (prompt, dispatch, execution, verification, execution log) " +
      "must reference this planId to maintain traceability across the pipeline.",
    constraints: [
      "Must be globally unique within the project.",
      "Must not be reused or recycled once assigned.",
      "Must be set at instance creation time and never changed.",
      "Must match the id field of the ApprovedChangePlan this instance was derived from.",
    ],
  },
  {
    field: "sourceType",
    type: "string",
    immutable: true,
    description:
      "Identifies the origin type of the change request that produced this plan instance " +
      "(e.g., 'audit', 'issue', 'governance-task').",
    constraints: [
      "Must correspond to one of the allowedChangeTypes[].sourceType values defined in " +
      "ApprovedChangePlanSpec.",
      "Must not be changed after instance creation.",
    ],
  },
  {
    field: "sourceId",
    type: "string",
    immutable: true,
    description:
      "Identifies the specific source document, audit entry, or issue that generated this plan instance.",
    constraints: [
      "Must reference a verifiable source that exists in the repository or issue tracker.",
      "Must not be changed after instance creation.",
    ],
  },
  {
    field: "repoFullName",
    type: "string",
    immutable: true,
    description:
      "The full GitHub repository name (e.g., 'Luckywolf82/governancehub'). " +
      "Repo context is required — plan instances without a repo binding are not valid.",
    constraints: [
      "Must match the format 'owner/repo'.",
      "Must be confirmed against a live repository identity before the plan may be approved.",
      "Must not be changed after instance creation.",
    ],
  },
  {
    field: "title",
    type: "string",
    immutable: true,
    description: "Human-readable title describing the intended change for this plan instance.",
    constraints: [
      "Must clearly reflect the scope of allowedFiles.",
      "Must not imply a broader scope than the plan permits.",
      "Must not be changed after instance creation.",
    ],
  },
  {
    field: "goal",
    type: "string",
    immutable: true,
    description:
      "Describes what the change is intended to achieve. " +
      "Must be scoped to a single, safe, incremental step.",
    constraints: [
      "Must be specific enough to evaluate against acceptanceCriteria.",
      "Must not imply multiple structural changes.",
      "Must not be changed after instance creation.",
    ],
  },
  {
    field: "changeType",
    type: "string",
    immutable: true,
    description: "The category of change this plan instance represents.",
    constraints: [
      "Must match the changeType of the ApprovedChangePlan this instance was derived from.",
      "Must not be changed after instance creation.",
    ],
  },
  // ── Scope / governance ──────────────────────────────────────────────────────
  {
    field: "allowedFiles",
    type: "string[]",
    immutable: true,
    description:
      "Exhaustive list of repository file paths that this plan instance permits to be changed. " +
      "No file outside this list may be modified under this plan instance.",
    constraints: [
      "Must be a non-empty array.",
      "Must match the allowedFiles from the source ApprovedChangePlan exactly.",
      "Must not be modified after instance creation.",
    ],
  },
  {
    field: "outOfScope",
    type: "string[]",
    immutable: true,
    description:
      "Explicit list of actions, files, or capabilities intentionally excluded from this " +
      "plan instance. Out-of-scope must be declared — silence does not imply permission.",
    constraints: [
      "Must be a non-empty array.",
      "Must include all items from the source plan's outOfScope list.",
      "Must not be modified after instance creation.",
    ],
  },
  {
    field: "acceptanceCriteria",
    type: "string[]",
    immutable: true,
    description:
      "Conditions that must all be true for this plan instance to be considered " +
      "successfully executed.",
    constraints: [
      "Must be a non-empty array.",
      "Each criterion must be independently verifiable.",
      "Must not include criteria that require actions outside allowedFiles.",
      "Must not be modified after instance creation.",
    ],
  },
  {
    field: "approvalStatus",
    type: "string",
    immutable: true,
    description:
      "The approval state of the source plan at the time this instance was created. " +
      "Must be 'approved'. An instance may only be created from an approved plan.",
    constraints: [
      "Must be 'approved' at instance creation time.",
      "This field records the approval state at instance creation — it is not a mutable " +
      "lifecycle field. See lifecycleStage for runtime state.",
    ],
  },
  {
    field: "singleStepOnly",
    type: "boolean",
    immutable: true,
    description:
      "Confirms that this plan instance covers exactly one safe, incremental change step.",
    constraints: [
      "Must be true. A plan instance with singleStepOnly === false must be rejected.",
      "Must not be changed after instance creation.",
    ],
  },
  {
    field: "requiresPreviewBeforeExecution",
    type: "boolean",
    immutable: true,
    description:
      "Confirms that a human preview step is required before any execution may proceed " +
      "for this plan instance.",
    constraints: [
      "Must be true. A plan instance with requiresPreviewBeforeExecution === false must be rejected.",
      "Must not be changed after instance creation.",
    ],
  },
  {
    field: "requiresPostMergeVerification",
    type: "boolean",
    immutable: true,
    description:
      "Confirms that a post-merge verification step is required after execution for this " +
      "plan instance.",
    constraints: [
      "Must be true. A plan instance with requiresPostMergeVerification === false must be rejected.",
      "Must not be changed after instance creation.",
    ],
  },
  // ── Lifecycle ────────────────────────────────────────────────────────────────
  {
    field: "lifecycleStage",
    type: "string",
    immutable: false,
    description:
      "The current stage of this plan instance in the governed execution pipeline. " +
      "Must be one of the values in lifecycleStageVocabulary.",
    constraints: [
      "Must be initialized to 'created' at instance creation.",
      "Must only advance through the transitions defined in lifecycleStageVocabulary.",
      "Must not skip stages.",
    ],
  },
  {
    field: "dispatchStatus",
    type: "string",
    immutable: false,
    description:
      "The current dispatch status for this plan instance. " +
      "Must be one of the values in dispatchStatusVocabulary.",
    constraints: [
      "Must be initialized to 'not-dispatched' at instance creation.",
      "Must only be updated by a verified dispatch component that references this spec.",
      "Must not be set to 'dispatched' without a corresponding promptId being set.",
    ],
  },
  {
    field: "executionStatus",
    type: "string",
    immutable: false,
    description:
      "The current execution status for this plan instance. " +
      "Must be one of the values in executionStatusVocabulary.",
    constraints: [
      "Must be initialized to 'not-started' at instance creation.",
      "Must only be updated by a verified execution component that references this spec.",
      "Must not be set to any terminal state without a corresponding executionLogEntryId being set.",
    ],
  },
  {
    field: "verificationStatus",
    type: "string",
    immutable: false,
    description:
      "The current post-execution verification status for this plan instance. " +
      "Must be one of the values in verificationStatusVocabulary.",
    constraints: [
      "Must be initialized to 'not-started' at instance creation.",
      "Must only be updated by a verified verification component that references this spec.",
      "Must not be set to any terminal state without verificationTargetValue being present.",
    ],
  },
  // ── Linkage ──────────────────────────────────────────────────────────────────
  {
    field: "sourceAuditId",
    type: "string | null",
    immutable: true,
    description:
      "The id of the audit entry or orchestrator output that originated this plan instance. " +
      "Null if the plan instance was not derived from a tracked audit entry.",
    constraints: [
      "Must be set at instance creation time if a source audit entry exists.",
      "Must not be changed after instance creation.",
    ],
  },
  {
    field: "promptId",
    type: "string | null",
    immutable: false,
    description:
      "The id of the ApprovedChangePrompt that was generated from this plan instance. " +
      "Null until a prompt has been generated and linked.",
    constraints: [
      "Must be null at instance creation.",
      "May only be set by a verified prompt generator that references this spec.",
      "Must not be set without a corresponding dispatchStatus update.",
    ],
  },
  {
    field: "executionLogEntryId",
    type: "string | null",
    immutable: false,
    description:
      "The id of the PhaseExecutionLog entry that records the execution of this plan instance. " +
      "Null until an execution log entry has been created and linked.",
    constraints: [
      "Must be null at instance creation.",
      "May only be set by a verified execution component that references this spec.",
      "Must reference a real entry in PhaseExecutionLog.",
    ],
  },
  {
    field: "verificationTargetType",
    type: "string",
    immutable: true,
    description:
      "Describes the type of verification target for post-execution verification " +
      "(e.g., 'branch', 'commit', 'pr').",
    constraints: [
      "Must be one of the values defined in requiredVerificationLinkageFields.",
      "Must match the verificationTargetType from the source ApprovedChangePlan.",
      "Must not be changed after instance creation.",
    ],
  },
  {
    field: "verificationTargetValue",
    type: "string | null",
    immutable: false,
    description:
      "The concrete identifier of the verification target (e.g., branch name, commit SHA, PR number). " +
      "Null until the execution step produces a concrete target.",
    constraints: [
      "Must be null at instance creation.",
      "May only be set by a verified execution component that references this spec.",
      "Must be set before verificationStatus may advance to any non-'not-started' state.",
    ],
  },
  {
    field: "verificationBranch",
    type: "string",
    immutable: true,
    description:
      "The specific Git branch against which post-execution verification must be performed.",
    constraints: [
      "Must be a valid Git branch name.",
      "Must match the verificationBranch from the source ApprovedChangePlan.",
      "Must be set at instance creation — not deferred to execution.",
      "Must not be changed after instance creation.",
    ],
  },
];

// ── Lifecycle stage vocabulary ─────────────────────────────────────────────────
// Defines the complete set of valid lifecycle stages for a plan instance.
// A plan instance must always be in exactly one of these stages.

export const lifecycleStageVocabulary = [
  {
    stage: "created",
    description:
      "The plan instance has been created from an approved change plan. " +
      "No prompt has been generated. No dispatch has occurred. No execution has started.",
    allowedNextStages: ["prompt-generated", "abandoned"],
  },
  {
    stage: "prompt-generated",
    description:
      "An ApprovedChangePrompt has been generated from this plan instance and is linked via promptId. " +
      "Dispatch has not yet occurred.",
    allowedNextStages: ["dispatched", "abandoned"],
  },
  {
    stage: "dispatched",
    description:
      "The plan instance has been dispatched to a governed execution target. " +
      "Execution has not yet started.",
    allowedNextStages: ["execution-in-progress", "abandoned"],
  },
  {
    stage: "execution-in-progress",
    description:
      "Execution of the plan instance is actively in progress under human-in-the-loop governance.",
    allowedNextStages: ["execution-complete", "execution-failed", "abandoned"],
  },
  {
    stage: "execution-complete",
    description:
      "Execution has completed. An execution log entry is linked via executionLogEntryId. " +
      "Post-merge verification has not yet started.",
    allowedNextStages: ["verification-in-progress", "abandoned"],
  },
  {
    stage: "execution-failed",
    description:
      "Execution did not complete successfully. The plan instance must not advance to " +
      "verification. A new plan instance revision may be required.",
    allowedNextStages: ["abandoned"],
  },
  {
    stage: "verification-in-progress",
    description:
      "Post-merge verification is actively in progress. " +
      "verificationTargetValue and verificationBranch are set.",
    allowedNextStages: ["verification-passed", "verification-failed"],
  },
  {
    stage: "verification-passed",
    description:
      "Post-merge verification has passed. The plan instance has completed the full " +
      "governed execution pipeline successfully.",
    allowedNextStages: [],
  },
  {
    stage: "verification-failed",
    description:
      "Post-merge verification did not pass. The plan instance is terminal. " +
      "A new plan instance revision may be required.",
    allowedNextStages: [],
  },
  {
    stage: "abandoned",
    description:
      "The plan instance was abandoned before completing the pipeline. " +
      "It must not be restarted. A new plan instance must be created if work is to continue.",
    allowedNextStages: [],
  },
];

// ── Dispatch status vocabulary ─────────────────────────────────────────────────
// Defines the controlled vocabulary for the dispatchStatus field.

export const dispatchStatusVocabulary = [
  {
    status: "not-dispatched",
    description: "No dispatch has been attempted for this plan instance.",
    initialValue: true,
  },
  {
    status: "dispatch-pending",
    description: "A dispatch has been initiated but not yet confirmed.",
    initialValue: false,
  },
  {
    status: "dispatched",
    description:
      "The plan instance has been successfully dispatched. " +
      "promptId must be set and must reference a valid ApprovedChangePrompt.",
    initialValue: false,
  },
  {
    status: "dispatch-failed",
    description:
      "Dispatch was attempted but failed. The plan instance must not proceed to execution.",
    initialValue: false,
  },
];

// ── Execution status vocabulary ────────────────────────────────────────────────
// Defines the controlled vocabulary for the executionStatus field.

export const executionStatusVocabulary = [
  {
    status: "not-started",
    description: "No execution has been attempted for this plan instance.",
    initialValue: true,
  },
  {
    status: "in-progress",
    description:
      "Execution is actively in progress under human-in-the-loop governance.",
    initialValue: false,
  },
  {
    status: "complete",
    description:
      "Execution has completed successfully. " +
      "executionLogEntryId must be set and must reference a real PhaseExecutionLog entry.",
    initialValue: false,
  },
  {
    status: "failed",
    description:
      "Execution did not complete successfully. " +
      "The plan instance must not proceed to verification.",
    initialValue: false,
  },
  {
    status: "abandoned",
    description:
      "Execution was abandoned. " +
      "The plan instance is terminal. A new plan instance must be created if work is to continue.",
    initialValue: false,
  },
];

// ── Verification status vocabulary ────────────────────────────────────────────
// Defines the controlled vocabulary for the verificationStatus field.

export const verificationStatusVocabulary = [
  {
    status: "not-started",
    description: "Post-merge verification has not yet been initiated.",
    initialValue: true,
  },
  {
    status: "in-progress",
    description:
      "Post-merge verification is actively in progress. " +
      "verificationTargetValue must be set.",
    initialValue: false,
  },
  {
    status: "passed",
    description:
      "Post-merge verification has passed. The plan instance has completed the " +
      "full governed execution pipeline successfully.",
    initialValue: false,
  },
  {
    status: "failed",
    description:
      "Post-merge verification did not pass. The plan instance is terminal.",
    initialValue: false,
  },
];

// ── Required source linkage fields ────────────────────────────────────────────
// Defines the minimum linkage that connects a plan instance back to its
// originating source (audit, issue, or governance task).

export const requiredSourceLinkageFields = [
  {
    field: "planId",
    purpose:
      "Provides the immutable identity that links the plan instance to its " +
      "source ApprovedChangePlan. Must be present in every downstream reference.",
  },
  {
    field: "sourceType",
    purpose:
      "Identifies whether the plan instance originated from an audit, issue, or " +
      "governance task. Required for audit traceability.",
  },
  {
    field: "sourceId",
    purpose:
      "Provides the specific identifier of the originating source document or entry. " +
      "Must reference a verifiable artifact.",
  },
  {
    field: "sourceAuditId",
    purpose:
      "Provides the audit entry identifier when the plan instance was produced from an " +
      "audit. Null when sourceType is not 'audit'.",
  },
  {
    field: "repoFullName",
    purpose:
      "Binds the plan instance to its specific repository. " +
      "Required at source linkage level to prevent cross-repo ambiguity.",
  },
];

// ── Required prompt linkage fields ────────────────────────────────────────────
// Defines the minimum fields required to link a plan instance to an
// ApprovedChangePrompt derived from it.

export const requiredPromptLinkageFields = [
  {
    field: "planId",
    purpose:
      "The plan instance planId must appear in the generated prompt for audit traceability. " +
      "A prompt without a planId reference must be rejected.",
  },
  {
    field: "promptId",
    purpose:
      "Set on the plan instance when a prompt has been generated and linked. " +
      "Must reference a valid ApprovedChangePrompt. Null until prompt generation occurs.",
  },
  {
    field: "dispatchStatus",
    purpose:
      "Must be updated from 'not-dispatched' when a prompt is generated and dispatched. " +
      "Prompt linkage is incomplete without a corresponding dispatchStatus update.",
  },
  {
    field: "repoFullName",
    purpose:
      "Must be preserved exactly in the generated prompt's REPOSITORY section. " +
      "Prompt linkage verification must confirm repoFullName match.",
  },
  {
    field: "allowedFiles",
    purpose:
      "Must be preserved exactly in the generated prompt's FILES YOU MAY CHANGE section. " +
      "Prompt linkage verification must confirm allowedFiles match.",
  },
];

// ── Required execution linkage fields ─────────────────────────────────────────
// Defines the minimum fields required to link a plan instance to its
// execution record in PhaseExecutionLog.

export const requiredExecutionLinkageFields = [
  {
    field: "planId",
    purpose:
      "Must appear in the PhaseExecutionLog entry to link the execution record back to " +
      "the plan instance. Execution records without a planId reference are ungoverned.",
  },
  {
    field: "executionLogEntryId",
    purpose:
      "Set on the plan instance when an execution log entry has been created and linked. " +
      "Must reference a real entry in PhaseExecutionLog. Null until execution is recorded.",
  },
  {
    field: "executionStatus",
    purpose:
      "Must reflect the terminal execution state when executionLogEntryId is set. " +
      "'complete' requires executionLogEntryId to be non-null.",
  },
  {
    field: "repoFullName",
    purpose:
      "Must appear in the PhaseExecutionLog entry to confirm repository identity at " +
      "execution time.",
  },
  {
    field: "allowedFiles",
    purpose:
      "Must be recorded in the PhaseExecutionLog entry to confirm that execution was " +
      "scoped to the governed file set.",
  },
  {
    field: "changeType",
    purpose:
      "Must appear in the PhaseExecutionLog entry to classify the type of change that " +
      "was executed.",
  },
];

// ── Required verification linkage fields ──────────────────────────────────────
// Defines the minimum fields required to link a plan instance to its
// post-execution verification record.

export const requiredVerificationLinkageFields = [
  {
    field: "planId",
    purpose:
      "Must appear in the verification record to link verification back to the plan instance. " +
      "Verification records without a planId reference are ungoverned.",
  },
  {
    field: "verificationTargetType",
    purpose:
      "Classifies the type of verification target. Must be one of: 'branch', 'commit', 'pr'.",
    allowedValues: ["branch", "commit", "pr"],
  },
  {
    field: "verificationTargetValue",
    purpose:
      "The concrete identifier of the verification target (branch name, commit SHA, or PR number). " +
      "Must be non-null before verification may be initiated.",
  },
  {
    field: "verificationBranch",
    purpose:
      "The Git branch against which verification must be performed. " +
      "Must be set at instance creation — not deferred to verification.",
  },
  {
    field: "verificationStatus",
    purpose:
      "Must reflect the terminal verification state when verification is complete. " +
      "'passed' and 'failed' are terminal states.",
  },
];

// ── Repo binding requirements ──────────────────────────────────────────────────
// Defines the rules that govern how a plan instance is bound to a specific repository.

export const repoBindingRequirements = [
  {
    requirement: "repoFullName must be present and non-empty",
    description:
      "Every plan instance must carry an explicit repoFullName value. " +
      "A plan instance without a repo binding is not valid and must be rejected at creation.",
  },
  {
    requirement: "repoFullName format must be 'owner/repo'",
    description:
      "The repoFullName field must match the GitHub format 'owner/repo' exactly. " +
      "Partial names, display names, or non-canonical formats are not valid.",
  },
  {
    requirement: "repoFullName must be immutable",
    description:
      "Once a plan instance is created, its repoFullName must not be changed. " +
      "A plan instance cannot be reassigned to a different repository. " +
      "If the repository changes, a new plan instance must be created.",
  },
  {
    requirement: "repoFullName must propagate to all downstream linkage",
    description:
      "Every downstream record (prompt, execution log entry, verification record) must " +
      "carry the same repoFullName as the plan instance. " +
      "Cross-repo linkage is not permitted.",
  },
];

// ── Immutable identity rules ───────────────────────────────────────────────────
// Defines the rules that govern the immutability of plan instance identity fields.
// These rules must be enforced by any future runtime layer that manages plan instances.

export const immutableIdentityRules = [
  {
    rule: "planId must never be altered after instance creation",
    appliesTo: ["planId"],
    reason:
      "planId is the primary key that all downstream layers use to reference this plan instance. " +
      "Altering planId after creation would break traceability across prompt, dispatch, execution, " +
      "verification, and execution log linkage.",
    enforcedBy: "Future plan instance management runtime (not yet created).",
  },
  {
    rule: "Source linkage fields must never be altered after instance creation",
    appliesTo: ["sourceType", "sourceId", "sourceAuditId"],
    reason:
      "Source linkage fields establish the provenance of the plan instance. " +
      "Altering them after creation would break the audit trail back to the originating " +
      "audit entry or governance task.",
    enforcedBy: "Future plan instance management runtime (not yet created).",
  },
  {
    rule: "Repo binding must never be altered after instance creation",
    appliesTo: ["repoFullName"],
    reason:
      "repoFullName binds the plan instance to its repository. " +
      "Altering it after creation would misroute all downstream execution and verification " +
      "to the wrong repository.",
    enforcedBy: "Future plan instance management runtime (not yet created).",
  },
  {
    rule: "Governance scope fields must never be altered after instance creation",
    appliesTo: [
      "title",
      "goal",
      "changeType",
      "allowedFiles",
      "outOfScope",
      "acceptanceCriteria",
      "approvalStatus",
      "singleStepOnly",
      "requiresPreviewBeforeExecution",
      "requiresPostMergeVerification",
    ],
    reason:
      "Governance scope fields define the approved boundaries for this plan instance. " +
      "Altering them after creation would retroactively change the scope of an approved plan, " +
      "undermining the governance approval that authorized the instance.",
    enforcedBy: "Future plan instance management runtime (not yet created).",
  },
  {
    rule: "Verification binding fields must never be altered after instance creation",
    appliesTo: ["verificationTargetType", "verificationBranch"],
    reason:
      "Verification binding fields establish where post-execution verification must occur. " +
      "Altering them after creation could cause verification to be performed against the wrong " +
      "branch or target type.",
    enforcedBy: "Future plan instance management runtime (not yet created).",
  },
  {
    rule: "Only lifecycle/status/linkage fields may be updated after instance creation",
    appliesTo: [
      "lifecycleStage",
      "dispatchStatus",
      "executionStatus",
      "verificationStatus",
      "promptId",
      "executionLogEntryId",
      "verificationTargetValue",
    ],
    reason:
      "These fields record the evolving state of the plan instance as it moves through " +
      "the governed execution pipeline. They are the only mutable fields. All other fields " +
      "are immutable and must never be altered after instance creation.",
    enforcedBy: "Future plan instance management runtime (not yet created).",
  },
];

// ── Blocked interpretations ────────────────────────────────────────────────────
// Explicit statements of what this spec must never be interpreted as authorizing.

export const blockedInterpretations = [
  {
    interpretation: "plan instance === plan spec",
    blocked: true,
    reason:
      "ApprovedChangePlanSpec defines the schema contract for what an approved plan must look like. " +
      "A plan instance is the canonical working object that carries a specific plan's identity and " +
      "lifecycle fields through the execution pipeline. They are not the same artifact.",
  },
  {
    interpretation: "plan instance === dispatch record",
    blocked: true,
    reason:
      "A plan instance is not a dispatch record. Dispatch is a downstream stage of the plan instance " +
      "lifecycle. The plan instance carries a dispatchStatus field and a promptId linkage field, " +
      "but it is not the dispatch record itself.",
  },
  {
    interpretation: "plan instance === execution record",
    blocked: true,
    reason:
      "A plan instance is not an execution record. Execution is a downstream stage of the plan instance " +
      "lifecycle. The plan instance carries an executionStatus field and an executionLogEntryId linkage " +
      "field, but it is not the PhaseExecutionLog entry itself.",
  },
  {
    interpretation: "instance creation === dispatch authorized",
    blocked: true,
    reason:
      "Creating a plan instance from an approved plan does not authorize dispatch. " +
      "Dispatch requires a verified dispatch component that references this spec. " +
      "No dispatch component exists yet.",
  },
  {
    interpretation: "instance creation === execution authorized",
    blocked: true,
    reason:
      "Creating a plan instance from an approved plan does not authorize execution. " +
      "Execution requires a verified execution component that references this spec. " +
      "No execution component exists yet.",
  },
  {
    interpretation: "approved plan instance === auto-executable",
    blocked: true,
    reason:
      "An approved plan instance is NOT auto-executable. " +
      "requiresPreviewBeforeExecution must be true for every valid plan instance. " +
      "Human review and acknowledgment are required before execution may proceed.",
  },
  {
    interpretation: "spec existence === plan instance persistence available",
    blocked: true,
    reason:
      "This spec defines the contract for future canonical plan instances. " +
      "It does not implement storage, persistence, or runtime instance management. " +
      "No plan instance persistence layer exists yet.",
  },
  {
    interpretation: "one plan instance === multiple execution paths",
    blocked: true,
    reason:
      "One approved working plan instance corresponds to exactly one governed execution path. " +
      "A plan instance must not be forked, cloned for parallel execution, or reused for a " +
      "different execution attempt. A new plan instance must be created for each distinct " +
      "execution attempt.",
  },
];

// ── Consuming components planned ───────────────────────────────────────────────
// Future components that will consume this spec. Listed here to make downstream
// usage explicit without coupling to any implementation.

export const consumingComponentsPlanned = [
  {
    component: "src/components/governance/ChangePlanInstanceRegistry.jsx",
    phase: "gov-006 Phase 4",
    usage:
      "Will provide the canonical registry of plan instances. " +
      "Must reference requiredInstanceFields, instanceFieldDefinitions, immutableIdentityRules, " +
      "lifecycleStageVocabulary, dispatchStatusVocabulary, executionStatusVocabulary, and " +
      "verificationStatusVocabulary from this spec. " +
      "Must not implement dispatch, execution, PR creation, or backend storage logic. " +
      "Must not be created until this spec is verified in GitHub.",
    mustNotBeCreatedUntil:
      "This ApprovedChangePlanInstanceSpec artifact is verified in the GitHub repository.",
  },
  {
    component: "src/components/admin/ChangePlanInstancePanel.jsx",
    phase: "gov-006 Phase 5",
    usage:
      "Will render a read-only view of a plan instance's current lifecycle state and linkage " +
      "for human review. Must enforce all blockedInterpretations at the display layer. " +
      "Must not implement dispatch, execution, or mutation logic. " +
      "Must not be created until ChangePlanInstanceRegistry is verified.",
    mustNotBeCreatedUntil:
      "ChangePlanInstanceRegistry is created and verified in the GitHub repository.",
  },
  {
    component: "Future: dispatch authorization component",
    phase: "gov-006 Phase 6 or later",
    usage:
      "Will authorize and record dispatch for a plan instance. " +
      "Must reference requiredPromptLinkageFields, dispatchStatusVocabulary, and " +
      "immutableIdentityRules from this spec. " +
      "Must not be created until ChangePlanInstancePanel is verified.",
    mustNotBeCreatedUntil:
      "ChangePlanInstancePanel is created and verified in the GitHub repository.",
  },
  {
    component: "Future: execution worker component",
    phase: "gov-006 Phase 7 or later",
    usage:
      "Will execute changes under a governed plan instance. " +
      "Must reference requiredExecutionLinkageFields, executionStatusVocabulary, and " +
      "immutableIdentityRules from this spec. " +
      "Must not be created until the dispatch authorization component is verified.",
    mustNotBeCreatedUntil:
      "The dispatch authorization component is created and verified in the GitHub repository.",
  },
  {
    component: "Future: verification component",
    phase: "gov-006 Phase 8 or later",
    usage:
      "Will perform and record post-merge verification for a plan instance. " +
      "Must reference requiredVerificationLinkageFields, verificationStatusVocabulary, and " +
      "immutableIdentityRules from this spec. " +
      "Must not be created until the execution worker component is verified.",
    mustNotBeCreatedUntil:
      "The execution worker component is created and verified in the GitHub repository.",
  },
];

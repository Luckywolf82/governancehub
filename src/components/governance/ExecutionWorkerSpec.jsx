// ExecutionWorkerSpec — governance schema/data artifact
// gov-006 Phase 8 — created 2026-03-16
// Project: GovernanceHub (projectId: governancehub, projectSlug: governancehub)
//
// This file is a pure schema/data artifact.
// It defines the contract that a future ExecutionWorker must obey.
// It does NOT implement execution logic, dispatch logic, PR creation, worker invocation,
// backend calls, state mutation, prompt generation, repository writes, or any runtime workflow.
//
// Conceptual position:
//   approved plan spec (ApprovedChangePlanSpec)
//     → plan instance contract (ApprovedChangePlanInstanceSpec)
//       → canonical registry (ChangePlanInstanceRegistry)
//         → dispatch authorization (DispatchAuthorizationSpec)
//           → dispatch review (DispatchReviewPanel)
//             → prompt preview (PromptPreviewPanel)
//               → [ExecutionWorkerSpec]  ← this file
//                 → ExecutionWorker (not yet created)
//                   → Verification → ExecutionLog
//
// Separation of concerns:
//   ApprovedChangePlanSpec.jsx          — schema contract for what an approved plan must look like
//   ApprovedChangePromptSpec.jsx        — schema contract for a prompt generated from a plan
//   ApprovedChangePlanInstanceSpec.jsx  — canonical working plan instance contract
//   ChangePlanInstanceRegistry.jsx      — canonical registry of plan instances
//   DispatchAuthorizationSpec.jsx       — dispatch authorization rules
//   DispatchReviewPanel.jsx             — read-only dispatch authorization review surface
//   PromptPreviewPanel.jsx              — read-only registry-only prompt preview surface
//   ExecutionWorkerSpec.jsx             — execution worker contract (this file)
//   Future: ExecutionWorker             — may only be built after this spec is verified
//
// Identity model notes:
//   Current lookup uses planId as the canonical identity key.
//   Future model may introduce instanceId or a composite key (planId + repoFullName)
//   to support multiple instances of the same plan against different repositories.
//   This spec does not refactor that model — it records the current assumption and
//   flags future extensibility explicitly.
//
// Reference integrity notes (dc-001 and dc-005 from DispatchAuthorizationSpec):
//   dc-001: planId presence means a plan identity reference is recorded.
//           It does NOT mean the source artifact has been independently verified.
//   dc-005: promptId presence means a prompt reference is recorded.
//           It does NOT mean the prompt artifact has been independently loaded or verified.
//   The execution layer must rely on governed state (registry + dispatch authorization),
//   not on UI-layer wording, when determining whether references are sufficient.

// ── Spec metadata ──────────────────────────────────────────────────────────────

export const specMeta = {
  specId: "execution-worker-spec",
  version: "1.0.0",
  governedBy: "gov-006",
  phase: "Phase 8",
  projectId: "governancehub",
  projectSlug: "governancehub",
  createdAt: "2026-03-16",
  description:
    "Defines the contract that a future ExecutionWorker must obey. " +
    "This spec sits between the dispatch authorization layer and any future execution worker. " +
    "It clarifies what upstream governance artifacts the worker depends on, what preconditions " +
    "must be true before execution is allowed, what inputs the worker may consume, what actions " +
    "are allowed and prohibited in the execution phase, what outputs the worker must produce for " +
    "later verification, what failure modes the worker must surface, and what governance boundaries " +
    "the worker must never bypass. " +
    "This spec does not execute anything. It only formalizes the contract.",
  status: "schema-only",
  dispatchable: false,
  autoExecutable: false,
  executionImplemented: false,
  workerRuntimeImplemented: false,
  note:
    "This spec does not implement execution. A future ExecutionWorker component must be " +
    "built separately, must reference this spec and DispatchAuthorizationSpec, and must not " +
    "be created until this spec is verified in GitHub.",
};

// ── Execution worker inputs ────────────────────────────────────────────────────
// Defines the exact upstream governance artifacts that a future ExecutionWorker
// must read from. The worker must not read from sources outside this list without
// first updating this spec.

export const executionWorkerInputs = [
  {
    artifact: "src/components/governance/ChangePlanInstanceRegistry.jsx",
    exports: [
      "registryMeta",
      "registryIdentityRules",
      "registryEntryRequirements",
      "registryStatusRules",
      "registryLinkageRequirements",
      "registryReadModelRules",
      "blockedRegistryCapabilities",
      "CHANGE_PLAN_INSTANCE_REGISTRY",
    ],
    readPurpose:
      "Provides the canonical registry of plan instances. " +
      "The future worker must look up the target plan instance by planId from " +
      "CHANGE_PLAN_INSTANCE_REGISTRY.entries before any execution is attempted. " +
      "The worker must not execute any instance that is not found in this registry. " +
      "The worker must not mutate the registry.",
    writePermitted: false,
    identityNote:
      "Current lookup uses planId as the canonical key. " +
      "A future model may introduce instanceId or a composite (planId + repoFullName) key. " +
      "The worker must not assume a different identity model without a verified spec update.",
  },
  {
    artifact: "src/components/governance/DispatchAuthorizationSpec.jsx",
    exports: [
      "specMeta",
      "requiredDispatchConditions",
      "dispatchStatusVocabulary",
      "dispatchDecisionRules",
      "registryLookupRules",
      "blockedDispatchCapabilities",
      "blockedInterpretations",
    ],
    readPurpose:
      "Provides the dispatch authorization contract that must have been satisfied before " +
      "the execution worker may proceed. " +
      "The future worker must confirm that all requiredDispatchConditions were satisfied and " +
      "that a dispatch authorization decision of 'authorized' was recorded for the plan instance. " +
      "The worker must not execute any instance that lacks a confirmed authorized dispatch decision.",
    writePermitted: false,
  },
  {
    artifact: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    exports: [
      "requiredInstanceFields",
      "instanceFieldDefinitions",
      "lifecycleStageVocabulary",
      "dispatchStatusVocabulary",
      "planApprovalStatusVocabulary",
      "repoBindingRequirements",
      "immutableIdentityRules",
      "requiredPromptLinkageFields",
    ],
    readPurpose:
      "Provides the canonical plan instance schema, lifecycle vocabulary, status vocabularies, " +
      "and immutability rules. " +
      "The future worker must validate the target plan instance against these definitions before " +
      "execution is attempted. It must not alter any immutable identity field.",
    writePermitted: false,
  },
  {
    artifact: "src/components/governance/ApprovedChangePlanSpec.jsx",
    exports: [
      "specMeta",
      "requiredPlanFields",
      "planFieldDefinitions",
    ],
    readPurpose:
      "Provides the canonical approved change plan schema. " +
      "The future worker must confirm that the plan instance's source plan satisfies the " +
      "approved change plan contract, including all requiredPlanFields. " +
      "allowedFiles and outOfScope from the plan constrain what the worker may touch.",
    writePermitted: false,
  },
  {
    artifact: "src/components/governance/ApprovedChangePromptSpec.jsx",
    exports: [
      "specMeta",
      "requiredPromptInputs",
    ],
    readPurpose:
      "Provides the canonical approved prompt schema. " +
      "The future worker must require a valid promptId linked to the plan instance before " +
      "execution is attempted. " +
      "The prompt's goal, allowedFiles, outOfScope, and repoFullName must match the plan " +
      "instance exactly. " +
      "Reference integrity note: promptId presence records a reference — it does not confirm " +
      "independent artifact verification. The worker must rely on governed state.",
    writePermitted: false,
  },
];

// ── Execution worker preconditions ─────────────────────────────────────────────
// Governance-facing conditions that must all be true before a future ExecutionWorker
// may begin execution. All preconditions must pass. Partial satisfaction is not permitted.
// These are contract rules — not runtime implementation code.

export const executionWorkerPreconditions = [
  {
    preconditionId: "ep-001",
    label: "Plan instance found in registry",
    description:
      "The target plan instance must be found in CHANGE_PLAN_INSTANCE_REGISTRY by planId. " +
      "A plan instance that cannot be located by planId in the canonical registry must not be executed.",
    verifiedBy:
      "Future worker shall look up the planId in CHANGE_PLAN_INSTANCE_REGISTRY.entries. " +
      "If no matching entry is returned, execution must be refused.",
    failureAction: "Refuse execution. Surface failure mode 'ef-registry-not-found'. Log explicitly.",
    referencedSpec: "src/components/governance/ChangePlanInstanceRegistry.jsx",
    referencedExport: "CHANGE_PLAN_INSTANCE_REGISTRY",
  },
  {
    preconditionId: "ep-002",
    label: "Dispatch authorization confirmed as 'authorized'",
    description:
      "A dispatch authorization decision of 'authorized' must have been recorded for the " +
      "plan instance via a verified dispatch authorization runtime component. " +
      "The future worker must not execute any instance whose dispatch authorization has not " +
      "been evaluated or that carries a held dispatch status.",
    verifiedBy:
      "Future worker shall confirm that the plan instance's dispatch decision record carries " +
      "status 'authorized' as defined in DispatchAuthorizationSpec.dispatchStatusVocabulary. " +
      "Any other status must result in execution refusal.",
    failureAction: "Refuse execution. Surface failure mode 'ef-authorization-not-confirmed'. Log explicitly.",
    referencedSpec: "src/components/governance/DispatchAuthorizationSpec.jsx",
    referencedExport: "dispatchStatusVocabulary",
  },
  {
    preconditionId: "ep-003",
    label: "All required dispatch conditions were satisfied",
    description:
      "All requiredDispatchConditions defined in DispatchAuthorizationSpec must have been " +
      "satisfied for the plan instance before execution proceeds. " +
      "The execution worker is downstream of governance approval and must not re-authorize " +
      "or waive conditions that were not met at the dispatch stage.",
    verifiedBy:
      "Future worker shall read the dispatch decision record and confirm that all conditions " +
      "in requiredDispatchConditions passed. Any unresolved or failed condition blocks execution.",
    failureAction: "Refuse execution. Surface failure mode 'ef-dispatch-conditions-unmet'. Log explicitly.",
    referencedSpec: "src/components/governance/DispatchAuthorizationSpec.jsx",
    referencedExport: "requiredDispatchConditions",
  },
  {
    preconditionId: "ep-004",
    label: "Plan instance approvalStatus is 'approved'",
    description:
      "The plan instance's approvalStatus field must be 'approved'. " +
      "Any other value must prevent execution.",
    verifiedBy:
      "Future worker shall read approvalStatus from the registry entry and confirm the value is 'approved'.",
    failureAction: "Refuse execution. Surface failure mode 'ef-approval-status-invalid'. Log explicitly.",
    referencedSpec: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    referencedExport: "planApprovalStatusVocabulary",
  },
  {
    preconditionId: "ep-005",
    label: "Plan instance lifecycleStage is 'dispatched'",
    description:
      "The plan instance's lifecycleStage must be 'dispatched' when the execution worker " +
      "picks up the work. A plan instance in any other lifecycleStage must not be executed. " +
      "The transition to 'dispatched' is the responsibility of the dispatch runtime, not the worker.",
    verifiedBy:
      "Future worker shall read lifecycleStage from the registry entry and confirm it is 'dispatched'.",
    failureAction: "Refuse execution. Surface failure mode 'ef-lifecycle-stage-invalid'. Log explicitly.",
    referencedSpec: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    referencedExport: "lifecycleStageVocabulary",
  },
  {
    preconditionId: "ep-006",
    label: "Repo binding confirmed (repoFullName present and valid)",
    description:
      "The plan instance's repoFullName must be present, non-empty, and conform to the " +
      "'owner/repo' format. Execution must not proceed against an unconfirmed or ambiguous repository.",
    verifiedBy:
      "Future worker shall read repoFullName from the registry entry, confirm it is non-empty, " +
      "and confirm it matches the 'owner/repo' format.",
    failureAction: "Refuse execution. Surface failure mode 'ef-repo-binding-invalid'. Log explicitly.",
    referencedSpec: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    referencedExport: "repoBindingRequirements",
  },
  {
    preconditionId: "ep-007",
    label: "Prompt linkage confirmed (promptId present)",
    description:
      "The plan instance's promptId must be non-null and reference a valid ApprovedChangePrompt. " +
      "Execution must not proceed without a governed prompt. " +
      "Reference integrity note: promptId presence records a reference only. The worker must " +
      "rely on governed state — not UI-layer wording — when evaluating prompt sufficiency.",
    verifiedBy:
      "Future worker shall read promptId from the registry entry. A null or absent promptId " +
      "must prevent execution.",
    failureAction: "Refuse execution. Surface failure mode 'ef-prompt-not-linked'. Log explicitly.",
    referencedSpec: "src/components/governance/ApprovedChangePromptSpec.jsx",
    referencedExport: "requiredPromptInputs",
  },
  {
    preconditionId: "ep-008",
    label: "singleStepOnly is true",
    description:
      "The plan instance's singleStepOnly field must be true. " +
      "The governed single-step constraint must not be bypassed by the execution worker.",
    verifiedBy:
      "Future worker shall read singleStepOnly from the registry entry and confirm it is true.",
    failureAction: "Refuse execution. Surface failure mode 'ef-single-step-constraint-violated'. Log explicitly.",
    referencedSpec: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    referencedExport: "instanceFieldDefinitions",
  },
  {
    preconditionId: "ep-009",
    label: "requiresPreviewBeforeExecution is true",
    description:
      "The plan instance's requiresPreviewBeforeExecution field must be true. " +
      "Execution may not proceed without human preview having been enabled in the governance chain.",
    verifiedBy:
      "Future worker shall read requiresPreviewBeforeExecution from the registry entry and confirm it is true.",
    failureAction: "Refuse execution. Surface failure mode 'ef-preview-requirement-not-met'. Log explicitly.",
    referencedSpec: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    referencedExport: "instanceFieldDefinitions",
  },
];

// ── Execution worker allowed actions ──────────────────────────────────────────
// Explicit list of what kinds of execution-phase actions a future ExecutionWorker
// is allowed to perform once implemented and all preconditions are satisfied.
// These are high-level, contract-oriented permissions — not implementation code.

export const executionWorkerAllowedActions = [
  {
    action: "Read plan instance data from the canonical registry",
    description:
      "The future worker is expected to read plan instance data from " +
      "CHANGE_PLAN_INSTANCE_REGISTRY by planId. This is the sole permitted source of " +
      "canonical instance state. The worker must not source plan data from any other location.",
    constrainedBy: "All executionWorkerPreconditions must pass before this read informs any execution.",
  },
  {
    action: "Read the governed prompt for the plan instance",
    description:
      "The future worker is expected to read the governed prompt associated with the plan " +
      "instance's promptId. The prompt must conform to ApprovedChangePromptSpec before " +
      "the worker may use its content in execution.",
    constrainedBy: "Prompt must be linked via a non-null promptId confirmed in precondition ep-007.",
  },
  {
    action: "Apply changes to the target repository within allowedFiles",
    description:
      "The future worker is expected to apply the governed change to the repository identified " +
      "by repoFullName, touching only the files listed in the plan instance's allowedFiles. " +
      "Changes outside allowedFiles are prohibited.",
    constrainedBy:
      "Repo binding must be confirmed (ep-006). allowedFiles is set in the approved plan and " +
      "must not be extended by the worker at runtime.",
  },
  {
    action: "Create a pull request for the governed change",
    description:
      "The future worker is expected to open a pull request in the target repository " +
      "as the execution output for the governed change. " +
      "The pull request must be scoped to the allowedFiles and governed by the approved plan.",
    constrainedBy:
      "All preconditions must pass. The PR must target the branch defined by verificationBranch " +
      "in the plan instance. PR creation must be performed as an execution output, not as a " +
      "governance bypass.",
  },
  {
    action: "Produce execution evidence for the verification layer",
    description:
      "The future worker is expected to produce structured evidence of what was executed, " +
      "including the PR URL, commit references, files changed, and execution timestamp. " +
      "This evidence must be handed off to the downstream Verification and ExecutionLog layers.",
    constrainedBy:
      "Evidence must match executionWorkerRequiredEvidence. Incomplete evidence must be " +
      "flagged and must not be silently omitted.",
  },
  {
    action: "Surface and log all failure modes explicitly",
    description:
      "The future worker is expected to surface all execution failures using the failure " +
      "modes defined in executionWorkerFailureModes. Silent failures are not permitted. " +
      "Every failure must be logged with the planId, failure mode identifier, and reason.",
    constrainedBy:
      "Failure surfacing must not bypass governance. A failed execution must not be " +
      "retried without explicit re-authorization through the governance pipeline.",
  },
];

// ── Execution worker prohibited actions ───────────────────────────────────────
// Explicit list of actions that a future ExecutionWorker must never perform.
// These prohibitions preserve governance separation and prevent bypass paths.

export const executionWorkerProhibitedActions = [
  {
    action: "execute() called without all preconditions satisfied",
    prohibited: true,
    reason:
      "The future worker must not begin execution unless all executionWorkerPreconditions " +
      "have been explicitly evaluated and confirmed. Partial precondition satisfaction is " +
      "not permitted. Any unsatisfied precondition must result in execution refusal.",
  },
  {
    action: "Bypass ChangePlanInstanceRegistry",
    prohibited: true,
    reason:
      "The worker must not source plan instance data from any path other than " +
      "CHANGE_PLAN_INSTANCE_REGISTRY. Bypassing the canonical registry is a hard " +
      "governance boundary violation. The registry is the sole source of truth for " +
      "canonical plan instances.",
  },
  {
    action: "Bypass DispatchAuthorizationSpec",
    prohibited: true,
    reason:
      "The worker must not execute a plan instance that has not been authorized through " +
      "the dispatch authorization pipeline defined in DispatchAuthorizationSpec. " +
      "The worker is downstream of governance approval — it must not re-evaluate, " +
      "redefine, or waive dispatch conditions.",
  },
  {
    action: "Mutate plan instance fields in the registry",
    prohibited: true,
    reason:
      "The worker must not write to CHANGE_PLAN_INSTANCE_REGISTRY or alter any plan " +
      "instance field directly. Lifecycle stage transitions (e.g., 'dispatched' → 'executing' " +
      "→ 'execution-complete') are the responsibility of a future verified runtime mutation " +
      "component, not the execution worker itself.",
  },
  {
    action: "Infer or synthesize missing governed state",
    prohibited: true,
    reason:
      "The worker must not guess, infer, or synthesize values for null or absent required " +
      "fields. A null promptId, missing repoFullName, or absent dispatch decision must " +
      "result in execution refusal — never in inferred execution.",
  },
  {
    action: "Touch files outside allowedFiles",
    prohibited: true,
    reason:
      "The worker must not modify, create, or delete any file outside the allowedFiles " +
      "list defined in the approved change plan. Files in outOfScope must never be touched. " +
      "Scope violations are hard governance boundary violations.",
  },
  {
    action: "Redefine approvalStatus, lifecycleStage, or dispatchStatus",
    prohibited: true,
    reason:
      "Approval and lifecycle state is governed by upstream layers. The worker must not " +
      "alter these fields, must not treat them as mutable worker outputs, and must not " +
      "interpret its own execution as implicit approval or authorization.",
  },
  {
    action: "Perform network calls or GitHub API reads outside governed inputs",
    prohibited: true,
    reason:
      "The worker must not make network calls, API requests, or read repository state from " +
      "sources other than those declared in executionWorkerInputs. Ad-hoc repository reads " +
      "that bypass the governance pipeline are prohibited.",
  },
  {
    action: "Open multiple pull requests for a single plan instance",
    prohibited: true,
    reason:
      "A single plan instance governs a single step only (singleStepOnly === true). " +
      "The worker must not open more than one pull request per execution of a given plan instance. " +
      "Multiple PR creation for a single instance is a governance constraint violation.",
  },
  {
    action: "Silent failure — hiding errors from the verification layer",
    prohibited: true,
    reason:
      "All execution failures must be surfaced using executionWorkerFailureModes and logged " +
      "with the planId, failure mode identifier, and reason. " +
      "Silent failures, swallowed exceptions, and uninstrumented error states are prohibited. " +
      "The verification layer must always be able to determine what happened.",
  },
  {
    action: "Execute without a prior human-preview-enabled plan instance",
    prohibited: true,
    reason:
      "requiresPreviewBeforeExecution must be true (precondition ep-009). The worker must " +
      "not execute a plan instance for which human preview was not mandatory in the " +
      "governance chain.",
  },
];

// ── Execution worker required evidence ────────────────────────────────────────
// What evidence, artifacts, and results a future ExecutionWorker must produce
// so that the downstream Verification and ExecutionLog layers can inspect what happened.
// The worker must produce all evidence listed here. Incomplete evidence must be flagged.

export const executionWorkerRequiredEvidence = [
  {
    evidenceId: "ee-001",
    label: "planId",
    type: "string",
    description:
      "The planId of the plan instance that was executed. " +
      "Must match the planId looked up from CHANGE_PLAN_INSTANCE_REGISTRY.",
    required: true,
  },
  {
    evidenceId: "ee-002",
    label: "repoFullName",
    type: "string",
    description:
      "The full repository name (owner/repo) against which execution was performed. " +
      "Must match the repoFullName confirmed in precondition ep-006.",
    required: true,
  },
  {
    evidenceId: "ee-003",
    label: "promptId",
    type: "string",
    description:
      "The promptId of the governed prompt that was used in execution. " +
      "Must match the promptId from the plan instance.",
    required: true,
  },
  {
    evidenceId: "ee-004",
    label: "executionTimestamp",
    type: "ISO 8601 datetime string",
    description:
      "The timestamp at which execution was initiated. " +
      "Must be recorded at the moment execution begins, not at planning or dispatch time.",
    required: true,
  },
  {
    evidenceId: "ee-005",
    label: "pullRequestUrl",
    type: "string (URL)",
    description:
      "The URL of the pull request opened as the execution output. " +
      "Must be a fully qualified URL to the created PR in the target repository. " +
      "If execution did not result in a PR, this field must be null and the reason must be logged.",
    required: true,
  },
  {
    evidenceId: "ee-006",
    label: "commitSha",
    type: "string",
    description:
      "The commit SHA that was pushed as part of the governed change. " +
      "Must reference the actual commit created in the target repository.",
    required: true,
  },
  {
    evidenceId: "ee-007",
    label: "filesChanged",
    type: "array of strings",
    description:
      "Explicit list of files that were modified, created, or deleted during execution. " +
      "Every entry must be within allowedFiles. Any file outside allowedFiles must be " +
      "flagged as a scope violation and must prevent evidence handoff.",
    required: true,
  },
  {
    evidenceId: "ee-008",
    label: "executionOutcome",
    type: "string (controlled vocabulary)",
    description:
      "The outcome of the execution attempt. " +
      "Must use the executionOutcomeVocabulary defined in this spec. " +
      "Valid values: 'execution-succeeded', 'execution-failed', 'execution-refused'.",
    required: true,
  },
  {
    evidenceId: "ee-009",
    label: "failureModeId",
    type: "string or null",
    description:
      "The identifier of the failure mode surfaced during execution, if any. " +
      "Must use a failureModeId from executionWorkerFailureModes. " +
      "Must be null if executionOutcome is 'execution-succeeded'.",
    required: true,
  },
  {
    evidenceId: "ee-010",
    label: "failureReason",
    type: "string or null",
    description:
      "Human-readable reason for the failure, if any. " +
      "Must be populated whenever failureModeId is non-null. " +
      "Must be null if executionOutcome is 'execution-succeeded'.",
    required: true,
  },
  {
    evidenceId: "ee-011",
    label: "dispatchAuthorizationConfirmed",
    type: "boolean",
    description:
      "Explicit boolean confirming that a dispatch authorization decision of 'authorized' " +
      "was present before execution began. " +
      "Must be true for any evidence record handed to the verification layer. " +
      "If false, the evidence record must be flagged as a governance violation.",
    required: true,
  },
  {
    evidenceId: "ee-012",
    label: "verificationHandoffReady",
    type: "boolean",
    description:
      "Explicit boolean indicating whether the evidence record is complete and ready " +
      "for handoff to the downstream Verification and ExecutionLog layers. " +
      "Must be false if any required evidence field is absent, null when required, or " +
      "carries a scope violation.",
    required: true,
  },
];

// ── Execution worker failure modes ────────────────────────────────────────────
// Structured list of failure classes that a future ExecutionWorker must surface
// rather than hide. These are contract definitions only — no handlers are implemented.
// The worker must identify the applicable failure mode and log it with the planId.

export const executionWorkerFailureModes = [
  {
    failureModeId: "ef-registry-not-found",
    label: "Registry entry not found",
    description:
      "The plan instance could not be located by planId in CHANGE_PLAN_INSTANCE_REGISTRY. " +
      "Execution must be refused. The planId and the absence of a registry entry must be logged.",
    correspondingPrecondition: "ep-001",
    executionRefused: true,
  },
  {
    failureModeId: "ef-authorization-not-confirmed",
    label: "Dispatch authorization not confirmed",
    description:
      "No dispatch authorization decision of 'authorized' was found for the plan instance. " +
      "Execution must be refused. The planId and the absent or non-authorized dispatch status " +
      "must be logged.",
    correspondingPrecondition: "ep-002",
    executionRefused: true,
  },
  {
    failureModeId: "ef-dispatch-conditions-unmet",
    label: "Dispatch conditions not all satisfied",
    description:
      "One or more requiredDispatchConditions from DispatchAuthorizationSpec were not " +
      "satisfied at the time of execution. Execution must be refused. " +
      "The first failing conditionId and reason must be logged.",
    correspondingPrecondition: "ep-003",
    executionRefused: true,
  },
  {
    failureModeId: "ef-approval-status-invalid",
    label: "Plan instance approvalStatus is not 'approved'",
    description:
      "The plan instance's approvalStatus is not 'approved'. " +
      "Execution must be refused. The planId and actual approvalStatus value must be logged.",
    correspondingPrecondition: "ep-004",
    executionRefused: true,
  },
  {
    failureModeId: "ef-lifecycle-stage-invalid",
    label: "Plan instance lifecycleStage is not 'dispatched'",
    description:
      "The plan instance's lifecycleStage is not 'dispatched' when the worker picks up the work. " +
      "Execution must be refused. The planId and actual lifecycleStage value must be logged.",
    correspondingPrecondition: "ep-005",
    executionRefused: true,
  },
  {
    failureModeId: "ef-repo-binding-invalid",
    label: "Repository binding not confirmed",
    description:
      "The plan instance's repoFullName is absent, empty, or does not conform to the " +
      "'owner/repo' format. Execution must be refused. The planId and the invalid " +
      "repoFullName value must be logged.",
    correspondingPrecondition: "ep-006",
    executionRefused: true,
  },
  {
    failureModeId: "ef-prompt-not-linked",
    label: "Prompt not linked",
    description:
      "The plan instance's promptId is null or absent. " +
      "Execution must be refused. The planId and the null promptId must be logged.",
    correspondingPrecondition: "ep-007",
    executionRefused: true,
  },
  {
    failureModeId: "ef-single-step-constraint-violated",
    label: "Single-step constraint not satisfied",
    description:
      "The plan instance's singleStepOnly field is not true. " +
      "Execution must be refused. The planId and the singleStepOnly value must be logged.",
    correspondingPrecondition: "ep-008",
    executionRefused: true,
  },
  {
    failureModeId: "ef-preview-requirement-not-met",
    label: "Preview requirement not met",
    description:
      "The plan instance's requiresPreviewBeforeExecution field is not true. " +
      "Execution must be refused. The planId and the requiresPreviewBeforeExecution value " +
      "must be logged.",
    correspondingPrecondition: "ep-009",
    executionRefused: true,
  },
  {
    failureModeId: "ef-scope-violation",
    label: "Execution scope violation — file outside allowedFiles",
    description:
      "The execution worker attempted to or did modify a file not listed in allowedFiles. " +
      "This is a hard governance boundary violation. Execution must be aborted if in progress. " +
      "The planId, the violating file path, and the allowedFiles list must be logged.",
    correspondingPrecondition: null,
    executionRefused: true,
  },
  {
    failureModeId: "ef-registry-mismatch",
    label: "Plan instance registry mismatch",
    description:
      "The plan instance data used at execution time does not match the registry entry at " +
      "the time of lookup. This may indicate a mid-execution mutation or an out-of-sync " +
      "state. Execution must be aborted. The planId and the mismatch details must be logged.",
    correspondingPrecondition: null,
    executionRefused: true,
  },
  {
    failureModeId: "ef-incomplete-evidence",
    label: "Incomplete execution evidence — verification handoff failed",
    description:
      "One or more required evidence fields from executionWorkerRequiredEvidence are absent " +
      "or null after execution. The evidence record must be marked verificationHandoffReady: false. " +
      "The planId and the missing evidence field identifiers must be logged.",
    correspondingPrecondition: null,
    executionRefused: false,
  },
  {
    failureModeId: "ef-verification-handoff-failure",
    label: "Verification layer handoff failure",
    description:
      "The execution worker was unable to hand off the evidence record to the downstream " +
      "Verification or ExecutionLog layer. The evidence record must be preserved and the " +
      "failure must be logged with the planId and the reason for the handoff failure.",
    correspondingPrecondition: null,
    executionRefused: false,
  },
];

// ── Execution worker boundary rules ───────────────────────────────────────────
// Explicit rules that preserve governance separation between the execution worker
// and upstream governance artifacts. These rules make clear that runtime execution
// is downstream of governance approval and must not redefine approval state.

export const executionWorkerBoundaryRules = [
  {
    rule: "ExecutionWorker is downstream of governance — not parallel to it",
    description:
      "The execution layer is expected to operate only after the full governance pipeline " +
      "(ApprovedChangePlanSpec → ApprovedChangePlanInstanceSpec → ChangePlanInstanceRegistry → " +
      "DispatchAuthorizationSpec) has been traversed and all conditions have been satisfied. " +
      "The worker must never be invoked as a shortcut around any governance layer.",
    enforcement: "Future ExecutionWorker runtime (not yet created).",
  },
  {
    rule: "ExecutionWorker must not bypass ChangePlanInstanceRegistry",
    description:
      "The canonical registry is the single source of truth for plan instances. " +
      "The future worker must not read plan instance data from any other source. " +
      "It must not maintain its own shadow registry or cache of plan instances.",
    enforcement: "Future ExecutionWorker runtime (not yet created).",
  },
  {
    rule: "ExecutionWorker must not bypass DispatchAuthorizationSpec",
    description:
      "The execution worker must confirm that a dispatch authorization decision of 'authorized' " +
      "was produced by a verified dispatch runtime component before proceeding. " +
      "The worker must not re-evaluate, waive, or reinterpret dispatch conditions. " +
      "It must treat the dispatch authorization decision as a hard gate.",
    enforcement: "Future ExecutionWorker runtime (not yet created).",
  },
  {
    rule: "ExecutionWorker must not redefine approval state",
    description:
      "The worker must not alter approvalStatus, lifecycleStage, dispatchStatus, planId, " +
      "repoFullName, promptId, allowedFiles, outOfScope, or any other immutable identity field " +
      "in the plan instance. These fields are governed by upstream layers and must not be " +
      "changed as a side effect of execution.",
    enforcement: "Future ExecutionWorker runtime (not yet created).",
  },
  {
    rule: "Execution scope is bounded by allowedFiles and outOfScope from the approved plan",
    description:
      "The worker may only touch files listed in allowedFiles. Files listed in outOfScope " +
      "must never be modified, created, or deleted. The worker must not extend its own scope " +
      "at runtime. Scope is fixed by the approved plan and must not be renegotiated.",
    enforcement: "Future ExecutionWorker runtime (not yet created).",
  },
  {
    rule: "No execution may proceed without a confirmed repo binding",
    description:
      "The worker must refuse execution if repoFullName is absent, empty, or malformed. " +
      "Execution against an unconfirmed repository is a governance boundary violation.",
    enforcement: "Future ExecutionWorker runtime (not yet created).",
  },
  {
    rule: "No execution may proceed without a governed prompt",
    description:
      "The worker must require a non-null promptId linked to a conforming ApprovedChangePrompt. " +
      "Promptless execution is a governance boundary violation. " +
      "Reference integrity: promptId presence records a reference — the worker must rely on " +
      "governed state, not UI-layer wording, when determining prompt sufficiency.",
    enforcement: "Future ExecutionWorker runtime (not yet created).",
  },
  {
    rule: "Evidence must be produced for every execution attempt — including refused ones",
    description:
      "The worker must produce a structured evidence record (using executionWorkerRequiredEvidence) " +
      "for every execution attempt, including attempts that are refused due to failed preconditions. " +
      "Refused executions must carry executionOutcome: 'execution-refused' and the applicable " +
      "failureModeId. Evidence must be handed to the downstream Verification and ExecutionLog layers.",
    enforcement: "Future ExecutionWorker runtime (not yet created).",
  },
  {
    rule: "ExecutionWorkerSpec existence does not constitute an available execution runtime",
    description:
      "The presence of this spec file does not mean that execution runtime behavior exists, " +
      "is scheduled, or is in progress. No execution runtime is implemented. " +
      "A future ExecutionWorker component must be built separately, must reference this spec, " +
      "and must not be created until this spec is verified in GitHub.",
    enforcement: "Future ExecutionWorker runtime (not yet created).",
  },
];

// ── Execution outcome vocabulary ──────────────────────────────────────────────
// Controlled vocabulary for the executionOutcome evidence field (ee-008).
// Future workers must use exactly these values and must not introduce new values
// without updating this spec first.

export const executionOutcomeVocabulary = [
  {
    outcome: "execution-succeeded",
    description:
      "All preconditions were satisfied, execution completed, a pull request was created, " +
      "and all required evidence fields were populated. " +
      "The evidence record is ready for handoff to the verification layer.",
    terminalState: false,
  },
  {
    outcome: "execution-failed",
    description:
      "All preconditions were satisfied and execution was attempted, but an error " +
      "occurred during the execution phase (e.g., repository write failed, PR creation failed). " +
      "The failureModeId and failureReason must be populated in the evidence record.",
    terminalState: false,
  },
  {
    outcome: "execution-refused",
    description:
      "One or more executionWorkerPreconditions were not satisfied. " +
      "Execution was refused before any repository write was attempted. " +
      "The failureModeId and failureReason must be populated in the evidence record.",
    terminalState: false,
  },
];

// ── Blocked execution capabilities ────────────────────────────────────────────
// Capabilities that this spec must never implement or be interpreted as providing.
// A future ExecutionWorker must not introduce any of these capabilities into this file.

export const blockedExecutionCapabilities = [
  {
    capability: "execute()",
    blocked: true,
    reason:
      "This spec does not implement an execution function. No execute() call, invocation, " +
      "trigger, or event emission may be introduced into this file. " +
      "Execution runtime behavior is governed by a future verified ExecutionWorker component.",
  },
  {
    capability: "dispatch()",
    blocked: true,
    reason:
      "This spec does not implement dispatch. No dispatch() call or dispatch trigger may " +
      "appear in this file. Dispatch is the responsibility of an upstream component.",
  },
  {
    capability: "createPullRequest() / createPR()",
    blocked: true,
    reason:
      "This spec does not create, authorize, or record pull requests. " +
      "PR creation is an execution-phase action reserved for a future verified ExecutionWorker.",
  },
  {
    capability: "fetch() / axios / HTTP calls",
    blocked: true,
    reason:
      "This spec does not make backend calls, API requests, or network requests of any kind. " +
      "No fetch(), axios, XMLHttpRequest, or equivalent may appear in this file.",
  },
  {
    capability: "Worker runtime invocation",
    blocked: true,
    reason:
      "This spec does not invoke, call, or communicate with any execution worker. " +
      "Worker logic is the responsibility of a future verified ExecutionWorker component.",
  },
  {
    capability: "Registry state mutation",
    blocked: true,
    reason:
      "This spec does not mutate CHANGE_PLAN_INSTANCE_REGISTRY or any plan instance field. " +
      "All exports are read-only contract definitions.",
  },
  {
    capability: "Background jobs / async worker flows",
    blocked: true,
    reason:
      "This spec defines a synchronous contract only. It does not schedule, queue, or initiate " +
      "any background processing or asynchronous worker flow.",
  },
  {
    capability: "React components / JSX / hooks / mutable state",
    blocked: true,
    reason:
      "This file contains no React components, JSX rendering logic, hooks, or mutable state. " +
      "It is a schema/data artifact only. All exports are plain objects and arrays.",
  },
];

// ── Consuming components planned ───────────────────────────────────────────────
// Future components that will consume this spec. Listed here to make downstream
// usage explicit without coupling to any implementation.

export const consumingComponentsPlanned = [
  {
    component: "Future: ExecutionWorker.jsx",
    phase: "gov-006 Phase 9 or later",
    usage:
      "Will implement the execution worker runtime that applies governed changes to the " +
      "target repository. Must consume this spec as its authoritative contract. " +
      "Must satisfy all executionWorkerPreconditions before execution. " +
      "Must produce all executionWorkerRequiredEvidence after execution. " +
      "Must surface all executionWorkerFailureModes rather than hiding them. " +
      "Must enforce all executionWorkerBoundaryRules and executionWorkerProhibitedActions.",
    mustNotBeCreatedUntil:
      "ExecutionWorkerSpec is verified in the GitHub repository.",
  },
  {
    component: "Future: Verification layer",
    phase: "gov-006 Phase 10 or later",
    usage:
      "Will consume the evidence record produced by ExecutionWorker to verify that " +
      "execution was performed correctly against the governed plan. " +
      "Must confirm verificationHandoffReady is true before proceeding. " +
      "Must record the verification outcome in the ExecutionLog.",
    mustNotBeCreatedUntil:
      "ExecutionWorker is created and verified in the GitHub repository.",
  },
  {
    component: "Future: ExecutionLog layer",
    phase: "gov-006 Phase 11 or later",
    usage:
      "Will record the full audit trail of execution and verification outcomes per plan instance. " +
      "Must consume the evidence record produced by ExecutionWorker and the verification outcome. " +
      "Must record planId, executionOutcome, failureModeId (if any), verificationHandoffReady, " +
      "and all other evidence fields defined in executionWorkerRequiredEvidence.",
    mustNotBeCreatedUntil:
      "Verification layer is created and verified in the GitHub repository.",
  },
];

// ── Aggregate export ───────────────────────────────────────────────────────────
// Single aggregate export for convenience. Consuming components that need the full
// spec may import this object. Individual named exports remain authoritative.

export const EXECUTION_WORKER_SPEC = {
  specMeta,
  executionWorkerInputs,
  executionWorkerPreconditions,
  executionWorkerAllowedActions,
  executionWorkerProhibitedActions,
  executionWorkerRequiredEvidence,
  executionWorkerFailureModes,
  executionWorkerBoundaryRules,
  executionOutcomeVocabulary,
  blockedExecutionCapabilities,
  consumingComponentsPlanned,
};

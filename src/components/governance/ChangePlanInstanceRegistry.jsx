// ChangePlanInstanceRegistry — governance schema/data artifact
// gov-006 Phase 4 — created 2026-03-16
// Project: GovernanceHub (projectId: governancehub, projectSlug: governancehub)
//
// This file is a pure schema/data artifact.
// It defines the canonical registry for approved change plan instances.
// It does NOT implement dispatch logic, execution logic, PR creation, runtime
// persistence, automatic status mutation, or any runtime workflow.
//
// Conceptual position:
//   approved plan spec (ApprovedChangePlanSpec)
//     → plan instance contract (ApprovedChangePlanInstanceSpec)
//       → [ChangePlanInstanceRegistry]  ← this file
//         → dispatch authorization (DispatchAuthorizationSpec — not yet created)
//           → execution → verification → execution log
//
// Separation of concerns:
//   ApprovedChangePlanSpec.jsx          — schema contract for what an approved plan must look like
//   ApprovedChangePromptSpec.jsx        — schema contract for a prompt generated from a plan
//   ApprovedChangePlanInstanceSpec.jsx  — canonical working plan instance contract
//   ChangePlanInstanceRegistry.jsx      — canonical registry of plan instances (this file)
//   Future: DispatchAuthorizationSpec   — dispatch authorization rules (not yet created)
//   Future: dispatch/execution/verification components — may only be built after registry is verified
//
// Key distinctions:
//   • The registry is NOT a dispatch layer.
//   • The registry is NOT an execution layer.
//   • The registry is NOT a database implementation.
//   • The registry is NOT a PhaseExecutionLog.
//   • The registry is the single source of truth for working plan instances.
//   • Downstream layers must read plan instances from this registry by planId.
//   • planId is the canonical identity key for all registry entries.
//   • Each entry must conform to ApprovedChangePlanInstanceSpec.
//   • Repo binding must remain visible at registry level.
//   • Absent or unresolved runtime fields must remain explicit — never guessed.

// ── Registry metadata ──────────────────────────────────────────────────────────

export const registryMeta = {
  artifactId: "change-plan-instance-registry",
  version: "1.0.0",
  governedBy: "gov-006",
  phase: "Phase 4",
  projectId: "governancehub",
  projectSlug: "governancehub",
  createdAt: "2026-03-16",
  description:
    "Canonical registry of approved change plan instances for GovernanceHub. " +
    "This registry is the single source of truth that downstream layers — dispatch, " +
    "execution, verification, and UI review surfaces — must read from when working " +
    "with canonical plan instances. " +
    "The registry does not dispatch, execute, create PRs, persist to a database, " +
    "or mutate instance state. It is a schema/data artifact only.",
  status: "registry-schema-only",
  canonicalInstanceKey: "planId",
  instanceManagementImplemented: false,
  runtimePersistenceImplemented: false,
  dispatchable: false,
  autoExecutable: false,
  note:
    "This registry does not authorize any dispatch or execution. Future runtime layers " +
    "must be built separately, must reference this registry, and must not be created " +
    "until this registry is verified in GitHub.",
};

// ── Registry identity rules ────────────────────────────────────────────────────
// Rules that govern how plan instances are identified and deduplicated within the registry.

export const registryIdentityRules = [
  {
    rule: "planId is the canonical identity key",
    description:
      "Every registry entry must carry a planId that is globally unique within the project. " +
      "All downstream layers must reference a plan instance by its planId.",
    enforcement: "Future plan instance management runtime (not yet created).",
  },
  {
    rule: "planId must be unique across all registry entries",
    description:
      "No two registry entries may share the same planId. " +
      "A planId that already appears in the registry must not be inserted again. " +
      "If a plan is superseded, the existing entry must be updated — not duplicated.",
    enforcement: "Future plan instance management runtime (not yet created).",
  },
  {
    rule: "repoFullName is required for every registry entry",
    description:
      "Each registry entry must carry the full GitHub repository name " +
      "(format: 'owner/repo'). " +
      "Plan instances without a repo binding are not valid and must not enter the registry.",
    enforcement: "Future plan instance management runtime (not yet created).",
  },
  {
    rule: "No duplicate active entries for the same planId",
    description:
      "The registry must not contain more than one active entry for any given planId. " +
      "Superseded instances may remain in the registry for audit purposes, but their " +
      "lifecycleStage must be set to 'superseded'.",
    enforcement: "Future plan instance management runtime (not yet created).",
  },
  {
    rule: "Immutable identity fields must not be repurposed",
    description:
      "Fields declared immutable in ApprovedChangePlanInstanceSpec " +
      "(planId, sourceType, sourceId, repoFullName, title, goal, changeType, allowedFiles, " +
      "outOfScope, acceptanceCriteria, approvalStatus, singleStepOnly, " +
      "requiresPreviewBeforeExecution, requiresPostMergeVerification, " +
      "verificationTargetType, verificationBranch) " +
      "must never be altered after an instance is added to the registry. " +
      "These fields establish the provenance and governance scope of the instance.",
    enforcement: "Future plan instance management runtime (not yet created).",
  },
];

// ── Registry entry requirements ────────────────────────────────────────────────
// Requirements that each entry in the registry must satisfy to be a valid registry record.

export const registryEntryRequirements = [
  {
    requirement: "All requiredInstanceFields must be present",
    description:
      "Every registry entry must carry all fields listed in requiredInstanceFields " +
      "from ApprovedChangePlanInstanceSpec. " +
      "A plan instance missing any required field must not be accepted into the registry.",
    referencedSpec: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    referencedExport: "requiredInstanceFields",
  },
  {
    requirement: "Lifecycle fields must be present and use the correct vocabulary",
    description:
      "lifecycleStage, dispatchStatus, executionStatus, and verificationStatus must each " +
      "be present and must use values defined in the respective status vocabulary exports " +
      "from ApprovedChangePlanInstanceSpec.",
    referencedSpec: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    referencedExports: [
      "lifecycleStageVocabulary",
      "dispatchStatusVocabulary",
      "executionStatusVocabulary",
      "verificationStatusVocabulary",
    ],
  },
  {
    requirement: "Linkage fields must be representable",
    description:
      "sourceAuditId, promptId, executionLogEntryId, verificationTargetType, " +
      "verificationTargetValue, and verificationBranch must be present as fields. " +
      "Fields whose values are not yet known must be set to null — they must not be omitted.",
    rationale:
      "Explicit null is preferable to an absent field. An absent field could be " +
      "misinterpreted as unintended or corrupt data. A null value is an explicit statement " +
      "that the field is known but not yet resolved.",
  },
  {
    requirement: "approvalStatus must conform to ApprovedChangePlanInstanceSpec vocabulary",
    description:
      "The approvalStatus field of each registry entry must be one of the values defined " +
      "in planApprovalStatusVocabulary from ApprovedChangePlanInstanceSpec. " +
      "An entry with an unrecognised approvalStatus must be rejected.",
    referencedSpec: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    referencedExport: "planApprovalStatusVocabulary",
  },
  {
    requirement: "Entry must conform to ApprovedChangePlanInstanceSpec in full",
    description:
      "Every registry entry is expected to be a valid instance of the schema defined " +
      "in ApprovedChangePlanInstanceSpec. No fields may violate the constraints defined " +
      "in instanceFieldDefinitions from that spec.",
    referencedSpec: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    referencedExport: "instanceFieldDefinitions",
  },
];

// ── Registry status rules ──────────────────────────────────────────────────────
// Rules governing what lifecycle states the registry may hold and how absent fields
// must be treated.

export const registryStatusRules = [
  {
    rule: "The registry may hold instances across all lifecycle stages",
    description:
      "Entries may be in any lifecycleStage defined in ApprovedChangePlanInstanceSpec " +
      "(e.g., 'created', 'prompt-generated', 'dispatched', 'executing', 'executed', " +
      "'verified', 'superseded', 'cancelled'). " +
      "The registry is not limited to 'active' or 'pending' instances.",
  },
  {
    rule: "Absence of dispatch/execution/verification data must remain explicit",
    description:
      "If a plan instance has not yet reached dispatch, execution, or verification, " +
      "the corresponding status and linkage fields must be set to null or the appropriate " +
      "'not-yet' vocabulary value — they must not be omitted or guessed.",
  },
  {
    rule: "The registry does not imply runnable state",
    description:
      "The presence of a plan instance in this registry does not mean the instance is " +
      "runnable, dispatchable, or ready for execution. " +
      "Runnable state is determined by downstream dispatch authorization logic " +
      "that does not yet exist. The registry is a data record only.",
  },
  {
    rule: "Status mutations are the responsibility of future runtime layers",
    description:
      "This registry artifact does not implement any status mutation logic. " +
      "Updating lifecycleStage, dispatchStatus, executionStatus, or verificationStatus " +
      "is the sole responsibility of future verified runtime components. " +
      "This registry defines the contract — it does not enforce transitions.",
  },
];

// ── Registry linkage requirements ──────────────────────────────────────────────
// Defines the linkage fields every registry entry must carry to maintain traceability
// across the governed execution pipeline.

export const registryLinkageRequirements = [
  {
    field: "sourceAuditId",
    required: true,
    nullableUntil: "An audit source is resolved",
    description:
      "Identifies the audit entry or governance task that originated this plan instance. " +
      "Must be set when the source audit is known. Set to null when not yet resolved.",
  },
  {
    field: "promptId",
    required: true,
    nullableUntil: "A governed prompt is generated from this plan instance",
    description:
      "Identifies the ApprovedChangePrompt generated from this plan instance. " +
      "Must be set when a prompt has been generated. Set to null when not yet resolved.",
  },
  {
    field: "executionLogEntryId",
    required: true,
    nullableUntil: "An execution log entry is created for this plan instance",
    description:
      "Identifies the PhaseExecutionLog entry that records execution of this plan instance. " +
      "Must be set when execution has been recorded. Set to null when not yet resolved.",
  },
  {
    field: "verificationTargetType",
    required: true,
    nullableUntil: "Verification target is confirmed",
    description:
      "Describes the type of verification target (e.g., 'branch', 'commit', 'pr'). " +
      "Must be set at plan instance creation when known. Set to null when not yet resolved.",
  },
  {
    field: "verificationTargetValue",
    required: true,
    nullableUntil: "Verification target value is resolved post-execution",
    description:
      "The specific identifier (e.g., branch name, commit SHA, PR number) of the " +
      "verification target. May not be known until after execution completes. " +
      "Set to null when not yet resolved.",
  },
  {
    field: "verificationBranch",
    required: true,
    nullableUntil: "Verification branch is confirmed",
    description:
      "The Git branch against which post-execution verification must be performed. " +
      "Should be set at plan instance creation when known. Set to null when not yet resolved.",
  },
];

// ── Registry read model rules ──────────────────────────────────────────────────
// Rules that consuming components must follow when reading from this registry.

export const registryReadModelRules = [
  {
    rule: "Consumers must read by planId",
    description:
      "planId is the canonical identity key. All downstream components that read plan " +
      "instances from this registry must look up entries by planId. " +
      "Lookups by title, goal, or any non-identity field are not authoritative.",
  },
  {
    rule: "Consumers must not infer missing runtime state",
    description:
      "If a linkage field is null (e.g., promptId, executionLogEntryId), consumers must " +
      "treat that as an explicit signal that the field is not yet resolved. " +
      "Consumers must not guess, synthesise, or infer a value for a null field.",
  },
  {
    rule: "Consumers must not mutate canonical identity fields",
    description:
      "Fields declared immutable in ApprovedChangePlanInstanceSpec must not be altered " +
      "by any consuming component. Read-only access to identity fields is permitted. " +
      "Write access to identity fields is not permitted by any consumer of this registry.",
  },
  {
    rule: "Consumers must not treat registry presence as dispatch authorization",
    description:
      "The presence of a plan instance in the registry does not authorize dispatch. " +
      "Dispatch authorization is the responsibility of a future DispatchAuthorizationSpec " +
      "and its associated runtime component. Registry consumers must not bypass this gate.",
  },
  {
    rule: "Consumers must not treat registry presence as execution authorization",
    description:
      "The presence of a plan instance in the registry does not authorize execution. " +
      "Execution authorization requires a verified execution component that does not yet exist.",
  },
];

// ── Blocked registry capabilities ─────────────────────────────────────────────
// Capabilities that this registry must never implement or be interpreted as providing.

export const blockedRegistryCapabilities = [
  {
    capability: "Dispatch",
    blocked: true,
    reason:
      "This registry is not a dispatch layer. Dispatch is governed by a future " +
      "DispatchAuthorizationSpec and its associated runtime component. " +
      "No dispatch logic may be added to this file.",
  },
  {
    capability: "Execution",
    blocked: true,
    reason:
      "This registry is not an execution layer. Execution requires a separately " +
      "verified execution worker component that does not yet exist. " +
      "No execution logic may be added to this file.",
  },
  {
    capability: "PR creation",
    blocked: true,
    reason:
      "This registry does not create, authorize, or record PRs. " +
      "PR creation is a future governed capability that requires additional " +
      "governance phases to be built and verified. " +
      "No PR creation logic may be added to this file.",
  },
  {
    capability: "Automatic status mutation",
    blocked: true,
    reason:
      "This registry does not automatically update lifecycle, dispatch, execution, " +
      "or verification status fields. Status mutations are the responsibility of " +
      "future verified runtime components. " +
      "No status mutation logic may be added to this file.",
  },
  {
    capability: "Runtime persistence assumptions",
    blocked: true,
    reason:
      "This registry does not assume, implement, or couple to any backend database, " +
      "storage layer, or persistence mechanism. " +
      "runtimePersistenceImplemented is false. " +
      "No database or storage assumptions may be introduced into this file.",
  },
  {
    capability: "Synthetic instance generation",
    blocked: true,
    reason:
      "This registry must not fabricate, synthesise, or generate plan instances. " +
      "The entries array must contain only real, canonical plan instances that have " +
      "been explicitly approved and recorded. " +
      "An empty entries array is correct and preferred over fabricated examples.",
  },
];

// ── Blocked interpretations ────────────────────────────────────────────────────
// Explicit statements of what this registry must never be interpreted as authorizing.

export const blockedInterpretations = [
  {
    interpretation: "registry === dispatch layer",
    blocked: true,
    reason:
      "This registry is not a dispatch layer. The registry is the canonical data record " +
      "of plan instances. Dispatch is a downstream stage governed by a future " +
      "DispatchAuthorizationSpec that does not yet exist.",
  },
  {
    interpretation: "registry === execution layer",
    blocked: true,
    reason:
      "This registry is not an execution layer. The registry records plan instances. " +
      "Execution is governed by a future execution worker component that does not yet exist.",
  },
  {
    interpretation: "registry === database implementation",
    blocked: true,
    reason:
      "This registry is a schema/data artifact. It defines the contract and initial state " +
      "of the canonical instance registry. It does not implement any backend storage, " +
      "query interface, or persistence mechanism.",
  },
  {
    interpretation: "registry === PhaseExecutionLog",
    blocked: true,
    reason:
      "This registry is not a phase execution log. The PhaseExecutionLog records verified " +
      "governance changes to the repository. This registry records the state of canonical " +
      "plan instances as they move through the governed execution pipeline. They are " +
      "distinct artifacts with distinct purposes.",
  },
  {
    interpretation: "registry entry === ApprovedChangePlanInstanceSpec",
    blocked: true,
    reason:
      "ApprovedChangePlanInstanceSpec defines the schema contract — what a plan instance " +
      "object must look like. A registry entry is a concrete instance that conforms to " +
      "that schema. The spec and the registry entry are not the same artifact.",
  },
  {
    interpretation: "registry existence === plan instance persistence available",
    blocked: true,
    reason:
      "The existence of this registry artifact does not mean runtime instance persistence " +
      "is available. runtimePersistenceImplemented is false. No storage layer exists. " +
      "The entries array in CHANGE_PLAN_INSTANCE_REGISTRY is an in-file data record only.",
  },
  {
    interpretation: "registry entry presence === dispatch authorized",
    blocked: true,
    reason:
      "The presence of a plan instance in this registry does not authorize dispatch. " +
      "Dispatch authorization requires a future DispatchAuthorizationSpec and its " +
      "associated verified runtime component.",
  },
  {
    interpretation: "registry entry presence === execution authorized",
    blocked: true,
    reason:
      "The presence of a plan instance in this registry does not authorize execution. " +
      "Execution requires a future verified execution worker component.",
  },
];

// ── Consuming components planned ───────────────────────────────────────────────
// Future components that will consume this registry. Listed here to make downstream
// usage explicit without coupling to any implementation.

export const consumingComponentsPlanned = [
  {
    component: "src/components/governance/DispatchAuthorizationSpec.jsx",
    phase: "gov-006 Phase 5",
    usage:
      "Will define the dispatch authorization rules and constraints for plan instances " +
      "held in this registry. Must read from CHANGE_PLAN_INSTANCE_REGISTRY by planId. " +
      "Must enforce registryReadModelRules and blockedRegistryCapabilities. " +
      "Must not be created until this registry is verified in GitHub.",
    mustNotBeCreatedUntil:
      "This ChangePlanInstanceRegistry artifact is verified in the GitHub repository.",
  },
  {
    component: "src/components/admin/DispatchReviewPanel.jsx",
    phase: "gov-006 Phase 6 or later",
    usage:
      "Will render a read-only review surface for a plan instance's dispatch eligibility. " +
      "Must read plan instances by planId from CHANGE_PLAN_INSTANCE_REGISTRY. " +
      "Must enforce all blockedInterpretations at the display layer. " +
      "Must not implement dispatch, execution, or mutation logic.",
    mustNotBeCreatedUntil:
      "DispatchAuthorizationSpec is created and verified in the GitHub repository.",
  },
  {
    component: "Future: ExecutionWorkerSpec.jsx",
    phase: "gov-006 Phase 7 or later",
    usage:
      "Will define the execution worker contract for plan instances. " +
      "Must read plan instances by planId from CHANGE_PLAN_INSTANCE_REGISTRY. " +
      "Must not be created until DispatchReviewPanel is verified.",
    mustNotBeCreatedUntil:
      "DispatchReviewPanel is created and verified in the GitHub repository.",
  },
  {
    component: "Future: PromptPreviewPanel.jsx",
    phase: "gov-006 Phase 6 or later",
    usage:
      "Will render a read-only preview of the governed prompt associated with a plan instance. " +
      "Must read plan instances by planId from CHANGE_PLAN_INSTANCE_REGISTRY. " +
      "Must not implement dispatch or execution logic.",
    mustNotBeCreatedUntil:
      "DispatchAuthorizationSpec is created and verified in the GitHub repository.",
  },
  {
    component: "Future: execution/verification read surfaces",
    phase: "gov-006 Phase 8 or later",
    usage:
      "Future components that display execution and verification state for a plan instance " +
      "must read from CHANGE_PLAN_INSTANCE_REGISTRY by planId. " +
      "They must not infer absent runtime fields and must enforce registryReadModelRules.",
    mustNotBeCreatedUntil:
      "The execution worker component is created and verified in the GitHub repository.",
  },
];

// ── Canonical registry object ──────────────────────────────────────────────────
// This is the canonical registry of approved change plan instances.
// Downstream layers must read plan instances from this object by planId.
//
// entries is intentionally empty.
// No plan instances are fabricated.
// An empty registry is the correct and truthful initial state.
// Real plan instances will be added by future runtime layers once those layers
// are built and verified.

export const CHANGE_PLAN_INSTANCE_REGISTRY = {
  meta: {
    artifactId: "change-plan-instance-registry",
    version: "1.0.0",
    governedBy: "gov-006",
    projectId: "governancehub",
    projectSlug: "governancehub",
    createdAt: "2026-03-16",
    canonicalInstanceKey: "planId",
    instanceManagementImplemented: false,
    runtimePersistenceImplemented: false,
    dispatchable: false,
    autoExecutable: false,
    note:
      "entries is empty. No plan instances are fabricated. " +
      "Real canonical instances will be added by future runtime layers " +
      "once those layers are built and verified against this registry.",
  },
  entries: [],
};

// DispatchAuthorizationSpec — governance schema/data artifact
// gov-006 Phase 5 — created 2026-03-16
// Project: GovernanceHub (projectId: governancehub, projectSlug: governancehub)
//
// This file is a pure schema/data artifact.
// It defines the authorization rules that must be satisfied before a plan instance
// may be dispatched to an execution worker.
// It does NOT implement dispatch logic, execution logic, PR creation, worker invocation,
// backend calls, state mutation, prompt generation, or any runtime workflow.
//
// Conceptual position:
//   approved plan spec (ApprovedChangePlanSpec)
//     → plan instance contract (ApprovedChangePlanInstanceSpec)
//       → canonical registry (ChangePlanInstanceRegistry)
//         → [DispatchAuthorizationSpec]  ← this file
//           → execution worker (not yet created)
//             → verification → execution log
//
// Separation of concerns:
//   ApprovedChangePlanSpec.jsx          — schema contract for what an approved plan must look like
//   ApprovedChangePromptSpec.jsx        — schema contract for a prompt generated from a plan
//   ApprovedChangePlanInstanceSpec.jsx  — canonical working plan instance contract
//   ChangePlanInstanceRegistry.jsx      — canonical registry of plan instances
//   DispatchAuthorizationSpec.jsx       — dispatch authorization rules (this file)
//   Future: execution worker            — may only be built after this spec is verified

// ── Spec metadata ──────────────────────────────────────────────────────────────

export const specMeta = {
  specId: "dispatch-authorization-spec",
  version: "1.0.0",
  governedBy: "gov-006",
  phase: "Phase 5",
  projectId: "governancehub",
  projectSlug: "governancehub",
  createdAt: "2026-03-16",
  description:
    "Defines the authorization rules that must be satisfied before a plan instance " +
    "may be dispatched to an execution worker. " +
    "This spec sits between the canonical plan instance registry and any future execution worker. " +
    "Dispatch authorization does not execute the change, create a PR, call a worker, " +
    "mutate registry state, or infer missing state. " +
    "All required dispatch conditions must be explicitly satisfied before a future dispatch " +
    "runtime component may proceed. " +
    "A plan instance that fails any required dispatch condition must be held — not dispatched.",
  status: "schema-only",
  dispatchable: false,
  autoExecutable: false,
  dispatchImplemented: false,
  executionImplemented: false,
  note:
    "This spec does not implement dispatch. A future dispatch runtime component must be " +
    "built separately, must reference this spec, and must not be created until this spec " +
    "is verified in GitHub.",
};

// ── Dispatch authorization inputs ──────────────────────────────────────────────
// Defines the exact source artifacts that a future dispatch authorization runtime
// must read from. Reading outside this list is not permitted without updating this
// spec first.

export const dispatchAuthorizationInputs = [
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
      "blockedInterpretations",
      "CHANGE_PLAN_INSTANCE_REGISTRY",
    ],
    readPurpose:
      "Provides the canonical registry of plan instances. " +
      "The dispatch authorization layer must look up plan instances by planId from " +
      "CHANGE_PLAN_INSTANCE_REGISTRY. It must not dispatch any instance that is not " +
      "found in this registry. It must not mutate the registry.",
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
      "Provides the canonical plan instance schema, status vocabularies, immutability " +
      "rules, and linkage requirements. " +
      "The dispatch authorization layer must validate plan instances against these definitions " +
      "before authorizing dispatch. It must not alter any immutable identity field.",
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
      "Provides the canonical approved plan schema that the plan instance must have been " +
      "derived from. The dispatch authorization layer confirms that the plan instance's " +
      "source plan satisfies the approved change plan contract.",
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
      "Dispatch requires a valid promptId linked to the plan instance. " +
      "The dispatch authorization layer must verify that a prompt exists and conforms " +
      "to the approved prompt contract before authorizing dispatch.",
    writePermitted: false,
  },
];

// ── Required dispatch conditions ───────────────────────────────────────────────
// Every condition listed here must be satisfied before a plan instance may be
// dispatched. A plan instance that fails any condition must be held — not dispatched.
// These conditions are evaluated in the order listed. No condition may be skipped.

export const requiredDispatchConditions = [
  {
    conditionId: "dc-001",
    label: "Approved change plan exists",
    description:
      "The plan instance must have been derived from an ApprovedChangePlan that satisfies " +
      "all requiredPlanFields defined in ApprovedChangePlanSpec. " +
      "A plan instance whose source plan is absent, incomplete, or non-conforming must be held.",
    verifiedBy: "Checking that the plan instance's planId references a conforming ApprovedChangePlan.",
    failureAction: "Hold the plan instance. Do not dispatch. Log the reason explicitly.",
    referencedSpec: "src/components/governance/ApprovedChangePlanSpec.jsx",
    referencedExport: "requiredPlanFields",
  },
  {
    conditionId: "dc-002",
    label: "Valid plan instance in registry",
    description:
      "The plan instance must exist in CHANGE_PLAN_INSTANCE_REGISTRY and must carry all " +
      "fields listed in requiredInstanceFields from ApprovedChangePlanInstanceSpec. " +
      "A plan instance that is absent from the registry or is missing required instance fields " +
      "must be held.",
    verifiedBy:
      "Looking up the plan instance by planId in CHANGE_PLAN_INSTANCE_REGISTRY. " +
      "Confirming all requiredInstanceFields are present and non-null.",
    failureAction: "Hold the plan instance. Do not dispatch. Log the reason explicitly.",
    referencedSpec: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    referencedExport: "requiredInstanceFields",
  },
  {
    conditionId: "dc-003",
    label: "Registry entry exists for planId",
    description:
      "A registry entry keyed by the plan instance's planId must exist in " +
      "CHANGE_PLAN_INSTANCE_REGISTRY. " +
      "The registry is the canonical source of truth. If a plan instance cannot be found " +
      "by planId, it is not a recognized governed instance and must not be dispatched.",
    verifiedBy:
      "Looking up the planId in CHANGE_PLAN_INSTANCE_REGISTRY.entries. " +
      "Dispatch must not proceed if the lookup returns no matching entry.",
    failureAction: "Hold the plan instance. Do not dispatch. Log the reason explicitly.",
    referencedSpec: "src/components/governance/ChangePlanInstanceRegistry.jsx",
    referencedExport: "CHANGE_PLAN_INSTANCE_REGISTRY",
  },
  {
    conditionId: "dc-004",
    label: "Repo binding confirmed",
    description:
      "The plan instance's repoFullName field must be present, non-empty, and must match " +
      "the format 'owner/repo'. " +
      "A plan instance without a confirmed repository binding must be held. " +
      "Dispatch must not proceed against an unconfirmed or ambiguous repository.",
    verifiedBy:
      "Reading repoFullName from the plan instance. Confirming it is present, non-empty, " +
      "and matches the 'owner/repo' format. Confirming it has not been altered from the " +
      "value set at instance creation.",
    failureAction: "Hold the plan instance. Do not dispatch. Log the reason explicitly.",
    referencedSpec: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    referencedExport: "repoBindingRequirements",
  },
  {
    conditionId: "dc-005",
    label: "Approved prompt exists and is linked",
    description:
      "The plan instance must carry a non-null promptId that references a valid " +
      "ApprovedChangePrompt conforming to ApprovedChangePromptSpec. " +
      "A plan instance without a linked, approved prompt must be held. " +
      "Dispatch must not be attempted without a governed prompt.",
    verifiedBy:
      "Reading promptId from the plan instance. Confirming it is non-null and references " +
      "a prompt that satisfies the requiredPromptInputs defined in ApprovedChangePromptSpec. " +
      "Confirming the prompt's repoFullName, allowedFiles, goal, and outOfScope match the plan instance exactly.",
    failureAction: "Hold the plan instance. Do not dispatch. Log the reason explicitly.",
    referencedSpec: "src/components/governance/ApprovedChangePromptSpec.jsx",
    referencedExport: "requiredPromptInputs",
  },
  {
    conditionId: "dc-006",
    label: "Plan instance approvalStatus is 'approved'",
    description:
      "The plan instance's approvalStatus field must be 'approved'. " +
      "A plan instance with any other approvalStatus value must be held.",
    verifiedBy:
      "Reading approvalStatus from the plan instance. " +
      "Confirming the value is 'approved'.",
    failureAction: "Hold the plan instance. Do not dispatch. Log the reason explicitly.",
    referencedSpec: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    referencedExport: "planApprovalStatusVocabulary",
  },
  {
    conditionId: "dc-007",
    label: "Plan instance lifecycleStage is 'prompt-generated'",
    description:
      "The plan instance's lifecycleStage must be 'prompt-generated' before dispatch may occur. " +
      "A plan instance in any other lifecycleStage (e.g., 'created', 'dispatched', " +
      "'executing', 'abandoned') must not be dispatched.",
    verifiedBy:
      "Reading lifecycleStage from the plan instance. Confirming the value is 'prompt-generated'.",
    failureAction: "Hold the plan instance. Do not dispatch. Log the reason explicitly.",
    referencedSpec: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    referencedExport: "lifecycleStageVocabulary",
  },
  {
    conditionId: "dc-008",
    label: "Plan instance dispatchStatus is 'not-dispatched'",
    description:
      "The plan instance's dispatchStatus must be 'not-dispatched' before the first dispatch. " +
      "A plan instance with dispatchStatus 'dispatch-pending', 'dispatched', or " +
      "'dispatch-failed' must not be dispatched again without explicit re-authorization.",
    verifiedBy:
      "Reading dispatchStatus from the plan instance. Confirming the value is 'not-dispatched'.",
    failureAction: "Hold the plan instance. Do not dispatch. Log the reason explicitly.",
    referencedSpec: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    referencedExport: "dispatchStatusVocabulary",
  },
  {
    conditionId: "dc-009",
    label: "singleStepOnly is true",
    description:
      "The plan instance's singleStepOnly field must be true. " +
      "A plan instance with singleStepOnly === false must be held — it does not satisfy " +
      "the governed single-step constraint.",
    verifiedBy:
      "Reading singleStepOnly from the plan instance. Confirming the value is true.",
    failureAction: "Hold the plan instance. Do not dispatch. Log the reason explicitly.",
    referencedSpec: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    referencedExport: "instanceFieldDefinitions",
  },
  {
    conditionId: "dc-010",
    label: "requiresPreviewBeforeExecution is true",
    description:
      "The plan instance's requiresPreviewBeforeExecution field must be true. " +
      "A plan instance with requiresPreviewBeforeExecution === false must be held — " +
      "human preview is mandatory before execution.",
    verifiedBy:
      "Reading requiresPreviewBeforeExecution from the plan instance. Confirming the value is true.",
    failureAction: "Hold the plan instance. Do not dispatch. Log the reason explicitly.",
    referencedSpec: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    referencedExport: "instanceFieldDefinitions",
  },
];

// ── Blocked dispatch capabilities ─────────────────────────────────────────────
// Capabilities that this spec must never implement or be interpreted as providing.
// A future dispatch runtime component must not introduce any of these capabilities.

export const blockedDispatchCapabilities = [
  {
    capability: "dispatch()",
    blocked: true,
    reason:
      "This spec does not implement a dispatch function. No dispatch() call, invocation, " +
      "trigger, or event emission may be introduced into this file. " +
      "Dispatch runtime behavior is governed by a future verified dispatch component.",
  },
  {
    capability: "execute()",
    blocked: true,
    reason:
      "This spec does not implement execution. No execute() call, execution trigger, " +
      "or execution worker invocation may appear in this file.",
  },
  {
    capability: "createPR()",
    blocked: true,
    reason:
      "This spec does not create, authorize, or record pull requests. " +
      "PR creation is a future governed capability that requires additional governance " +
      "phases. No PR creation logic may be added to this file.",
  },
  {
    capability: "fetch() / axios / HTTP calls",
    blocked: true,
    reason:
      "This spec does not make backend calls, API requests, or network requests of any kind. " +
      "No fetch(), axios, XMLHttpRequest, or equivalent may appear in this file.",
  },
  {
    capability: "Worker invocation",
    blocked: true,
    reason:
      "This spec does not invoke, call, or communicate with any execution worker. " +
      "Worker logic is the responsibility of a future verified execution worker component.",
  },
  {
    capability: "Registry state mutation",
    blocked: true,
    reason:
      "This spec does not mutate CHANGE_PLAN_INSTANCE_REGISTRY or any plan instance field. " +
      "Status mutations (lifecycleStage, dispatchStatus, promptId) are the responsibility of " +
      "future verified runtime components.",
  },
  {
    capability: "Inference of missing state",
    blocked: true,
    reason:
      "This spec does not infer, synthesise, or guess missing registry or plan instance state. " +
      "If a required field is null or absent, the plan instance must be held, not dispatched " +
      "on inferred values.",
  },
  {
    capability: "React components",
    blocked: true,
    reason:
      "This file contains no React components, JSX rendering logic, hooks, or component state. " +
      "It is a schema/data artifact only.",
  },
  {
    capability: "Mutable state",
    blocked: true,
    reason:
      "This file contains no mutable variables, class instances, setters, or runtime state. " +
      "All exports are plain objects and arrays.",
  },
];

// ── Dispatch status vocabulary ─────────────────────────────────────────────────
// Defines the controlled vocabulary for dispatch authorization outcomes.
// These values describe the authorization decision — not the execution result.

export const dispatchStatusVocabulary = [
  {
    status: "authorized",
    description:
      "All requiredDispatchConditions have been satisfied. " +
      "The plan instance is authorized to proceed to a future dispatch runtime component. " +
      "This status does not initiate dispatch — it records that the conditions are met.",
    terminalState: false,
  },
  {
    status: "held-pending-conditions",
    description:
      "One or more requiredDispatchConditions have not been satisfied. " +
      "The plan instance must not be dispatched until all conditions are met. " +
      "The reason must be recorded explicitly.",
    terminalState: false,
  },
  {
    status: "held-missing-prompt",
    description:
      "The plan instance is held because promptId is null or the linked prompt does not " +
      "satisfy the approved prompt contract. " +
      "Dispatch may not proceed until a valid, linked, approved prompt exists.",
    terminalState: false,
  },
  {
    status: "held-registry-not-found",
    description:
      "The plan instance is held because no matching registry entry was found in " +
      "CHANGE_PLAN_INSTANCE_REGISTRY for the given planId. " +
      "Dispatch may not proceed without a canonical registry entry.",
    terminalState: false,
  },
  {
    status: "held-repo-binding-unconfirmed",
    description:
      "The plan instance is held because its repoFullName field is absent, empty, or does " +
      "not conform to the 'owner/repo' format. " +
      "Dispatch may not proceed without a confirmed repository binding.",
    terminalState: false,
  },
  {
    status: "held-lifecycle-invalid",
    description:
      "The plan instance is held because its lifecycleStage or dispatchStatus is not in a " +
      "valid pre-dispatch state. " +
      "Dispatch may not proceed until the lifecycle state is correct.",
    terminalState: false,
  },
  {
    status: "authorization-not-evaluated",
    description:
      "No dispatch authorization evaluation has been performed for this plan instance yet. " +
      "This is the initial authorization state before any evaluation occurs.",
    terminalState: false,
    initialValue: true,
  },
];

// ── Dispatch decision rules ────────────────────────────────────────────────────
// Rules that govern how a future dispatch authorization evaluator must make and
// record its dispatch decision.

export const dispatchDecisionRules = [
  {
    rule: "All requiredDispatchConditions must pass before dispatch is authorized",
    description:
      "A dispatch authorization evaluator must check every condition in " +
      "requiredDispatchConditions in order. If any condition fails, the plan instance " +
      "must be held and the failing condition must be recorded. " +
      "Partial authorization is not permitted.",
    enforcement: "Future dispatch authorization runtime (not yet created).",
  },
  {
    rule: "Dispatch authorization is a read-only determination",
    description:
      "The dispatch authorization evaluation reads the plan instance and its linked artifacts. " +
      "It does not mutate any field, registry entry, or external state. " +
      "The determination is a declarative outcome — authorized or held — not an action.",
    enforcement: "Future dispatch authorization runtime (not yet created).",
  },
  {
    rule: "Authorization decisions must be recorded explicitly",
    description:
      "Every dispatch authorization evaluation must produce an explicit decision record " +
      "that includes: planId, the evaluated conditions, the outcome (authorized or held), " +
      "and the reason for any held status. " +
      "Silent failures and uninstrumented holds are not acceptable.",
    enforcement: "Future dispatch authorization runtime (not yet created).",
  },
  {
    rule: "An authorized decision does not initiate dispatch",
    description:
      "A dispatchStatus of 'authorized' from this spec means that all conditions are met. " +
      "It does not trigger, invoke, or schedule any dispatch action. " +
      "A future verified dispatch runtime component must read the authorized status and " +
      "take the dispatch action separately.",
    enforcement: "Future dispatch authorization runtime (not yet created).",
  },
  {
    rule: "A held decision must identify the first failing condition",
    description:
      "When a plan instance is held, the decision record must identify at minimum the " +
      "conditionId of the first failing condition from requiredDispatchConditions. " +
      "The reason for the failure must be recorded in human-readable form.",
    enforcement: "Future dispatch authorization runtime (not yet created).",
  },
  {
    rule: "No condition may be bypassed or waived",
    description:
      "No dispatch authorization evaluator may skip, bypass, or waive any condition " +
      "listed in requiredDispatchConditions. " +
      "All conditions are mandatory. Exception paths that skip conditions are forbidden.",
    enforcement: "Future dispatch authorization runtime (not yet created).",
  },
];

// ── Registry lookup rules ──────────────────────────────────────────────────────
// Rules that govern how a future dispatch authorization evaluator must look up plan
// instances from ChangePlanInstanceRegistry.

export const registryLookupRules = [
  {
    rule: "Look up plan instances by planId only",
    description:
      "The canonical identity key for registry lookups is planId. " +
      "Lookups by title, goal, repoFullName, or any non-identity field are not authoritative " +
      "and must not be used to resolve a plan instance for dispatch authorization.",
    referencedSpec: "src/components/governance/ChangePlanInstanceRegistry.jsx",
    referencedExport: "registryReadModelRules",
  },
  {
    rule: "A missing registry entry must result in a held decision",
    description:
      "If a planId lookup in CHANGE_PLAN_INSTANCE_REGISTRY.entries returns no matching " +
      "entry, the dispatch authorization evaluator must produce a 'held-registry-not-found' " +
      "decision. It must not proceed to evaluate other conditions.",
    referencedSpec: "src/components/governance/ChangePlanInstanceRegistry.jsx",
    referencedExport: "CHANGE_PLAN_INSTANCE_REGISTRY",
  },
  {
    rule: "Null linkage fields must not be inferred",
    description:
      "If a registry entry carries a null value for a required linkage field (e.g., promptId), " +
      "the dispatch authorization evaluator must treat this as an explicit signal that the field " +
      "is not yet resolved. It must not guess, synthesise, or infer a value. " +
      "A null promptId must result in a 'held-missing-prompt' decision.",
    referencedSpec: "src/components/governance/ChangePlanInstanceRegistry.jsx",
    referencedExport: "registryReadModelRules",
  },
  {
    rule: "The registry must not be mutated during lookup",
    description:
      "Reading plan instances from CHANGE_PLAN_INSTANCE_REGISTRY must not alter any " +
      "entry field. The lookup is strictly read-only. " +
      "No field — including lifecycleStage, dispatchStatus, or any linkage field — " +
      "may be changed as a side effect of a lookup.",
    referencedSpec: "src/components/governance/ChangePlanInstanceRegistry.jsx",
    referencedExport: "blockedRegistryCapabilities",
  },
  {
    rule: "Only active registry entries may be considered for dispatch",
    description:
      "A plan instance whose lifecycleStage is 'superseded', 'abandoned', 'execution-complete', " +
      "'verification-passed', or 'verification-failed' must not be evaluated for dispatch. " +
      "Only instances in a valid pre-dispatch lifecycleStage ('prompt-generated') may be " +
      "considered.",
    referencedSpec: "src/components/governance/ApprovedChangePlanInstanceSpec.jsx",
    referencedExport: "lifecycleStageVocabulary",
  },
];

// ── Blocked interpretations ────────────────────────────────────────────────────
// Explicit statements of what this spec must never be interpreted as authorizing.

export const blockedInterpretations = [
  {
    interpretation: "dispatch authorization === dispatch action",
    blocked: true,
    reason:
      "This spec defines the conditions under which dispatch is authorized. " +
      "It does not perform, trigger, or schedule a dispatch action. " +
      "Dispatch runtime behavior is governed by a future verified dispatch component.",
  },
  {
    interpretation: "dispatch authorization === execution authorization",
    blocked: true,
    reason:
      "Dispatch authorization determines whether a plan instance may be sent to an " +
      "execution worker. It does not authorize or initiate execution itself. " +
      "Execution is governed by a future verified execution worker component.",
  },
  {
    interpretation: "dispatch authorization === PR creation",
    blocked: true,
    reason:
      "This spec does not authorize, record, or imply the creation of any pull request. " +
      "PR creation is a future governed capability requiring additional governance phases.",
  },
  {
    interpretation: "authorized dispatch status === plan instance is executing",
    blocked: true,
    reason:
      "A dispatchStatus of 'authorized' from this spec means that dispatch conditions are " +
      "met. It does not mean execution has started, is in progress, or has completed. " +
      "Execution state is governed by a separate, future execution worker component.",
  },
  {
    interpretation: "registry entry existence === dispatch authorized",
    blocked: true,
    reason:
      "The presence of a plan instance in CHANGE_PLAN_INSTANCE_REGISTRY does not authorize " +
      "dispatch. All requiredDispatchConditions must be explicitly evaluated and satisfied.",
  },
  {
    interpretation: "spec existence === dispatch runtime available",
    blocked: true,
    reason:
      "This spec defines the dispatch authorization contract. It does not implement " +
      "dispatch runtime behavior. No dispatch runtime exists until a future component " +
      "is built, verified, and references this spec.",
  },
  {
    interpretation: "dispatch authorization === worker call",
    blocked: true,
    reason:
      "This spec does not invoke, communicate with, or couple to any execution worker. " +
      "Worker invocation is explicitly forbidden from this file.",
  },
  {
    interpretation: "null condition fields === conditions satisfied",
    blocked: true,
    reason:
      "A plan instance field that is null must be treated as not-yet-resolved. " +
      "Null fields do not satisfy dispatch conditions. Missing or null required fields " +
      "must result in a held decision — never an authorized decision.",
  },
];

// ── Consuming components planned ───────────────────────────────────────────────
// Future components that will consume this spec. Listed here to make downstream
// usage explicit without coupling to any implementation.

export const consumingComponentsPlanned = [
  {
    component: "src/components/admin/DispatchReviewPanel.jsx",
    phase: "gov-006 Phase 6",
    usage:
      "Will render a read-only review surface for a plan instance's dispatch eligibility. " +
      "Must read plan instances by planId from CHANGE_PLAN_INSTANCE_REGISTRY. " +
      "Must evaluate and display the dispatch authorization status using requiredDispatchConditions " +
      "and dispatchDecisionRules from this spec. " +
      "Must enforce all blockedDispatchCapabilities and blockedInterpretations at the display layer. " +
      "Must not implement dispatch, execution, mutation, or worker invocation logic.",
    mustNotBeCreatedUntil:
      "DispatchAuthorizationSpec is verified in the GitHub repository.",
  },
  {
    component: "Future: DispatchAuthorizationRuntime.jsx",
    phase: "gov-006 Phase 7 or later",
    usage:
      "Will implement the runtime evaluation of requiredDispatchConditions against a plan instance " +
      "looked up from CHANGE_PLAN_INSTANCE_REGISTRY by planId. " +
      "Must produce an explicit dispatch decision record using dispatchStatusVocabulary. " +
      "Must enforce registryLookupRules and dispatchDecisionRules. " +
      "Must not dispatch, execute, create PRs, mutate registry state, or infer missing state.",
    mustNotBeCreatedUntil:
      "DispatchReviewPanel is created and verified in the GitHub repository.",
  },
  {
    component: "Future: ExecutionWorkerSpec.jsx",
    phase: "gov-006 Phase 8 or later",
    usage:
      "Will define the execution worker contract for dispatched plan instances. " +
      "Must not be invoked until dispatch authorization has produced an 'authorized' decision " +
      "via a verified DispatchAuthorizationRuntime component. " +
      "Must reference this spec to confirm that dispatch conditions were satisfied before " +
      "execution is attempted.",
    mustNotBeCreatedUntil:
      "DispatchAuthorizationRuntime is created and verified in the GitHub repository.",
  },
  {
    component: "Future: execution/verification read surfaces",
    phase: "gov-006 Phase 9 or later",
    usage:
      "Future components that display execution and verification state for a plan instance " +
      "must confirm that dispatch authorization was recorded before execution began. " +
      "They must not display an executing or verified instance that bypassed dispatch authorization.",
    mustNotBeCreatedUntil:
      "ExecutionWorkerSpec is created and verified in the GitHub repository.",
  },
];

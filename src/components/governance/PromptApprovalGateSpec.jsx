// PromptApprovalGateSpec — governance schema/data artifact
// gov-005 Phase 2 (bridge) — created 2026-03-16
// Project: GovernanceHub (projectId: governancehub, projectSlug: governancehub)
//
// This file is a pure schema/data artifact.
// It defines the read-only interpretation contract for a future PromptApprovalGate component.
// It does NOT implement approval execution, dispatch capability, preview capability,
// state transitions, profile mutation, or any runtime workflow.
//
// Separation of concerns:
//   PromptProfileRegistry.jsx          — profile definition and field schema
//   PromptProfileApprovalPolicy.jsx    — approval state rules and governance constraints
//   PromptApprovalGateSpec.jsx         — read-only interpretation contract for a future approval gate (this file)
//   Future: PromptApprovalGate.jsx     — runtime approval workflow component (not yet created)
//   Future: dispatch components        — may only be built after all governance phases above are verified

// ── Spec metadata ──────────────────────────────────────────────────────────────

export const specMeta = {
  specId: "prompt-approval-gate-spec",
  version: "1.0.0",
  governedBy: "gov-005",
  projectId: "governancehub",
  projectSlug: "governancehub",
  createdAt: "2026-03-16",
  description:
    "Defines the read-only interpretation contract that a future PromptApprovalGate component " +
    "must follow when consuming PromptProfileRegistry and PromptProfileApprovalPolicy artifacts. " +
    "This spec does not implement any approval execution, dispatch capability, preview capability, " +
    "or runtime workflow. It exists solely to make the intended reading surface explicit and " +
    "auditable before any gate component is created.",
  status: "read-only-spec-only",
  dispatchable: false,
  note:
    "This spec does not authorize any action. A future PromptApprovalGate component must be " +
    "built separately, must reference this spec, and must not be created until this spec is " +
    "verified in GitHub.",
};

// ── Artifacts a future PromptApprovalGate must read ───────────────────────────
// Defines the exact source artifacts the gate may read from.
// Reading outside this list is not permitted without updating this spec first.

export const readsFromArtifacts = [
  {
    artifact: "src/components/governance/PromptProfileRegistry.jsx",
    exports: ["requiredProfileFields", "governanceConstraints", "approvalStatusVocabulary", "PROMPT_PROFILE_REGISTRY"],
    readPurpose:
      "Provides the canonical profile schema, governance constraints, approval status vocabulary, " +
      "and the versioned profile registry. The gate reads these to verify profile field completeness " +
      "and display profile metadata — it must not write to or mutate the registry.",
    writePermitted: false,
  },
  {
    artifact: "src/components/governance/PromptProfileApprovalPolicy.jsx",
    exports: [
      "policyMeta",
      "approvalStatusVocabulary",
      "approvalTransitions",
      "governanceRoles",
      "approvalRequirements",
      "blockedCapabilitiesBeforeApproval",
      "blockedCapabilitiesAfterApproval",
      "consumingComponentsPlanned",
    ],
    readPurpose:
      "Provides the canonical approval state machine, transition rules, role requirements, and " +
      "capability restrictions. The gate reads these to display policy state and compute derived " +
      "read-only states — it must not execute transitions or mutate policy.",
    writePermitted: false,
  },
];

// ── Registry fields a future PromptApprovalGate may display ───────────────────
// Only fields listed here may be rendered by the future gate component.
// No other profile fields may be surfaced without updating this spec first.

export const displaysRegistryFields = [
  { field: "id", purpose: "Identify the profile under review" },
  { field: "name", purpose: "Display human-readable profile name" },
  { field: "version", purpose: "Display profile version for audit traceability" },
  { field: "targetAudience", purpose: "Display the intended audience of the profile" },
  { field: "intentDescription", purpose: "Display the stated intent of the profile" },
  {
    field: "templateBody",
    purpose:
      "Display the governed prompt template body content — read-only visibility of governed content only; " +
      "operational preview and variable resolution for dispatch remain blocked",
  },
  {
    field: "allowedVariables",
    purpose:
      "Display the governed variable surface permitted in the template body — read-only visibility only; " +
      "variable substitution and dispatch remain blocked",
  },
  { field: "createdBy", purpose: "Display the profile author identity" },
  { field: "createdAt", purpose: "Display when the profile was created" },
  { field: "approvalStatus", purpose: "Display the current approval state from the vocabulary" },
  { field: "approvedBy", purpose: "Display the approver identity when status is 'approved'" },
  { field: "approvedAt", purpose: "Display the approval timestamp when status is 'approved'" },
];

// ── Policy sections a future PromptApprovalGate may display ──────────────────
// Only sections listed here may be rendered by the future gate component.

export const displaysPolicySections = [
  {
    section: "policyMeta",
    purpose: "Display policy version, governed-by reference, and non-dispatchable status note",
  },
  {
    section: "approvalStatusVocabulary",
    purpose: "Display the controlled vocabulary of allowed approval states",
  },
  {
    section: "approvalTransitions",
    purpose:
      "Display the valid state transitions, their required actor, and their conditions " +
      "— read-only; the gate must not execute a transition without a verified runtime component",
  },
  {
    section: "approvalRequirements",
    purpose: "Display the pre-conditions that must be met before a profile may become approved",
  },
  {
    section: "blockedCapabilitiesBeforeApproval",
    purpose: "Display what remains blocked for profiles not yet approved",
  },
  {
    section: "blockedCapabilitiesAfterApproval",
    purpose: "Display what remains blocked even after a profile is approved",
  },
];

// ── Derived read-only states the future gate may compute ─────────────────────
// The gate may derive these states from the artifacts above.
// Derived states are display/classification values only — they must not trigger actions.

export const derivedReadOnlyStates = [
  {
    state: "isApproved",
    derivedFrom: "profile.approvalStatus === 'approved'",
    purpose: "Classify whether a profile has reached the approved state",
    actionPermitted: false,
    note: "isApproved does not mean dispatchable. See blockedInterpretations.",
  },
  {
    state: "isDispatchBlocked",
    derivedFrom:
      "profile.approvalStatus !== 'approved' OR blockedCapabilitiesAfterApproval items not yet resolved",
    purpose: "Classify whether dispatch is blocked for this profile regardless of approval state",
    actionPermitted: false,
    note:
      "This state must always be true until all future governance phases are verified. " +
      "It is a display-only classification.",
  },
  {
    state: "pendingApprovalRequirements",
    derivedFrom:
      "approvalRequirements items that are not yet satisfied for the profile under review",
    purpose: "Surface which pre-conditions are unmet for a pending-review or draft profile",
    actionPermitted: false,
    note: "Display-only. The gate must not programmatically clear these requirements.",
  },
  {
    state: "allowedNextTransitions",
    derivedFrom:
      "approvalTransitions filtered by profile.approvalStatus matching the 'from' field",
    purpose: "Display which transitions are defined for the current approval state",
    actionPermitted: false,
    note:
      "This is a read-only display of defined transitions. The gate must not execute a " +
      "transition — that is the responsibility of a future verified runtime component.",
  },
];

// ── Actions the future gate must never perform ────────────────────────────────

export const blockedActions = [
  "Execute any approval state transition",
  "Write or mutate any field in PromptProfileRegistry",
  "Write or mutate any field in PromptProfileApprovalPolicy",
  "Dispatch a prompt to any target",
  "Trigger preview-for-dispatch for any profile",
  "Resolve templateBody variables for a dispatch target",
  "Associate a profile with a dispatch target",
  "Assign a profile to a rollout stage",
  "Record a dispatch log entry",
  "Grant or revoke governance roles",
];

// ── Interpretations that must remain explicitly blocked ───────────────────────

export const blockedInterpretations = [
  {
    interpretation: "approved === dispatchable",
    blocked: true,
    reason:
      "A profile with approvalStatus === 'approved' is NOT dispatchable. " +
      "Dispatch capability requires additional future governance phases to be built and verified: " +
      "PromptPreviewPanel (Phase 3), PromptDispatchLog (Phase 4), and PromptRolloutPanel (Phase 5). " +
      "Approval is a necessary but not sufficient condition for dispatch.",
  },
  {
    interpretation: "approved === preview-ready",
    blocked: true,
    reason:
      "An approved profile may not be loaded into a preview-for-dispatch workflow until " +
      "PromptPreviewPanel is created and verified (gov-005 Phase 3). No preview component exists.",
  },
  {
    interpretation: "gate spec === gate component",
    blocked: true,
    reason:
      "This spec artifact defines the reading contract only. It is not a runtime component. " +
      "A runtime PromptApprovalGate component must be built separately and must not be treated as " +
      "already existing because this spec exists.",
  },
  {
    interpretation: "spec existence === approval workflow operational",
    blocked: true,
    reason:
      "The existence of this spec does not mean approval workflow execution is available. " +
      "No approval can be triggered, recorded, or enforced by this artifact.",
  },
];

// ── Unresolved dependencies before approval can become operational ─────────────
// These gaps must be resolved and verified before a runtime PromptApprovalGate may be created.

export const unresolvedDependencies = [
  {
    dependency: "PromptApprovalGate.jsx runtime component",
    path: "src/components/admin/PromptApprovalGate.jsx",
    status: "not-created",
    blockedBy: "This spec must be verified in GitHub before the gate component may be created.",
    phase: "gov-005 Phase 2 (runtime component — next step after this spec is verified)",
  },
  {
    dependency: "PromptPreviewPanel.jsx",
    path: "src/components/admin/PromptPreviewPanel.jsx",
    status: "not-created",
    blockedBy: "PromptApprovalGate runtime component must be created and verified first.",
    phase: "gov-005 Phase 3",
  },
  {
    dependency: "PromptDispatchLog.jsx governance artifact",
    path: "src/components/governance/PromptDispatchLog.jsx",
    status: "not-created",
    blockedBy: "PromptPreviewPanel must be created and verified first.",
    phase: "gov-005 Phase 4",
  },
  {
    dependency: "PromptRolloutPanel.jsx",
    path: "src/components/admin/PromptRolloutPanel.jsx",
    status: "not-created",
    blockedBy: "PromptDispatchLog must be created and verified first.",
    phase: "gov-005 Phase 5",
  },
  {
    dependency: "Operator identity context",
    status: "not-created",
    blockedBy:
      "ActiveRepoContext provides GitHub repository identity only. Operator identity and " +
      "governance-approver identity resolution are not available and must be defined before " +
      "the approval gate can enforce the approvedBy !== createdBy rule at runtime.",
    phase: "To be determined — prerequisite for runtime gate verification",
  },
];

// ── What approved still does NOT mean ─────────────────────────────────────────
// Explicit statement of what must remain inoperative even after a profile is approved.

export const futureWritableActionsBlocked = [
  {
    capability: "Dispatch to any target",
    blockedUntil:
      "PromptDispatchLog governance artifact is created and verified (gov-005 Phase 4+). " +
      "No dispatch log exists. Dispatching without an auditable dispatch record violates the " +
      "separation rationale documented in the gov-005 audit. Approval alone does not authorize dispatch.",
  },
  {
    capability: "Preview-before-send workflow",
    blockedUntil:
      "PromptPreviewPanel component is created and verified (gov-005 Phase 3+). " +
      "No preview gate exists. The preview step is a required blocking gate before dispatch. " +
      "Approval does not substitute for a preview acknowledgment.",
  },
  {
    capability: "Rollout stage progression",
    blockedUntil:
      "PromptRolloutPanel component is created and verified (gov-005 Phase 5+). " +
      "Staged rollout policy lives with the future PromptRolloutPanel. Approval grants no rollout rights.",
  },
  {
    capability: "Approval gate UI workflow execution",
    blockedUntil:
      "PromptApprovalGate runtime component is created and verified (gov-005 Phase 2 runtime). " +
      "This spec file defines the reading contract only. It does not implement any workflow execution. " +
      "A runtime approval gate component must be built separately before the approval transition " +
      "can be triggered by a UI actor.",
  },
];

// ── Future component expected to consume this spec ────────────────────────────

export const consumingComponentPlanned = {
  component: "src/components/admin/PromptApprovalGate.jsx",
  phase: "gov-005 Phase 2 (runtime component)",
  usage:
    "Will read from PromptProfileRegistry and PromptProfileApprovalPolicy as defined in " +
    "readsFromArtifacts. Will display fields limited to displaysRegistryFields and " +
    "displaysPolicySections. May compute only the derived read-only states in derivedReadOnlyStates. " +
    "Must enforce all blockedActions and blockedInterpretations. " +
    "Must not be created until this spec is verified in GitHub.",
  mustNotBeCreatedUntil:
    "This PromptApprovalGateSpec artifact is verified in the GitHub repository.",
};

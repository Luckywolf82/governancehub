// PromptProfileApprovalPolicy — governance schema/data artifact
// gov-005 Phase 2 — created 2026-03-16
// Project: GovernanceHub (projectId: governancehub, projectSlug: governancehub)
//
// This file is a pure schema/data artifact.
// It defines the approval path that governs how prompt profiles move through
// approval states. It does not implement approval workflow execution, UI,
// dispatch logic, or backend automation.
//
// Separation of concerns:
//   PromptProfileRegistry.jsx  — profile definition and field schema
//   PromptProfileApprovalPolicy.jsx — approval state rules and governance constraints (this file)
//   Future: PromptApprovalGate.jsx  — runtime approval workflow component (not yet created)
//   Future: dispatch components      — may only be built after governance phases above are verified

// ── Policy metadata ────────────────────────────────────────────────────────────

export const policyMeta = {
  policyId: "prompt-profile-approval-policy",
  version: "1.0.0",
  governedBy: "gov-005",
  projectId: "governancehub",
  projectSlug: "governancehub",
  createdAt: "2026-03-16",
  description:
    "Defines the approval state machine, transition rules, role requirements, and capability " +
    "restrictions that govern how prompt profiles in PromptProfileRegistry move from draft to " +
    "approved — and what remains blocked even after approval until future governance phases " +
    "are completed and verified.",
  status: "governance-policy-only",
  dispatchable: false,
  note:
    "Approved profiles are NOT dispatchable. Dispatch capability is intentionally absent " +
    "until future governance phases (preview gate, dispatch log, rollout policy) are " +
    "separately created and verified per the gov-005 roadmap.",
};

// ── Approval status vocabulary (read-only copy — do not modify independently) ─
// SINGLE SOURCE OF TRUTH: PromptProfileRegistry.approvalStatusVocabulary
// This copy exists only for policy self-containment.
// Any change to this vocabulary MUST be made in PromptProfileRegistry.jsx first,
// then reflected here in the same commit. Independent edits to this copy constitute
// governance drift and are not permitted.

export const approvalStatusVocabulary = [
  "draft",
  "pending-review",
  "approved",
  "deprecated",
];

// ── Allowed approval transitions ───────────────────────────────────────────────
// Defines every valid state move. Any transition not listed here is forbidden.

export const approvalTransitions = [
  {
    from: "draft",
    to: "pending-review",
    label: "Submit for review",
    requiredActor: "profile-author",
    conditions: [
      "All requiredProfileFields must be present and non-empty.",
      "templateBody must not contain unresolved placeholder tokens.",
      "version field must be a valid semver string.",
    ],
  },
  {
    from: "pending-review",
    to: "approved",
    label: "Approve profile",
    requiredActor: "governance-approver",
    conditions: [
      "approvedBy must be a recognized governance-approver identity — not the same identity as createdBy.",
      "approvedAt must be set to the current date at time of approval.",
    ],
  },
  {
    from: "pending-review",
    to: "draft",
    label: "Return for revision",
    requiredActor: "governance-approver",
    conditions: [
      "version field must be incremented before re-submission.",
    ],
  },
  {
    from: "approved",
    to: "deprecated",
    label: "Deprecate profile",
    requiredActor: "governance-approver",
    conditions: [
      "No in-flight dispatch operations may reference this profile at time of deprecation.",
    ],
  },
  {
    from: "draft",
    to: "deprecated",
    label: "Abandon draft",
    requiredActor: "profile-author",
    conditions: [
      "Draft must not have been submitted for review at any point.",
    ],
  },
];

// ── Governance roles ───────────────────────────────────────────────────────────
// Defines who may act at each level of the approval path.
// Role assignment is external to this policy file — this file defines the role vocabulary only.

export const governanceRoles = [
  {
    role: "profile-author",
    description:
      "The operator who created the profile. May submit a draft for review and may abandon a draft. " +
      "May not self-approve.",
  },
  {
    role: "governance-approver",
    description:
      "A designated governance reviewer. Must be a different identity from the profile-author. " +
      "May approve, return for revision, or deprecate profiles. " +
      "Approver identity list is managed externally to this policy.",
  },
  {
    role: "system",
    description:
      "Reserved for automated governance checks (e.g., field validation, hash verification). " +
      "System actors may not approve or reject profiles — only flag validation failures.",
  },
];

// ── Approval requirements ──────────────────────────────────────────────────────
// Conditions that must ALL be true before a profile may transition to 'approved'.
// These are pre-conditions checked before the governance-approver acts.

export const approvalRequirements = [
  "All requiredProfileFields (as defined in PromptProfileRegistry.requiredProfileFields) must be present and non-empty.",
  "version must be a valid semver string and must be greater than any previous version of the same profile id.",
  "templateBody must be free of unresolved placeholder tokens at review time.",
  "approvalStatus must currently be 'pending-review' — direct draft-to-approved transition is forbidden.",
  "approvedBy must differ from createdBy — self-approval is not permitted.",
  "The profile must not duplicate the id of any existing approved profile in the registry.",
  "Any prior 'draft' or 'pending-review' versions of the same profile id must be deprecated or abandoned before a new version is approved.",
];

// ── Blocked capabilities before approval ──────────────────────────────────────
// Actions that are forbidden for any profile with approvalStatus !== 'approved'.

export const blockedCapabilitiesBeforeApproval = [
  "Dispatch — a profile with approvalStatus !== 'approved' must not be used to trigger any dispatch action.",
  "Preview-for-dispatch — a profile may not be loaded into a dispatch preview workflow until it is approved.",
  "Variable resolution for dispatch — resolving templateBody variables for a dispatch target is forbidden before approval.",
  "Target selection — a profile may not be associated with a dispatch target before approval.",
  "Rollout stage assignment — a profile may not be assigned to any rollout stage before approval.",
];

// ── Blocked capabilities after approval ───────────────────────────────────────
// Actions that remain blocked even for profiles with approvalStatus === 'approved'
// until the corresponding future governance phases are built and verified.

export const blockedCapabilitiesAfterApproval = [
  {
    capability: "Dispatch to any target",
    blockedUntil: "PromptDispatchLog governance artifact is created and verified (gov-005 Phase 4+).",
    rationale:
      "No dispatch log exists. Dispatching without an auditable dispatch record violates the separation " +
      "rationale documented in the gov-005 audit. Approval alone does not authorize dispatch.",
  },
  {
    capability: "Preview-before-send workflow",
    blockedUntil: "PromptPreviewPanel component is created and verified (gov-005 Phase 3+).",
    rationale:
      "No preview gate exists. The preview step is a required blocking gate before dispatch. " +
      "Approval does not substitute for a preview acknowledgment.",
  },
  {
    capability: "Rollout stage progression",
    blockedUntil: "PromptRolloutPanel component is created and verified (gov-005 Phase 5+).",
    rationale:
      "Staged rollout policy lives with the future PromptRolloutPanel. Approval grants no rollout rights.",
  },
  {
    capability: "Approval gate UI workflow",
    blockedUntil: "PromptApprovalGate component is created and verified (gov-005 Phase 2+).",
    rationale:
      "This policy file defines the rules. It does not implement any workflow execution. " +
      "A runtime approval gate component must be built separately before the approval transition " +
      "can be triggered by a UI actor.",
  },
];

// ── Consuming components planned ───────────────────────────────────────────────
// Future components that will consume this policy. Listed here to make the
// policy's downstream usage explicit without coupling to any implementation.

export const consumingComponentsPlanned = [
  {
    component: "src/components/admin/PromptApprovalGate.jsx",
    phase: "gov-005 Phase 2",
    usage:
      "Will enforce approvalTransitions and approvalRequirements at the UI layer. " +
      "Must not be created until this policy is verified in GitHub.",
  },
  {
    component: "src/components/admin/PromptPreviewPanel.jsx",
    phase: "gov-005 Phase 3",
    usage:
      "Will use approvedBy and approvalStatus fields from an approved profile before rendering a dispatch preview. " +
      "Must not be created until PromptApprovalGate is verified.",
  },
  {
    component: "src/components/governance/PromptDispatchLog.jsx",
    phase: "gov-005 Phase 4",
    usage:
      "Will record dispatch events that reference an approved profile. " +
      "Must not be created until the preview gate is verified.",
  },
  {
    component: "src/components/admin/PromptRolloutPanel.jsx",
    phase: "gov-005 Phase 5",
    usage:
      "Will enforce staged rollout rules against approved profiles. " +
      "Must not be created until the dispatch log is verified.",
  },
  {
    component: "src/components/admin/DispatchLogPanel.jsx",
    phase: "gov-005 Phase 5+",
    usage:
      "Will render PromptDispatchLog entries in the Admin UI. " +
      "Must not be created until the dispatch log artifact is verified.",
  },
];

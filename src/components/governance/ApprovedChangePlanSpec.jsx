// ApprovedChangePlanSpec — governance schema/data artifact
// gov-006 Phase 1 — created 2026-03-16
// Project: GovernanceHub (projectId: governancehub, projectSlug: governancehub)
//
// This file is a pure schema/data artifact.
// It defines the minimum safe contract for an approved change plan.
// It does NOT implement execution logic, PR creation, dispatch capability,
// prompt preview, state mutation, or any runtime workflow.
//
// Conceptual position:
//   approval → [ApprovedChangePlanSpec] → execution
//
// Separation of concerns:
//   PromptProfileRegistry.jsx          — profile definition and field schema
//   PromptProfileApprovalPolicy.jsx    — approval state rules and governance constraints
//   PromptApprovalGateSpec.jsx         — read-only interpretation contract for a future approval gate
//   ApprovedChangePlanSpec.jsx         — schema-only contract between approval and execution (this file)
//   Future: execution components       — may only be built after this spec is verified

// ── Spec metadata ──────────────────────────────────────────────────────────────

export const specMeta = {
  specId: "approved-change-plan-spec",
  version: "1.0.0",
  governedBy: "gov-006",
  projectId: "governancehub",
  projectSlug: "governancehub",
  createdAt: "2026-03-16",
  description:
    "Defines the minimum safe contract for an approved change plan. " +
    "This spec sits between the approval layer and any future execution layer. " +
    "An approved change plan is not dispatchable, not auto-executable, and not a PR. " +
    "It is the governance artifact that constrains what future execution must obey. " +
    "Repo context is required. Locked files require explicit handling. " +
    "Out-of-scope items must be declared. One plan covers one safe change step only.",
  status: "schema-only",
  dispatchable: false,
  autoExecutable: false,
  note:
    "This spec does not authorize any execution. A future execution component must be " +
    "built separately, must reference this spec, and must not be created until this spec " +
    "is verified in GitHub.",
};

// ── Required plan fields ───────────────────────────────────────────────────────
// Every approved change plan must include all fields listed here.
// A plan missing any required field must be rejected before entering the approval path.

export const requiredPlanFields = [
  "id",
  "title",
  "sourceType",
  "sourceId",
  "repoFullName",
  "goal",
  "changeType",
  "allowedFiles",
  "outOfScope",
  "acceptanceCriteria",
  "verificationTargetType",
  "verificationBranch",
  "approvalStatus",
  "approvedByPolicy",
  "singleStepOnly",
  "requiresPreviewBeforeExecution",
  "requiresPostMergeVerification",
];

// ── Plan field definitions ─────────────────────────────────────────────────────
// Describes the purpose and constraints of each required plan field.

export const planFieldDefinitions = [
  {
    field: "id",
    type: "string",
    description: "Unique identifier for this approved change plan.",
    constraints: ["Must be globally unique within the project.", "Must not be reused across plan revisions."],
  },
  {
    field: "title",
    type: "string",
    description: "Human-readable title describing the intended change.",
    constraints: ["Must clearly reflect the scope of allowedFiles.", "Must not imply a broader scope than the plan permits."],
  },
  {
    field: "sourceType",
    type: "string",
    description:
      "Identifies the origin type of the change request (e.g., 'audit', 'issue', 'governance-task').",
    constraints: ["Must be one of the values defined in allowedChangeTypes[].sourceType."],
  },
  {
    field: "sourceId",
    type: "string",
    description:
      "Identifies the specific source document, audit entry, or issue that generated this plan.",
    constraints: ["Must reference a verifiable source that exists in the repository or issue tracker."],
  },
  {
    field: "repoFullName",
    type: "string",
    description:
      "The full GitHub repository name (e.g., 'Luckywolf82/governancehub'). " +
      "Repo context is required — plans without a repo binding are not valid.",
    constraints: [
      "Must match the format 'owner/repo'.",
      "Must be confirmed against a live repository identity before plan approval.",
    ],
  },
  {
    field: "goal",
    type: "string",
    description:
      "Describes what the change is intended to achieve. Must be scoped to a single, safe, incremental step.",
    constraints: [
      "Must be specific enough to evaluate against acceptanceCriteria.",
      "Must not imply multiple structural changes in a single plan.",
    ],
  },
  {
    field: "changeType",
    type: "string",
    description:
      "The category of change this plan represents. Must be one of the allowedChangeTypes[].type values.",
    constraints: ["Must not be a type absent from the allowedChangeTypes list."],
  },
  {
    field: "allowedFiles",
    type: "string[]",
    description:
      "Exhaustive list of repository file paths that the plan permits to be changed. " +
      "No file outside this list may be modified under this plan.",
    constraints: [
      "Must be a non-empty array.",
      "Locked files may only appear here if lockedFileHandling[].approvedForThisPlan is true.",
      "Files not in this list must be treated as out of scope.",
    ],
  },
  {
    field: "outOfScope",
    type: "string[]",
    description:
      "Explicit list of actions, files, or capabilities that are intentionally excluded from this plan. " +
      "Out-of-scope must be declared — silence does not imply permitted.",
    constraints: [
      "Must include all capabilities listed in outOfScopeRequirements that are not the explicit subject of this plan. " +
      "Because blockedPlanCapabilities lists multiple always-blocked items (e.g., auto-execution, PR creation, dispatch), " +
      "there will always be at least one item to declare — an empty array indicates an incomplete plan.",
      "Must include all capabilities blocked under blockedPlanCapabilities that are not addressed by this plan.",
    ],
  },
  {
    field: "acceptanceCriteria",
    type: "string[]",
    description:
      "Conditions that must all be true for this plan to be considered successfully executed.",
    constraints: [
      "Must be a non-empty array.",
      "Each criterion must be independently verifiable.",
      "Must not include criteria that require actions outside allowedFiles.",
    ],
  },
  {
    field: "verificationTargetType",
    type: "string",
    description:
      "Describes the type of verification target (e.g., 'branch', 'commit', 'pr'). " +
      "The verification target must be representable — vague or open-ended targets are not permitted.",
    constraints: ["Must be one of the values defined in requiredVerificationFields[].verificationTargetType."],
  },
  {
    field: "verificationBranch",
    type: "string",
    description:
      "The specific Git branch against which post-execution verification must be performed.",
    constraints: [
      "Must be a valid Git branch name.",
      "Must be set at plan creation time — not deferred to execution.",
    ],
  },
  {
    field: "approvalStatus",
    type: "string",
    description:
      "The current approval state of this plan. Must be one of the values in planApprovalStatusVocabulary.",
    constraints: [
      "Must be 'approved' for a plan to enter any execution consideration.",
      "'approved' does not mean auto-executable — see blockedPlanCapabilities.",
    ],
  },
  {
    field: "approvedByPolicy",
    type: "string",
    description:
      "The policy ID that governed the approval of this plan (e.g., 'prompt-profile-approval-policy').",
    constraints: [
      "Must reference a real, verifiable governance policy artifact.",
      "Must not be blank for any plan with approvalStatus === 'approved'.",
    ],
  },
  {
    field: "singleStepOnly",
    type: "boolean",
    description:
      "Asserts that this plan covers exactly one safe incremental change step. " +
      "Must always be true. A plan covering multiple structural steps is not permitted.",
    constraints: ["Must be true.", "A plan with singleStepOnly === false must not be approved."],
  },
  {
    field: "requiresPreviewBeforeExecution",
    type: "boolean",
    description:
      "Asserts that a human-visible preview must be reviewed and acknowledged before any " +
      "execution step may proceed. Must always be true.",
    constraints: [
      "Must be true.",
      "A plan with requiresPreviewBeforeExecution === false must not be approved.",
    ],
  },
  {
    field: "requiresPostMergeVerification",
    type: "boolean",
    description:
      "Asserts that post-execution (post-merge) verification is required before the plan " +
      "may be marked complete. Must always be true.",
    constraints: [
      "Must be true.",
      "A plan with requiresPostMergeVerification === false must not be approved.",
    ],
  },
];

// ── Allowed change types ───────────────────────────────────────────────────────
// A plan's changeType must be one of these values.
// Change types not listed here are not permitted under this spec.

export const allowedChangeTypes = [
  {
    type: "schema-artifact-creation",
    description: "Creating a new read-only schema or governance data artifact.",
    examples: ["ApprovedChangePlanSpec.jsx", "PromptProfileRegistry.jsx"],
  },
  {
    type: "governance-data-update",
    description:
      "Updating an existing governance data artifact (e.g., appending a field, updating a version). " +
      "Does not include modifying locked files without explicit audit approval.",
    examples: ["Incrementing version in a registry artifact."],
  },
  {
    type: "execution-log-entry",
    description:
      "Appending a new verified entry to PhaseExecutionLog. " +
      "Locked file — append-only rule applies.",
    examples: ["Adding a completed gov-006 Phase 1 entry to PhaseExecutionLog.jsx."],
  },
  {
    type: "audit-record-addition",
    description:
      "Adding a new audit entry to AUDIT_INDEX. " +
      "Locked file — add-only rule applies. No existing entries may be altered.",
    examples: ["Adding a new audit entry after a governance step is verified."],
  },
  {
    type: "governance-component-creation",
    description:
      "Creating a new governance component that is not a locked file and has no runtime dispatch or execution logic.",
    examples: ["NextSafeStep.jsx", "PromptApprovalGateSpec.jsx"],
  },
];

// ── Blocked plan capabilities ──────────────────────────────────────────────────
// Actions that are forbidden for any approved change plan, regardless of approval state.

export const blockedPlanCapabilities = [
  {
    capability: "Auto-execution",
    blocked: true,
    reason:
      "An approved change plan is not auto-executable. Approval of a plan is not the same as " +
      "authorizing execution. Execution requires a separately created and verified execution component.",
  },
  {
    capability: "PR creation",
    blocked: true,
    reason:
      "This spec does not authorize PR creation. PR creation is a future governance phase " +
      "and must not be triggered by the existence of an approved plan.",
  },
  {
    capability: "Prompt execution",
    blocked: true,
    reason:
      "This spec does not authorize prompt execution. Prompt execution capability requires " +
      "separately verified governance phases (preview gate, dispatch log, rollout policy).",
  },
  {
    capability: "Dispatch to any target",
    blocked: true,
    reason:
      "No dispatch component exists. An approved change plan does not grant dispatch rights. " +
      "Dispatch requires a separately created and verified dispatch governance artifact.",
  },
  {
    capability: "Backend changes",
    blocked: true,
    reason:
      "This spec governs front-end governance schema artifacts only. " +
      "Backend changes require a separate governance path not defined here.",
  },
  {
    capability: "Locked file modification without audit",
    blocked: true,
    reason:
      "Locked files may only appear in allowedFiles if the lockedFileHandling entry for that file " +
      "has approvedForThisPlan === true. Any plan that targets a locked file without this " +
      "explicit approval must be rejected.",
  },
  {
    capability: "Multi-step execution",
    blocked: true,
    reason:
      "singleStepOnly must always be true. A plan that covers multiple structural changes in one " +
      "step violates the one-safe-change-at-a-time governance principle.",
  },
];

// ── Required approval conditions ───────────────────────────────────────────────
// All conditions must be true before a change plan may receive approvalStatus === 'approved'.

export const requiredApprovalConditions = [
  "All requiredPlanFields must be present and non-empty.",
  "changeType must be one of the allowedChangeTypes[].type values.",
  "allowedFiles must be a non-empty array of valid repository paths.",
  "outOfScope must be a non-empty array — silence on excluded scope is not permitted.",
  "acceptanceCriteria must be a non-empty array of independently verifiable conditions.",
  "singleStepOnly must be true — plans covering multiple structural steps must not be approved.",
  "requiresPreviewBeforeExecution must be true — plans without a preview requirement must not be approved.",
  "requiresPostMergeVerification must be true — plans without post-merge verification must not be approved.",
  "repoFullName must be a confirmed, live repository identity in the format 'owner/repo'.",
  "verificationBranch must be a named Git branch set at plan creation time.",
  "verificationTargetType must be one of the values in requiredVerificationFields[].verificationTargetType.",
  "approvedByPolicy must reference a real, verifiable governance policy artifact.",
  "Any locked file in allowedFiles must have a corresponding lockedFileHandling entry with approvedForThisPlan === true.",
  "approvalStatus must have been 'pending-review' before transitioning to 'approved' — direct draft-to-approved is forbidden.",
];

// ── Required verification fields ───────────────────────────────────────────────
// Defines the verification surface that must be representable for any plan.

export const requiredVerificationFields = [
  {
    field: "verificationTargetType",
    allowedValues: ["branch", "commit", "pr"],
    description:
      "The type of the verification target. Must be set at plan creation time. " +
      "Vague or deferred targets are not permitted.",
  },
  {
    field: "verificationBranch",
    description:
      "The specific Git branch against which post-execution verification must be performed. " +
      "Must be a named branch — not a wildcard or deferred value.",
  },
  {
    field: "acceptanceCriteria",
    description:
      "The observable conditions that confirm the plan was executed correctly. " +
      "Each criterion must map to a verifiable repository state.",
  },
  {
    field: "requiresPostMergeVerification",
    description:
      "Confirms that verification does not complete at PR merge — a post-merge verification " +
      "step is required and must be recorded in the execution log.",
  },
];

// ── Repo binding requirements ──────────────────────────────────────────────────
// A plan is not valid without a confirmed repository binding.
// These requirements govern how the repo context must be established.

export const repoBindingRequirements = [
  "repoFullName must be present in every approved change plan.",
  "repoFullName must match the format 'owner/repo'.",
  "repoFullName must be confirmed against a live repository identity before plan approval — assumed values are not valid.",
  "verificationBranch must correspond to a branch that exists (or will exist upon execution) in the bound repository.",
  "allowedFiles must be path-rooted relative to the bound repository — relative paths without a confirmed repo context are not valid.",
  "Plans without a confirmed repo binding must not receive approvalStatus === 'approved'.",
];

// ── Locked file handling ───────────────────────────────────────────────────────
// Rules governing how locked files may (or may not) appear in an approved change plan.

export const lockedFileHandling = {
  policy:
    "Locked files require explicit handling in every plan that includes them. " +
    "A plan that lists a locked file in allowedFiles without a matching entry in this section " +
    "must be rejected before approval.",
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
      rule: "Update only with explicit version bump. Requires audit review before any change.",
      approvedForThisPlan: false,
    },
    {
      file: "src/components/governance/LockedFiles.jsx",
      rule: "Do not weaken locked-file rules silently. Requires audit review before any change.",
      approvedForThisPlan: false,
    },
    {
      file: "src/components/governance/INSTALL_POLICY.jsx",
      rule: "Update only when install policy changes with explicit justification. Requires audit review.",
      approvedForThisPlan: false,
    },
    {
      file: "src/components/governance/STARTER_KIT_VERSION.jsx",
      rule: "Update only with explicit version bump. Requires audit review.",
      approvedForThisPlan: false,
    },
    {
      file: "src/components/governance/PhaseExecutionLog.jsx",
      rule: "Append only. Do not rewrite or delete existing entries.",
      approvedForThisPlan: false,
      note:
        "May appear in allowedFiles for an execution-log-entry changeType plan only, " +
        "provided approvedForThisPlan is explicitly set to true in that plan's locked file entry.",
    },
    {
      file: "src/components/audits/AUDIT_INDEX.jsx",
      rule: "Add entries only. Do not remove or alter existing audit records.",
      approvedForThisPlan: false,
      note:
        "May appear in allowedFiles for an audit-record-addition changeType plan only, " +
        "provided approvedForThisPlan is explicitly set to true in that plan's locked file entry.",
    },
    {
      file: "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx",
      rule: "Update only when audit protocol changes with explicit justification. Requires audit review.",
      approvedForThisPlan: false,
    },
  ],
};

// ── Out-of-scope requirements ──────────────────────────────────────────────────
// Items that must always be explicitly listed in any plan's outOfScope field.
// Silence on these items does not imply permission.

export const outOfScopeRequirements = [
  {
    item: "Execution logic",
    mustBeDeclaredOutOfScope:
      "Any plan that does not explicitly include execution component creation must list " +
      "'Execution logic' in outOfScope.",
  },
  {
    item: "PR creation",
    mustBeDeclaredOutOfScope:
      "PR creation is blocked under blockedPlanCapabilities and must be listed in outOfScope " +
      "for any plan that does not explicitly govern PR creation.",
  },
  {
    item: "Prompt execution",
    mustBeDeclaredOutOfScope:
      "Prompt execution is blocked and must be listed in outOfScope for any plan that does not " +
      "govern prompt execution capability.",
  },
  {
    item: "Dispatch to any target",
    mustBeDeclaredOutOfScope:
      "Dispatch capability is blocked and must be listed in outOfScope for any plan that does " +
      "not govern dispatch.",
  },
  {
    item: "Backend changes",
    mustBeDeclaredOutOfScope:
      "Backend changes are out of scope for schema/governance artifact plans and must be " +
      "explicitly listed.",
  },
  {
    item: "Multi-step execution",
    mustBeDeclaredOutOfScope:
      "singleStepOnly is required. Any plan must explicitly declare multi-step execution " +
      "as out of scope.",
  },
];

// ── Plan approval status vocabulary ───────────────────────────────────────────

export const planApprovalStatusVocabulary = [
  "draft",
  "pending-review",
  "approved",
  "rejected",
  "superseded",
];

// ── Plan approval state transitions ───────────────────────────────────────────
// Defines every valid approval status move. Any transition not listed here is forbidden.
// These transitions mirror the requiredApprovalConditions constraint that a direct
// draft-to-approved transition is not permitted.

export const planApprovalTransitions = [
  {
    from: "draft",
    to: "pending-review",
    label: "Submit plan for review",
    requiredActor: "plan-author",
    conditions: [
      "All requiredPlanFields must be present and non-empty.",
      "changeType must be one of the allowedChangeTypes[].type values.",
      "singleStepOnly must be true.",
      "requiresPreviewBeforeExecution must be true.",
      "requiresPostMergeVerification must be true.",
      "outOfScope must include all applicable blockedPlanCapabilities items.",
    ],
  },
  {
    from: "pending-review",
    to: "approved",
    label: "Approve change plan",
    requiredActor: "governance-approver",
    conditions: [
      "All requiredApprovalConditions must be satisfied.",
      "Reviewer must be a different identity from the plan author.",
      "Any locked file in allowedFiles must have approvedForThisPlan === true in its lockedFileHandling entry.",
    ],
  },
  {
    from: "pending-review",
    to: "draft",
    label: "Return plan for revision",
    requiredActor: "governance-approver",
    conditions: [
      "Plan author must increment the plan id or version before re-submission.",
    ],
  },
  {
    from: "pending-review",
    to: "rejected",
    label: "Reject change plan",
    requiredActor: "governance-approver",
    conditions: [
      "Rejection reason must be documented outside this artifact.",
    ],
  },
  {
    from: "approved",
    to: "superseded",
    label: "Supersede approved plan",
    requiredActor: "governance-approver",
    conditions: [
      "A newer approved plan that covers the same goal must exist before this plan is marked superseded.",
      "No in-flight execution may be referencing this plan at time of supersession.",
    ],
  },
  {
    from: "draft",
    to: "rejected",
    label: "Abandon draft plan",
    requiredActor: "plan-author",
    conditions: [
      "Draft must not have been submitted for review at any point.",
    ],
  },
];

// ── Blocked interpretations ────────────────────────────────────────────────────
// Explicit statements of what this spec must never be interpreted as authorizing.

export const blockedInterpretations = [
  {
    interpretation: "approved === auto-executable",
    blocked: true,
    reason:
      "An approved change plan is NOT auto-executable. Approval of a plan is a necessary but not " +
      "sufficient condition for execution. A separately created and verified execution component " +
      "must exist and must explicitly reference this spec before any execution may occur.",
  },
  {
    interpretation: "approved === PR created",
    blocked: true,
    reason:
      "An approved plan does not create a PR. PR creation is a future governance phase. " +
      "No PR creation logic exists or is authorized by this spec.",
  },
  {
    interpretation: "spec existence === execution available",
    blocked: true,
    reason:
      "The existence of this spec artifact does not mean execution capability is available. " +
      "This spec defines only the schema contract. No execution may be triggered, recorded, " +
      "or enforced by this artifact.",
  },
  {
    interpretation: "allowedFiles === authorized to execute",
    blocked: true,
    reason:
      "allowedFiles defines the scope of what is permitted to change — not authorization to " +
      "execute the change. Execution authorization requires a separately verified execution component.",
  },
  {
    interpretation: "approved plan === dispatchable prompt",
    blocked: true,
    reason:
      "An approved change plan is not a prompt dispatch. Plans govern repository file changes. " +
      "Prompt dispatch is governed by a separate track (PromptProfileApprovalPolicy).",
  },
];

// ── Consuming components planned ───────────────────────────────────────────────
// Future components that will consume this spec. Listed here to make downstream
// usage explicit without coupling to any implementation.

export const consumingComponentsPlanned = [
  {
    component: "src/components/admin/ChangePlanReviewPanel.jsx",
    phase: "gov-006 Phase 2",
    usage:
      "Will render a read-only view of an approved change plan for human review. " +
      "Must read requiredPlanFields, planFieldDefinitions, and blockedInterpretations from this spec. " +
      "Must not execute, dispatch, or mutate any plan field. " +
      "Must not be created until this spec is verified in GitHub.",
  },
  {
    component: "src/components/governance/ChangePlanExecutionLog.jsx",
    phase: "gov-006 Phase 3",
    usage:
      "Will record execution events that reference an approved change plan. " +
      "Must reference this spec's requiredPlanFields as the source of truth for plan identity fields. " +
      "Must not be created until ChangePlanReviewPanel is verified.",
  },
  {
    component: "src/components/admin/ChangePlanExecutionPanel.jsx",
    phase: "gov-006 Phase 4",
    usage:
      "Will implement human-in-the-loop execution steps governed by an approved change plan. " +
      "Must enforce all blockedPlanCapabilities and blockedInterpretations at runtime. " +
      "Must not be created until ChangePlanExecutionLog is verified.",
  },
];

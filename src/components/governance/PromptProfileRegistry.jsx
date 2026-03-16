// PromptProfileRegistry — governance schema/data artifact
// gov-005 Phase 1 — created 2026-03-16
// Project: GovernanceHub (projectId: governancehub, projectSlug: governancehub)
//
// This file is a pure schema/data artifact.
// No UI components, no dispatch logic, no approval workflow implementation.
// Registry must be treated as a governance artifact subject to locked-file policy
// once formally adopted (see governanceConstraints below).

// ── Schema ─────────────────────────────────────────────────────────────────────
// Every entry in the profiles array must include all requiredProfileFields.
// A profile with approvalStatus !== 'approved' must not be used to trigger dispatch.

export const requiredProfileFields = [
  "id",
  "name",
  "version",
  "targetAudience",
  "intentDescription",
  "templateBody",
  "allowedVariables",
  "createdBy",
  "createdAt",
  "approvalStatus",
  "approvedBy",
  "approvedAt",
];

// ── Governance constraints ─────────────────────────────────────────────────────

export const governanceConstraints = [
  "Profiles must be stored in this versioned, auditable registry — not inline in UI components.",
  "Profile content changes must increment the version field.",
  "A profile with approvalStatus !== 'approved' must not be dispatchable.",
  "Profile registry must be treated as a governance artifact subject to locked-file policy once formally adopted.",
];

// ── Approval status vocabulary ─────────────────────────────────────────────────

export const approvalStatusVocabulary = [
  "draft",
  "pending-review",
  "approved",
  "deprecated",
];

// ── Profile registry ───────────────────────────────────────────────────────────
// Empty registry — profiles are added only after passing the approval gate
// defined in gov-005 (PromptApprovalGate — to be created).
// Rollout stage policy lives with the future PromptRolloutPanel (gov-005 Section 6).

export const PROMPT_PROFILE_REGISTRY = {
  meta: {
    registryId: "prompt-profile-registry",
    version: "1.0.0",
    governedBy: "gov-005",
    projectId: "governancehub",
    projectSlug: "governancehub",
    createdAt: "2026-03-16",
    description:
      "Versioned registry of operator prompt profiles for GovernanceHub. " +
      "Each profile defines the intent, target audience, content structure, and governance " +
      "metadata for a class of operator-generated prompts. Profiles allow operators to tailor " +
      "prompt content within pre-approved boundaries without bypassing governance review.",
  },

  profiles: [],
};

// VerificationSpec — governance schema/data artifact
// gov-006 Phase 10 — created 2026-03-17
// Project: GovernanceHub (projectId: governancehub, projectSlug: governancehub)
//
// This file is a pure schema/data artifact.
// It defines the contract that a Verification layer must obey.
// It does NOT implement verification logic, external API calls, GitHub API access,
// PR inspection, commit inspection, registry mutation, background jobs, or any runtime workflow.
//
// Conceptual position:
//   approved plan spec (ApprovedChangePlanSpec)
//     → plan instance contract (ApprovedChangePlanInstanceSpec)
//       → canonical registry (ChangePlanInstanceRegistry)
//         → dispatch authorization (DispatchAuthorizationSpec)
//           → dispatch review (DispatchReviewPanel)
//             → prompt preview (PromptPreviewPanel)
//               → execution worker spec (ExecutionWorkerSpec)
//                 → execution worker (ExecutionWorker)
//                   → [VerificationSpec]  ← this file
//                     → Verification.jsx (consuming component)
//                       → ExecutionLog
//
// Separation of concerns:
//   ApprovedChangePlanSpec.jsx          — schema contract for what an approved plan must look like
//   ApprovedChangePromptSpec.jsx        — schema contract for a prompt generated from a plan
//   ApprovedChangePlanInstanceSpec.jsx  — canonical working plan instance contract
//   ChangePlanInstanceRegistry.jsx      — canonical registry of plan instances
//   DispatchAuthorizationSpec.jsx       — dispatch authorization rules
//   ExecutionWorkerSpec.jsx             — execution worker contract
//   ExecutionWorker.jsx                 — execution worker component (reads this spec)
//   VerificationSpec.jsx                — verification layer contract (this file)
//   Verification.jsx                    — verification UI surface (consuming component)
//
// Governance boundary:
//   This spec formalizes the verification layer as read-only.
//   Verification may only inspect governed local data already present in the project.
//   External verification (GitHub API, PR inspection, commit inspection, network calls)
//   is NOT connected in this phase and must NOT be introduced into this file.
//   Missing evidence must remain missing — it must not be inferred or synthesized.
//   "Reference present" must not be mislabeled as "artifact verified".
//   Verification may return incomplete or unverifiable truthfully.
//   Verification must not bypass dispatch or execution governance.
//   Verification must not mark a task complete unless required evidence is present.
//
// Note on Verification.jsx vocabulary alignment:
//   The current Verification.jsx surface uses "complete" as an internal status string
//   for the case where all required evidence fields are present in governed data.
//   This spec defines the canonical vocabulary term "verified" for that state.
//   The two are semantically equivalent for this phase.
//   A future refactor of Verification.jsx may align the internal status to "verified".
//   Until that refactor is verified, "complete" and "verified" must be treated as
//   equivalent when reading the current Verification.jsx output.
//   This spec does not change Verification.jsx — it formalizes the canonical contract.

// ── Spec metadata ──────────────────────────────────────────────────────────────

export const specMeta = {
  specId: "verification-spec",
  version: "1.0.0",
  governedBy: "gov-006",
  phase: "Phase 10",
  projectId: "governancehub",
  projectSlug: "governancehub",
  createdAt: "2026-03-17",
  description:
    "Defines the contract that the Verification layer must obey. " +
    "This spec sits between the execution worker layer and any downstream execution log. " +
    "It clarifies what upstream governance artifacts the verification layer depends on, what " +
    "preconditions must be true before verification is attempted, what checks the verification " +
    "layer may perform, what status vocabulary must be used, what decision rules apply, what " +
    "output the layer must produce, what capabilities are explicitly blocked, and what " +
    "interpretations must never be made. " +
    "Verification is read-only. It may inspect governed local data only. " +
    "External repository verification is not connected in this phase. " +
    "Missing evidence must remain missing. " +
    "This spec does not execute anything. It only formalizes the contract.",
  status: "schema-only",
  dispatchable: false,
  autoExecutable: false,
  verificationImplemented: false,
  externalVerificationConnected: false,
  note:
    "This spec does not implement verification. The current Verification.jsx component is a " +
    "governance-bound read-only surface that inspects locally available governed data only. " +
    "A fully operational verification runtime that inspects external repository state " +
    "must not be built until this spec is verified in GitHub and ExecutionWorker " +
    "is implemented and verified.",
  verificationLogOutputStatus:
    "The current Verification.jsx surface exposes a buildVerificationLogEntry() helper that " +
    "produces a preview-only structural preview log entry (not append-ready — no write path exists in this phase). This output is NOT persistent, " +
    "NOT committed to PhaseExecutionLog.entries, and NOT written anywhere. No safe write layer " +
    "exists in this phase. The entry is structural scaffolding only.",
  targetRefStatus:
    "targetRef in the current log entry preview uses planId as the id field with " +
    "source: 'planId-placeholder'. This is NOT true planInstanceId binding. It is temporary " +
    "and preparatory only. True planInstanceId binding requires an execution-binding layer " +
    "that does not yet exist and must not be introduced in this phase.",
};

// ── Verification inputs ────────────────────────────────────────────────────────
// Defines the exact upstream governance artifacts that the Verification layer
// must read from. Reading outside this list is not permitted without first updating
// this spec.

export const verificationInputs = [
  {
    artifact: "src/components/governance/ExecutionWorkerSpec.jsx",
    exports: [
      "specMeta",
      "executionWorkerRequiredEvidence",
      "executionWorkerFailureModes",
      "executionOutcomeVocabulary",
      "blockedExecutionCapabilities",
    ],
    readPurpose:
      "Provides the canonical execution worker contract and the required evidence schema. " +
      "The verification layer must use executionWorkerRequiredEvidence as the authoritative " +
      "list of evidence fields to inspect. It must use executionOutcomeVocabulary when " +
      "evaluating the executionOutcome field. It must not infer that execution was successful " +
      "without inspecting all required evidence fields.",
    writePermitted: false,
    referenceIntegrityNote:
      "executionWorkerRequiredEvidence defines what fields must be present in an evidence record. " +
      "The presence of this spec file does not mean an execution runtime exists or has produced evidence.",
  },
  {
    artifact: "src/components/governance/ChangePlanInstanceRegistry.jsx",
    exports: [
      "registryMeta",
      "CHANGE_PLAN_INSTANCE_REGISTRY",
    ],
    readPurpose:
      "Provides the canonical registry of plan instances. " +
      "The verification layer must look up plan instances by planId from " +
      "CHANGE_PLAN_INSTANCE_REGISTRY when evaluating verification state. " +
      "It must not mutate the registry. " +
      "It must not infer the existence of a plan instance from any source other than this registry.",
    writePermitted: false,
  },
  {
    artifact: "src/components/governance/DispatchAuthorizationSpec.jsx",
    exports: [
      "specMeta",
      "dispatchStatusVocabulary",
    ],
    readPurpose:
      "Provides the dispatch authorization spec metadata and status vocabulary. " +
      "The verification layer may use this as a reference to confirm upstream governance " +
      "artifacts are in place. It must not re-evaluate or waive dispatch conditions. " +
      "Dispatch authorization is upstream of the verification layer.",
    writePermitted: false,
  },
];

// ── Verification preconditions ─────────────────────────────────────────────────
// Governance-facing conditions that must all be true before the Verification layer
// may proceed to evaluate verification state. All preconditions must pass.
// Partial satisfaction is not permitted. These are contract rules — not runtime code.

export const verificationPreconditions = [
  {
    preconditionId: "vp-001",
    label: "Plan instance found in registry",
    description:
      "The plan instance being verified must be found in CHANGE_PLAN_INSTANCE_REGISTRY by planId. " +
      "A plan instance that cannot be located by planId in the canonical registry must not be " +
      "evaluated by the verification layer.",
    verifiedBy:
      "Verification layer shall look up the planId in CHANGE_PLAN_INSTANCE_REGISTRY.entries. " +
      "If no matching entry is returned, verification must surface 'unverifiable'.",
    failureAction:
      "Surface verificationStatus 'unverifiable'. Do not fabricate a plan instance. Log reason.",
    referencedSpec: "src/components/governance/ChangePlanInstanceRegistry.jsx",
    referencedExport: "CHANGE_PLAN_INSTANCE_REGISTRY",
  },
  {
    preconditionId: "vp-002",
    label: "ExecutionWorkerSpec available as the required evidence schema",
    description:
      "The verification layer must have access to ExecutionWorkerSpec.executionWorkerRequiredEvidence " +
      "as the authoritative list of evidence fields to inspect. " +
      "If this export is absent or empty, verification must surface 'unverifiable'.",
    verifiedBy:
      "Verification layer shall import executionWorkerRequiredEvidence from ExecutionWorkerSpec " +
      "and confirm the array is non-empty before proceeding.",
    failureAction:
      "Surface verificationStatus 'unverifiable'. Log that the required evidence schema is unavailable.",
    referencedSpec: "src/components/governance/ExecutionWorkerSpec.jsx",
    referencedExport: "executionWorkerRequiredEvidence",
  },
  {
    preconditionId: "vp-003",
    label: "Verification layer is read-only",
    description:
      "The verification layer must not attempt to write to any governed artifact, " +
      "registry, or execution log as a precondition step. Any verification that requires " +
      "a write is out of scope for this phase.",
    verifiedBy:
      "No write operations, registry mutations, or state transitions appear in the " +
      "verification component. This is enforced by this spec and blockedVerificationCapabilities.",
    failureAction:
      "Any attempt to write during verification is a hard governance boundary violation. " +
      "Surface 'failed'. Log the violation.",
    referencedSpec: "src/components/governance/VerificationSpec.jsx",
    referencedExport: "blockedVerificationCapabilities",
  },
  {
    preconditionId: "vp-004",
    label: "No external network call is made during verification",
    description:
      "The verification layer must not make any network call, API request, fetch(), axios call, " +
      "or equivalent during verification. External verification is not connected in this phase.",
    verifiedBy:
      "No fetch(), axios, XMLHttpRequest, or equivalent import or call appears in the " +
      "verification component. This is enforced by blockedVerificationCapabilities.",
    failureAction:
      "Any network call during verification is a hard governance boundary violation. " +
      "Surface 'failed'. Log the violation.",
    referencedSpec: "src/components/governance/VerificationSpec.jsx",
    referencedExport: "blockedVerificationCapabilities",
  },
];

// ── Verification checks ────────────────────────────────────────────────────────
// Specific checks the Verification layer is permitted to perform.
// These are read-only inspections of locally available governed data only.
// No external API calls, no inferred values, no synthetic evidence.

export const verificationChecks = [
  {
    checkId: "vc-001",
    label: "Required evidence field presence check",
    description:
      "For each field in executionWorkerRequiredEvidence, inspect whether the field is " +
      "present (non-null, non-undefined, non-empty string, non-empty array) in the plan " +
      "instance entry from the canonical registry. " +
      "A field that is absent must be reported as missing — not inferred or defaulted.",
    checkType: "field-presence",
    dataSource: "CHANGE_PLAN_INSTANCE_REGISTRY.entries",
    schema: "executionWorkerRequiredEvidence",
    permitsSynthesis: false,
    permitsInference: false,
    permitsNetworkCall: false,
  },
  {
    checkId: "vc-002",
    label: "Required evidence completeness summary",
    description:
      "Aggregate the results of vc-001 across all required evidence fields to produce " +
      "a count of how many required fields are present and how many are missing. " +
      "This summary is the basis for the verificationStatus derivation in verificationDecisionRules.",
    checkType: "aggregation",
    dataSource: "vc-001 results",
    permitsSynthesis: false,
    permitsInference: false,
    permitsNetworkCall: false,
  },
  {
    checkId: "vc-003",
    label: "Registry identity field inspection",
    description:
      "Inspect the plan instance's identity and lifecycle fields that are available from " +
      "the canonical registry: planId, repoFullName, lifecycleStage, executionStatus, " +
      "verificationBranch, verificationTargetType, verificationTargetValue. " +
      "Report each field's value truthfully — null or absent values must be surfaced as null, " +
      "not inferred. This check does not validate these fields against external sources.",
    checkType: "field-inspection",
    dataSource: "CHANGE_PLAN_INSTANCE_REGISTRY.entries",
    permitsExternalValidation: false,
    permitsSynthesis: false,
    permitsNetworkCall: false,
  },
  {
    checkId: "vc-004",
    label: "Execution outcome vocabulary conformance check",
    description:
      "If an executionOutcome field is present in the plan instance entry, inspect whether " +
      "the value conforms to executionOutcomeVocabulary from ExecutionWorkerSpec. " +
      "A value not in the vocabulary must be flagged as non-conformant. " +
      "Absence of the field must be reported as missing — not defaulted.",
    checkType: "vocabulary-conformance",
    dataSource: "CHANGE_PLAN_INSTANCE_REGISTRY.entries",
    vocabularySource: "ExecutionWorkerSpec.executionOutcomeVocabulary",
    permitsSynthesis: false,
    permitsNetworkCall: false,
  },
];

// ── Verification status vocabulary ────────────────────────────────────────────
// Controlled vocabulary for verification status values.
// The verification layer must use exactly these terms when reporting status.
// No new terms may be introduced without updating this spec.
//
// Note: The current Verification.jsx surface uses "complete" where this spec
// defines "verified". These are semantically equivalent in this phase.
// A future Verification.jsx refactor may align to the canonical term "verified".

export const verificationStatusVocabulary = [
  {
    status: "verified",
    label: "Verified",
    description:
      "All required execution evidence fields are present in currently available governed data. " +
      "Note: this status means all required fields are present in local governed data only. " +
      "It does NOT mean external repository state has been independently verified. " +
      "No external verification has been performed in this phase.",
    externalVerificationPerformed: false,
    terminalState: false,
  },
  {
    status: "incomplete",
    label: "Verification Incomplete",
    description:
      "Some required execution evidence fields are present in governed data, but not all. " +
      "At least one required field is present and at least one required field is missing. " +
      "This status is the truthful result when evidence has been partially produced but " +
      "the full evidence set is not available.",
    externalVerificationPerformed: false,
    terminalState: false,
  },
  {
    status: "unverifiable",
    label: "Unverifiable from Current Governed Data",
    description:
      "No required execution evidence fields are present in currently available governed data, " +
      "or the plan instance is not found in the canonical registry. " +
      "This is the correct and truthful result when execution evidence has not been produced " +
      "because external execution is not connected in this phase.",
    externalVerificationPerformed: false,
    terminalState: false,
  },
  {
    status: "failed",
    label: "Verification Failed",
    description:
      "The verification layer encountered a hard governance violation during verification, " +
      "such as a registry mutation attempt, a network call attempt, or a precondition failure " +
      "that cannot be resolved by inspecting locally available governed data. " +
      "This status is distinct from 'unverifiable' — it indicates an active violation.",
    externalVerificationPerformed: false,
    terminalState: false,
  },
  {
    status: "requires_manual_review",
    label: "Requires Manual Review",
    description:
      "The verification layer detected a condition that cannot be resolved by automated " +
      "inspection of locally available governed data alone, and that requires a human reviewer " +
      "to confirm the state. This status must not be used as a fallback to avoid reporting " +
      "'unverifiable'. It must only be used when a specific reviewable condition is identified.",
    externalVerificationPerformed: false,
    terminalState: false,
  },
];

// ── Verification decision rules ────────────────────────────────────────────────
// Rules that define how the Verification layer must derive a verificationStatus
// from the results of verificationChecks.
// These rules are conservative and truthful — they must not upgrade a lower
// status to a higher one without the full set of required evidence being present.

export const verificationDecisionRules = [
  {
    ruleId: "vd-001",
    label: "All required evidence present → verified",
    condition:
      "All fields in executionWorkerRequiredEvidence are present (non-null, non-undefined, " +
      "non-empty) in the plan instance entry from the canonical registry.",
    derivedStatus: "verified",
    note:
      "'verified' from governed data alone does not constitute external repository verification. " +
      "It means all required fields are present in local governed data. " +
      "No external repository, PR, or commit has been independently verified in this phase.",
  },
  {
    ruleId: "vd-002",
    label: "Some required evidence present, some missing → incomplete",
    condition:
      "At least one required field in executionWorkerRequiredEvidence is present and " +
      "at least one required field is absent (null, undefined, or empty) in the plan instance " +
      "entry from the canonical registry.",
    derivedStatus: "incomplete",
    note:
      "Incomplete verification is the truthful result when partial evidence has been " +
      "produced but the full evidence set is not yet available.",
  },
  {
    ruleId: "vd-003",
    label: "No required evidence present → unverifiable",
    condition:
      "No required field in executionWorkerRequiredEvidence is present in the plan instance " +
      "entry from the canonical registry. This includes the case where the plan instance " +
      "is found in the registry but none of the required evidence fields have been populated, " +
      "as well as the case where external execution has not yet been connected.",
    derivedStatus: "unverifiable",
    note:
      "'unverifiable' is the correct and truthful initial state before any execution " +
      "evidence has been produced. It must not be upgraded to 'incomplete' or 'verified' " +
      "without actual evidence being present.",
  },
  {
    ruleId: "vd-004",
    label: "Plan instance not found in registry → unverifiable",
    condition:
      "The planId being verified cannot be located in CHANGE_PLAN_INSTANCE_REGISTRY.entries.",
    derivedStatus: "unverifiable",
    note:
      "A plan instance absent from the canonical registry is unverifiable by definition. " +
      "The absence must not be treated as a soft failure — it is a hard registry gap.",
  },
  {
    ruleId: "vd-005",
    label: "Governance violation detected during verification → failed",
    condition:
      "The verification layer detects an attempted write, registry mutation, network call, " +
      "or any other blocked capability defined in blockedVerificationCapabilities during " +
      "the verification process.",
    derivedStatus: "failed",
    note:
      "'failed' is reserved for active governance violations. It must not be used when " +
      "evidence is simply absent — use 'unverifiable' for absent evidence.",
  },
];

// ── Required verification evidence ────────────────────────────────────────────
// What evidence fields the Verification layer must inspect from each plan instance
// entry. These are derived from ExecutionWorkerSpec.executionWorkerRequiredEvidence
// but stated here as the explicit verification-layer contract.
// The presence or absence of each field must be reported truthfully.

export const requiredVerificationEvidence = [
  {
    evidenceId: "ve-001",
    sourceEvidenceId: "ee-001",
    label: "planId",
    type: "string",
    description:
      "The planId of the plan instance. Must be present and non-empty. " +
      "Must match the planId used to look up the entry in CHANGE_PLAN_INSTANCE_REGISTRY.",
    required: true,
    missingMeaning:
      "Plan instance identity is unresolvable. Verification cannot proceed without planId.",
  },
  {
    evidenceId: "ve-002",
    sourceEvidenceId: "ee-002",
    label: "repoFullName",
    type: "string",
    description:
      "The full repository name (owner/repo) against which execution was performed. " +
      "Must be present and non-empty.",
    required: true,
    missingMeaning:
      "Repository binding is absent. Verification cannot confirm what repository was targeted.",
  },
  {
    evidenceId: "ve-003",
    sourceEvidenceId: "ee-003",
    label: "promptId",
    type: "string",
    description:
      "The promptId of the governed prompt that was used in execution. " +
      "Must be present and non-null.",
    required: true,
    missingMeaning:
      "Prompt linkage is absent. Verification cannot confirm that a governed prompt was used.",
  },
  {
    evidenceId: "ve-004",
    sourceEvidenceId: "ee-004",
    label: "executionTimestamp",
    type: "ISO 8601 datetime string",
    description:
      "The timestamp at which execution was initiated. Must be present and non-empty.",
    required: true,
    missingMeaning:
      "Execution timestamp absent — execution evidence has not been produced. " +
      "External execution is not connected in this phase.",
  },
  {
    evidenceId: "ve-005",
    sourceEvidenceId: "ee-005",
    label: "pullRequestUrl",
    type: "string (URL)",
    description:
      "The URL of the pull request opened as the execution output. Must be present and non-null.",
    required: true,
    missingMeaning:
      "Pull request URL absent — execution has not produced a PR artifact. " +
      "This field being absent does not mean no PR was opened — it means no PR reference " +
      "has been recorded in governed data.",
    referenceIntegrityNote:
      "Presence of this URL records a reference only. It does NOT mean the PR has been " +
      "independently inspected or that its merge status has been verified.",
  },
  {
    evidenceId: "ve-006",
    sourceEvidenceId: "ee-006",
    label: "commitSha",
    type: "string",
    description:
      "The commit SHA that was pushed as part of the governed change. Must be present and non-empty.",
    required: true,
    missingMeaning:
      "Commit SHA absent — no commit reference has been recorded in governed data.",
    referenceIntegrityNote:
      "Presence of this SHA records a reference only. It does NOT mean the commit has been " +
      "independently verified against the repository or confirmed reachable on any branch.",
  },
  {
    evidenceId: "ve-007",
    sourceEvidenceId: "ee-007",
    label: "filesChanged",
    type: "array of strings",
    description:
      "Explicit list of files that were modified, created, or deleted during execution. " +
      "Must be a non-empty array.",
    required: true,
    missingMeaning:
      "Files-changed list absent — no scope evidence has been recorded in governed data.",
  },
  {
    evidenceId: "ve-008",
    sourceEvidenceId: "ee-008",
    label: "executionOutcome",
    type: "string (controlled vocabulary)",
    description:
      "The outcome of the execution attempt. Must use executionOutcomeVocabulary from " +
      "ExecutionWorkerSpec. Must be present and non-empty.",
    required: true,
    missingMeaning:
      "Execution outcome absent — no outcome has been recorded in governed data.",
  },
  {
    evidenceId: "ve-009",
    sourceEvidenceId: "ee-009",
    label: "failureModeId",
    type: "string or null",
    description:
      "The failure mode identifier, if any. Must be present (may be null if no failure occurred).",
    required: true,
    missingMeaning:
      "Failure mode field absent — execution evidence has not been produced.",
  },
  {
    evidenceId: "ve-010",
    sourceEvidenceId: "ee-010",
    label: "failureReason",
    type: "string or null",
    description:
      "Human-readable failure reason, if any. Must be present (may be null if no failure occurred).",
    required: true,
    missingMeaning:
      "Failure reason field absent — execution evidence has not been produced.",
  },
  {
    evidenceId: "ve-011",
    sourceEvidenceId: "ee-011",
    label: "dispatchAuthorizationConfirmed",
    type: "boolean",
    description:
      "Explicit boolean confirming that dispatch authorization was present before execution. " +
      "Must be present and explicitly true for a complete evidence record.",
    required: true,
    missingMeaning:
      "Dispatch authorization confirmation absent — no dispatch authorization evidence recorded.",
  },
  {
    evidenceId: "ve-012",
    sourceEvidenceId: "ee-012",
    label: "verificationHandoffReady",
    type: "boolean",
    description:
      "Boolean indicating whether the evidence record is complete and ready for " +
      "verification layer handoff. Must be present and explicitly true for a complete " +
      "evidence record.",
    required: true,
    missingMeaning:
      "Verification handoff readiness field absent — execution evidence has not been produced.",
  },
];

// ── Blocked verification capabilities ─────────────────────────────────────────
// Capabilities that the Verification layer must never implement or be interpreted
// as providing. A future verification runtime must not introduce any of these
// capabilities.

export const blockedVerificationCapabilities = [
  {
    capability: "fetch() / axios / HTTP calls",
    blocked: true,
    reason:
      "The verification layer must not make backend calls, API requests, or network requests " +
      "of any kind. No fetch(), axios, XMLHttpRequest, WebSocket, or equivalent may appear " +
      "in any verification component. External verification is not connected in this phase.",
  },
  {
    capability: "GitHub API access",
    blocked: true,
    reason:
      "The verification layer must not call the GitHub API directly. GitHub API calls are " +
      "an external verification capability that is not connected in this phase. " +
      "No Octokit, GitHub REST, or GraphQL calls may appear in any verification component.",
  },
  {
    capability: "PR inspection",
    blocked: true,
    reason:
      "The verification layer must not inspect pull request state from GitHub. " +
      "PR inspection is an external verification capability that is not connected in this phase. " +
      "PR URLs recorded in governed data are references only — not inspected artifacts.",
  },
  {
    capability: "Commit inspection",
    blocked: true,
    reason:
      "The verification layer must not inspect commit state from GitHub or any external source. " +
      "Commit SHAs recorded in governed data are references only — not inspected artifacts.",
  },
  {
    capability: "Synthetic evidence generation",
    blocked: true,
    reason:
      "The verification layer must not generate, fabricate, or synthesize evidence values. " +
      "It must not default absent fields to non-null values. It must not infer evidence from " +
      "indirect sources. Missing evidence must remain missing.",
  },
  {
    capability: "Silent fallback",
    blocked: true,
    reason:
      "The verification layer must not silently fall back from a lower verification status " +
      "to a higher one without actual evidence being present. All status derivations must " +
      "be traceable to explicit evidence field inspections. No silent upgrades.",
  },
  {
    capability: "Registry mutation",
    blocked: true,
    reason:
      "The verification layer must not write to CHANGE_PLAN_INSTANCE_REGISTRY or alter " +
      "any plan instance field. All verification operations are read-only. Registry state " +
      "is owned by upstream governance layers.",
  },
  {
    capability: "Execution log fabrication",
    blocked: true,
    reason:
      "The verification layer must not fabricate execution log entries or pre-populate " +
      "execution log fields based on inferred or absent evidence. Execution log entries " +
      "must be produced only when all required evidence is verifiably present.",
  },
  {
    capability: "Completion claims without evidence",
    blocked: true,
    reason:
      "The verification layer must not mark a task, plan instance, or verification cycle " +
      "as complete unless all required evidence defined in requiredVerificationEvidence is " +
      "present. A claim of completion without complete evidence is a governance violation.",
  },
  {
    capability: "Background jobs / async worker flows",
    blocked: true,
    reason:
      "The verification layer must not schedule, queue, or initiate any background job, " +
      "async worker, or deferred verification process. Verification is synchronous and " +
      "read-only from locally available governed data.",
  },
  {
    capability: "React component state mutation affecting governed data",
    blocked: true,
    reason:
      "The verification layer may maintain local UI state for display purposes only. " +
      "It must not write to any governed artifact as a side effect of UI state changes.",
  },
];

// ── Blocked interpretations ────────────────────────────────────────────────────
// Explicit non-equivalences that the verification layer must never assert.
// These guard against the most common governance misinterpretation patterns.

export const blockedInterpretations = [
  {
    interpretationId: "bi-001",
    falseEquivalence: "'Reference present' equals 'artifact verified'",
    explanation:
      "The presence of a URL reference (e.g., pullRequestUrl), a SHA reference (e.g., commitSha), " +
      "or a prompt reference (e.g., promptId) in governed data records that a reference was " +
      "captured. It does NOT mean the referenced artifact has been independently inspected, " +
      "confirmed to exist, or verified against external repository state. " +
      "'Reference present' must always be labeled as a reference — never as independent verification.",
  },
  {
    interpretationId: "bi-002",
    falseEquivalence: "'Verified from governed data' equals 'externally verified'",
    explanation:
      "A verificationStatus of 'verified' (or the current surface equivalent 'complete') means " +
      "all required evidence fields are present in locally available governed data. " +
      "It does NOT mean external repository, PR, or commit state has been independently verified. " +
      "No external verification has been performed in this phase.",
  },
  {
    interpretationId: "bi-003",
    falseEquivalence: "'unverifiable' equals 'failed'",
    explanation:
      "'unverifiable' is the correct and truthful status when execution evidence has not been " +
      "produced because external execution is not yet connected. It is not a failure — it is an " +
      "expected state in this phase. 'failed' is reserved for active governance violations. " +
      "These two statuses must never be conflated.",
  },
  {
    interpretationId: "bi-004",
    falseEquivalence: "'ExecutionWorkerSpec exists' equals 'execution runtime is available'",
    explanation:
      "The presence of ExecutionWorkerSpec.jsx or ExecutionWorker.jsx does not mean that an " +
      "execution runtime is available, running, or has produced evidence for any plan instance. " +
      "The verification layer must not assume any execution has occurred based on spec file existence.",
  },
  {
    interpretationId: "bi-005",
    falseEquivalence: "'VerificationSpec exists' equals 'verification is complete'",
    explanation:
      "The presence of this spec file does not constitute a verification of any plan instance, " +
      "task, or governance pipeline step. This file is a schema/data artifact only. " +
      "No verification has been performed by creating this file.",
  },
  {
    interpretationId: "bi-006",
    falseEquivalence: "'All evidence fields populated' equals 'execution was correct'",
    explanation:
      "Even when all required evidence fields are present in governed data (verificationStatus " +
      "'verified'), this does not mean the execution was performed correctly against the repository. " +
      "It means the evidence record is complete in local governed data. External correctness " +
      "verification requires an external verification runtime that is not connected in this phase.",
  },
];

// ── Verification output contract ───────────────────────────────────────────────
// What the Verification layer must produce after completing its checks.
// These are the outputs that a downstream ExecutionLog layer may consume.

export const verificationOutputContract = [
  {
    outputId: "vo-001",
    field: "planId",
    type: "string",
    description:
      "The planId of the plan instance that was evaluated. " +
      "Must match the planId used to look up the entry in CHANGE_PLAN_INSTANCE_REGISTRY.",
    required: true,
    derivedFrom: "CHANGE_PLAN_INSTANCE_REGISTRY.entries",
  },
  {
    outputId: "vo-002",
    field: "verificationStatus",
    type: "string (verificationStatusVocabulary)",
    description:
      "The derived verification status for this plan instance. " +
      "Must use exactly one value from verificationStatusVocabulary. " +
      "Must be derived using verificationDecisionRules. Must not be inferred or defaulted.",
    required: true,
    derivedFrom: "verificationDecisionRules applied to verificationChecks results",
  },
  {
    outputId: "vo-003",
    field: "evidenceResults",
    type: "array of evidence check result objects",
    description:
      "The full list of evidence check results from vc-001, one per field in " +
      "requiredVerificationEvidence. Each result must carry: evidenceId, label, required, " +
      "present (boolean), value (or null), and reason (string explaining presence or absence).",
    required: true,
    derivedFrom: "verificationChecks vc-001 applied to CHANGE_PLAN_INSTANCE_REGISTRY.entries",
  },
  {
    outputId: "vo-004",
    field: "requiredEvidencePresentCount",
    type: "number",
    description:
      "Count of required evidence fields that are present in governed data for this plan instance.",
    required: true,
    derivedFrom: "evidenceResults filtered to required === true and present === true",
  },
  {
    outputId: "vo-005",
    field: "requiredEvidenceTotalCount",
    type: "number",
    description:
      "Total count of required evidence fields defined in requiredVerificationEvidence.",
    required: true,
    derivedFrom: "requiredVerificationEvidence filtered to required === true",
  },
  {
    outputId: "vo-006",
    field: "externalVerificationPerformed",
    type: "boolean",
    description:
      "Must always be false in this phase. External verification is not connected. " +
      "A future verification runtime that performs external verification must explicitly " +
      "set this field to true only when actual external inspection has been performed.",
    required: true,
    hardcodedValue: false,
    note:
      "This field exists to prevent a future implementation from implicitly claiming " +
      "external verification without making it explicit.",
  },
  {
    outputId: "vo-007",
    field: "verificationTimestamp",
    type: "ISO 8601 datetime string or null",
    description:
      "Timestamp at which the verification evaluation was performed. " +
      "May be null if the verification was a read-only inspection with no timestamp produced.",
    required: false,
    derivedFrom: "Verification runtime (not yet connected in this phase)",
  },
  {
    outputId: "vo-008",
    field: "governanceBoundaryNote",
    type: "string",
    description:
      "A brief human-readable note confirming that this verification was performed against " +
      "locally available governed data only, that external verification is not connected, " +
      "and that any 'reference present' labels in evidenceResults are references only.",
    required: true,
    hardcodedValue:
      "Verification performed against locally available governed data only. " +
      "External verification not connected in this phase. " +
      "Reference-present labels indicate a reference was recorded — not that the artifact was independently verified.",
  },
  {
    outputId: "vo-009",
    field: "targetRef",
    type: "object { type: string, id: string, source: string }",
    description:
      "Target reference identifying the plan instance associated with this verification log entry. " +
      "type must be 'plan_instance'. id is the identifier used to locate the plan instance.",
    required: true,
    derivedFrom: "CHANGE_PLAN_INSTANCE_REGISTRY.entries",
    placeholderBindingNote:
      "CURRENT PLACEHOLDER BINDING: targetRef.id is currently derived from entry.planId. " +
      "source is set to 'planId-placeholder' to make this explicit. " +
      "This is NOT true planInstanceId binding. planId is used as a temporary stand-in only. " +
      "True planInstanceId binding requires an execution-binding layer that does not yet exist " +
      "and must not be introduced in this phase.",
    persistenceNote:
      "The log entry containing this targetRef is preview-only and non-persistent. " +
      "It is NOT committed to PhaseExecutionLog.entries and NOT written anywhere. " +
      "No safe write layer exists in this phase. This field is defined here for structural " +
      "completeness only.",
  },
];

// ── Consuming components ───────────────────────────────────────────────────────
// Components that currently consume or are planned to consume this spec.

export const consumingComponents = [
  {
    component: "src/components/governance/Verification.jsx",
    phase: "gov-006 Phase 10",
    status: "implemented — governance-bound read-only surface",
    usage:
      "Current implementation is a governance-bound verification surface that evaluates " +
      "whether execution evidence is present in currently available governed data. " +
      "It reads from ExecutionWorkerSpec.executionWorkerRequiredEvidence and " +
      "ChangePlanInstanceRegistry. It does not connect external verification. " +
      "Its internal status vocabulary uses 'complete' where this spec defines 'verified'. " +
      "These are semantically equivalent in this phase. A future refactor may align the terms.",
    vocabularyNote:
      "Verification.jsx returns 'complete' | 'incomplete' | 'unverifiable'. " +
      "This spec defines the canonical vocabulary as 'verified' | 'incomplete' | 'unverifiable' | " +
      "'failed' | 'requires_manual_review'. 'complete' and 'verified' are equivalent for this phase.",
    logOutputNote:
      "buildVerificationLogEntry() in Verification.jsx produces a preview-only " +
      "structural log entry (not append-ready — no write path exists in this phase). This output is NOT persistent, NOT committed to " +
      "PhaseExecutionLog.entries, and NOT written anywhere. It is exposed as a console-logged " +
      "structural preview only. No safe write layer exists in this phase.",
    targetRefNote:
      "The targetRef in the current log entry preview uses planId as the id field " +
      "and sets source to 'planId-placeholder'. This is NOT true planInstanceId binding. " +
      "It is temporary and preparatory only. planInstanceId binding requires an " +
      "execution-binding layer that does not yet exist.",
    externalVerificationConnected: false,
  },
  {
    component: "Future: ExecutionLog layer",
    phase: "gov-006 Phase 11 or later",
    status: "not yet created",
    usage:
      "Will consume the verification output produced by the Verification layer to record the " +
      "full audit trail per plan instance. Must read verificationStatus and evidenceResults from " +
      "the verification output contract defined in this spec. Must not be created until the " +
      "Verification layer is implemented and verified in GitHub.",
    mustNotBeCreatedUntil:
      "VerificationSpec is verified in the GitHub repository and Verification.jsx is " +
      "producing output conforming to this spec's verificationOutputContract.",
    externalVerificationConnected: false,
  },
];

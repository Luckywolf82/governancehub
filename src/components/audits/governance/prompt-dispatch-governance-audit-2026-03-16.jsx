// gov-005 — App-Native Prompt Dispatch Governance Audit
// Date: 2026-03-16
// Project: GovernanceHub
// Status: verified
// Evidence source: repo-derived — all filesToRead inspected directly; findings documented below
// This audit defines the governance roadmap for operators generating, tailoring,
// previewing, approving, and dispatching prompts directly from the app while
// preserving full governance traceability. No dispatch implementation is included.

export const PROMPT_DISPATCH_GOVERNANCE_AUDIT = {
  meta: {
    id: "gov-005",
    title: "App-Native Prompt Dispatch Governance",
    category: "Governance",
    type: "Prompt Dispatch Governance Audit",
    status: "verified",
    date: "2026-03-16",
    projectId: "governancehub",
    projectSlug: "governancehub",
    preliminary: false,
    evidenceSource: "repo-derived",
  },

  finding: {
    summary:
      "Planned audit defining a safe phased roadmap for app-native prompt dispatch: " +
      "operators generate, tailor, preview, approve, and dispatch prompts directly from GovernanceHub " +
      "without losing governance traceability. Covers global repo context, prompt profiles, " +
      "preview-before-send workflow, approval gate, a dispatch log distinct from the execution log, " +
      "and staged target rollout. No dispatch implementation is included in this audit.",

    // ── 1. Global repo context ─────────────────────────────────────────────────
    globalRepoContext: {
      description:
        "GovernanceHub is a governance-first multi-project control system. All structural changes " +
        "are gated by locked-file policy, execution log entries, and phase-based audit review. " +
        "Prompt dispatch introduces a new operator action (outbound message generation) that does not " +
        "yet exist in the system — it must be governed with the same traceability discipline as all " +
        "other structural changes.",
      relevantFiles: [
        "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
        "src/components/governance/LockedFiles.jsx",
        "src/components/governance/PhaseExecutionLog.jsx",
        "src/components/audits/AUDIT_INDEX.jsx",
        "src/components/admin/GovernanceOrchestratorPanel.jsx",
        "src/components/admin/AuditRunnerPanel.jsx",
        "src/components/admin/ExecutionLogPanel.jsx",
        "src/pages/Admin.jsx",
      ],
      note:
        "Verified by direct file inspection on 2026-03-16. " +
        "ActiveRepoContext.jsx provides activeRepo (fullName, owner, repo, defaultBranch) and is " +
        "already used across Admin, AuditRunnerPanel, StartPromptGeneratorPanel, and related panels. " +
        "It provides GitHub repository identity only — not operator identity or dispatch scope. " +
        "It is a usable foundation for targeting but not a complete global context for prompt dispatch.",
    },

    // ── 2. Prompt profiles ─────────────────────────────────────────────────────
    promptProfiles: {
      description:
        "A prompt profile is a named, versioned template that defines the intent, target audience, " +
        "content structure, and governance metadata for a class of operator-generated prompts. " +
        "Profiles allow operators to tailor prompt content within pre-approved boundaries without " +
        "bypassing governance review.",
      requiredProfileFields: [
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
      ],
      governanceConstraints: [
        "Profiles must be stored in a versioned, auditable registry (not inline in UI components).",
        "Profile content changes must increment the version field.",
        "A profile with approvalStatus !== 'approved' must not be dispatchable.",
        "Profile registry must be treated as a governance artifact subject to locked-file policy " +
          "once it is formally adopted.",
      ],
      plannedLocation: "src/components/governance/PromptProfileRegistry.jsx (to be created)",
    },

    // ── 3. Preview-before-send workflow ───────────────────────────────────────
    previewBeforeSend: {
      description:
        "Before any prompt is dispatched, the operator must see a rendered preview of the exact " +
        "message that would be sent, including resolved variable substitutions and target metadata. " +
        "The preview step must be a blocking gate — dispatch cannot proceed until the operator " +
        "explicitly acknowledges the preview.",
      workflowSteps: [
        {
          step: 1,
          label: "Select prompt profile",
          actor: "operator",
          outcome: "Profile loaded from PromptProfileRegistry with approvalStatus validated",
        },
        {
          step: 2,
          label: "Fill allowed variables",
          actor: "operator",
          outcome: "Variable values captured and validated against allowedVariables schema",
        },
        {
          step: 3,
          label: "Render preview",
          actor: "system",
          outcome: "Resolved prompt body displayed to operator — no dispatch triggered at this step",
        },
        {
          step: 4,
          label: "Operator acknowledges preview",
          actor: "operator",
          outcome: "Explicit acknowledgment recorded; system proceeds to approval gate",
        },
      ],
      plannedComponent: "src/components/admin/PromptPreviewPanel.jsx (to be created)",
      constraints:
        "Preview must render the exact resolved body — no placeholders. " +
        "Dispatch button must be disabled until preview acknowledgment is recorded.",
    },

    // ── 4. Approval gate ──────────────────────────────────────────────────────
    approvalGate: {
      description:
        "Every prompt dispatch must pass through a multi-field approval gate before transmission. " +
        "The gate records who requested the dispatch, who approved it, and when — creating an " +
        "immutable pre-dispatch record separate from the dispatch log.",
      requiredApprovalFields: [
        "requestedBy",
        "requestedAt",
        "approvedBy",
        "approvedAt",
        "approvalMethod",
        "promptProfileId",
        "promptProfileVersion",
        "resolvedBodyHash",
        "targetIdentifier",
        "approvalNotes",
      ],
      approvalMethods: ["operator-self-approve", "second-operator-approve", "governance-review"],
      defaultMethod: "operator-self-approve",
      escalationTriggers: [
        "Target count > 1 (broadcast dispatch requires second-operator-approve or higher)",
        "Profile has not been used in the last 30 days",
        "Profile approvalStatus was set more than 90 days ago",
      ],
      plannedComponent: "src/components/admin/PromptApprovalGate.jsx (to be created)",
      constraints:
        "Approval gate must not be skippable. resolvedBodyHash must be computed at preview time " +
        "and re-verified at dispatch time to prevent tampering between approval and send.",
    },

    // ── 5. Dispatch log (distinct from execution log) ─────────────────────────
    dispatchLog: {
      description:
        "The dispatch log records every prompt dispatch attempt and outcome. It is intentionally " +
        "separate from PhaseExecutionLog, which records structural governance changes to the repository. " +
        "Conflating prompt dispatch events with repository execution log entries would pollute the " +
        "canonical governance log with operational runtime events.",
      requiredDispatchLogFields: [
        "id",
        "dispatchedAt",
        "promptProfileId",
        "promptProfileVersion",
        "resolvedBodyHash",
        "targetIdentifier",
        "targetType",
        "dispatchMethod",
        "requestedBy",
        "approvedBy",
        "approvalRecordId",
        "dispatchStatus",
        "dispatchResponse",
        "errorMessage",
      ],
      dispatchStatusVocabulary: [
        "pending",
        "approved",
        "dispatched",
        "delivered",
        "failed",
        "cancelled",
      ],
      separationRationale: [
        "PhaseExecutionLog records governance-layer changes (file edits, schema changes, audit registration). " +
          "Prompt dispatch is an operational runtime event — it must not contaminate the governance log.",
        "The dispatch log will grow at a different rate than the execution log. " +
          "Keeping them separate prevents the governance log from becoming unwieldy.",
        "Dispatch log entries may contain PII-adjacent data (target identifiers, message content hashes) " +
          "that should not co-reside with governance provenance records.",
        "Separate logs allow independent audit trails: governance audits inspect PhaseExecutionLog; " +
          "dispatch audits inspect PromptDispatchLog.",
      ],
      plannedLocation: "src/components/governance/PromptDispatchLog.jsx (to be created)",
      plannedComponent: "src/components/admin/DispatchLogPanel.jsx (to be created)",
    },

    // ── 6. Staged target rollout ──────────────────────────────────────────────
    stagedRollout: {
      description:
        "Prompt dispatch must support staged rollout to limit blast radius. " +
        "Operators define rollout stages (e.g., internal, pilot, full) and progress through them " +
        "with explicit approval at each stage boundary. Dispatch to a new stage requires re-running " +
        "the preview and approval workflow.",
      stages: [
        {
          stage: 1,
          label: "internal",
          description: "Dispatch to internal operator accounts only (self-test)",
          maxTargetCount: 5,
          approvalRequired: "operator-self-approve",
        },
        {
          stage: 2,
          label: "pilot",
          description: "Dispatch to a named pilot group (defined in profile)",
          maxTargetCount: 50,
          approvalRequired: "second-operator-approve",
        },
        {
          stage: 3,
          label: "full",
          description: "Dispatch to all eligible targets",
          maxTargetCount: null,
          approvalRequired: "governance-review",
        },
      ],
      governanceConstraints: [
        "Stage progression must be sequential — no skipping from internal to full.",
        "Each stage transition must create a new dispatch log entry and a new approval record.",
        "Stage is a field on the prompt profile, not an ad-hoc selection at dispatch time.",
        "Full-stage dispatch must be preceded by a verified pilot-stage dispatch log entry.",
      ],
      plannedComponent: "src/components/admin/PromptRolloutPanel.jsx (to be created)",
    },

    // ── Files read (verified — all files below inspected directly on 2026-03-16) ─
    filesToRead: [
      "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
      "src/components/governance/LockedFiles.jsx",
      "src/components/governance/PhaseExecutionLog.jsx",
      "src/components/audits/AUDIT_INDEX.jsx",
      "src/components/admin/GovernanceOrchestratorPanel.jsx",
      "src/components/admin/AuditRunnerPanel.jsx",
      "src/components/admin/ExecutionLogPanel.jsx",
      "src/pages/Admin.jsx",
    ],

    // ── Verified findings (repo-derived, 2026-03-16) ───────────────────────────
    verifiedFindings: {
      // Objective 1: Partial prompt-dispatch architecture in Admin system
      partialDispatchArchitecture: {
        exists: false,
        detail:
          "Admin.jsx has four tabs: Govern, Setup, Build Prep, Strategy. No tab or panel handles " +
          "prompt dispatch to a target. GovernanceOrchestratorPanel and orchestratorEngine.jsx use " +
          "the term 'dispatch' exclusively to mean GitHub issue dispatch or Copilot task dispatch — " +
          "this is structurally unrelated to prompt-to-target dispatch. No PromptPreviewPanel, " +
          "PromptApprovalGate, PromptRolloutPanel, or DispatchLogPanel exists anywhere in the repository.",
      },

      // Objective 2: Global repo context
      globalRepoContext: {
        exists: "partial",
        detail:
          "ActiveRepoContext.jsx provides activeRepo (fullName, owner, repo, defaultBranch) and is " +
          "already used across Admin, AuditRunnerPanel, StartPromptGeneratorPanel, and related panels. " +
          "This provides GitHub repository identity only — not operator identity, governance scope, or " +
          "dispatch targeting metadata. It is a usable foundation but not a complete dispatch context.",
        gap:
          "Operator identity, target audience metadata, and dispatch scope are not provided by " +
          "ActiveRepoContext. These remain gaps for the dispatch workflow.",
      },

      // Objective 3: Prompt profile logic
      promptProfileLogic: {
        exists: false,
        detail:
          "No PromptProfileRegistry, no profile schema, no profile selection UI, and no profile " +
          "approval workflow exists anywhere in the repository. StartPromptGeneratorPanel.jsx has a " +
          "buildPrompt() function that generates templated AI coding instructions — this is a build " +
          "prompt generator, not a governed operator-facing prompt profile. It has no versioning, " +
          "no approvalStatus, no allowedVariables, and no governance metadata.",
      },

      // Objective 4: Preview-before-send pattern
      previewBeforeSendPattern: {
        exists: false,
        analogFound:
          "StartPromptGeneratorPanel.jsx generates prompt text and displays it before the user copies " +
          "it. This is a display-then-copy pattern, not a governed preview gate. There is no " +
          "acknowledgment step, no dispatch action, no approval gate, and no dispatch record. " +
          "The CopyBtn in GovernanceOrchestratorPanel.jsx is a minor UI utility reusable in future UI.",
        reusable: "CopyBtn (GovernanceOrchestratorPanel.jsx) — minor UI copy utility only.",
      },

      // Objective 5: Dispatch logging mixed with execution logging
      dispatchLoggingMixedWithExecutionLog: {
        exists: false,
        detail:
          "PhaseExecutionLog.jsx contains 7 entries (Entries 1–7), all recording governance-layer " +
          "changes (file edits, schema changes, audit registration). None represent prompt dispatch " +
          "events. ExecutionLogPanel.jsx renders these entries with GitHub verification links. " +
          "The separation between dispatch history and execution/verification history is NOT currently " +
          "violated — no dispatch mechanism exists, therefore no dispatch log exists yet. " +
          "The contamination risk identified in dispatchLog.separationRationale is a future concern, " +
          "not a current defect. Kept cleanly separated.",
      },

      // Objective 6: Minimum safe first artifact
      minimumSafeFirstArtifact: {
        artifact: "src/components/governance/PromptProfileRegistry.jsx",
        isCorrect: true,
        justification:
          "No prerequisite architectural gap was found that would block registry creation. " +
          "ActiveRepoContext already exists and is functional. No partial implementation needs " +
          "cleanup. The registry is a pure data/schema artifact — no UI component, no dispatch " +
          "logic. No other dispatch workflow component can be built without a profile schema to " +
          "reference. A prerequisite could only be argued if a blocking structural problem existed " +
          "in the Admin system — none was found.",
        blockers: "None. Safe to create as the next separate step after this audit is verified.",
      },
    },

    // ── Gaps confirmed ─────────────────────────────────────────────────────────
    gapsConfirmed: [
      "No PromptProfileRegistry or profile schema exists.",
      "No preview-before-send governance gate exists (StartPromptGeneratorPanel is not equivalent).",
      "No prompt approval gate exists.",
      "No PromptDispatchLog exists — dispatch log is entirely absent.",
      "No DispatchLogPanel exists.",
      "No PromptPreviewPanel exists.",
      "No PromptApprovalGate component exists.",
      "No PromptRolloutPanel exists.",
      "Global repo context (ActiveRepoContext) exists for repository identity only — operator " +
        "identity and dispatch scope metadata remain gaps.",
    ],

    problem:
      "GovernanceHub has no app-native prompt dispatch capability. Operators currently have no " +
      "in-app path to generate, tailor, preview, approve, or dispatch prompts while maintaining " +
      "governance traceability. Implementing dispatch without a phased governance roadmap risks " +
      "bypassing the approval and audit trail requirements that govern all other structural actions " +
      "in the system.",

    impact:
      "Without a governed dispatch mechanism, prompt generation will either be blocked entirely " +
      "(no capability) or proceed outside the governance layer (no traceability). Either outcome " +
      "represents a governance gap. A planned audit with a staged roadmap provides the framework " +
      "needed to implement dispatch incrementally without sacrificing traceability.",

    affectedFiles: [
      "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
      "src/components/governance/LockedFiles.jsx",
      "src/components/governance/PhaseExecutionLog.jsx",
      "src/components/audits/AUDIT_INDEX.jsx",
    ],

    requiredChange:
      "Execute this audit: inspect all filesToRead to verify that no partial prompt dispatch " +
      "implementation already exists. Then implement Phase 1 only: create PromptProfileRegistry.jsx " +
      "with the schema and governance constraints defined in this audit. Do not implement preview, " +
      "approval, dispatch, or rollout components until the profile registry is verified in GitHub.",

    constraints:
      "This is a planned audit — no dispatch implementation may proceed until the audit is executed " +
      "and status is changed to 'verified'. Profile registry creation is the only action permitted " +
      "in Phase 1. Locked governance files must not be modified during audit execution. " +
      "One structural change at a time. Each phase transition requires a new PhaseExecutionLog entry.",

    acceptanceCriteria:
      "Audit executed by direct file inspection of all filesToRead. " +
      "PromptProfileRegistry.jsx created with all requiredProfileFields defined. " +
      "No dispatchable prompt can be created without a profile with approvalStatus === 'approved'. " +
      "Dispatch log is implemented separately from PhaseExecutionLog. " +
      "Preview step is a blocking gate before dispatch. " +
      "Staged rollout enforces sequential stage progression with per-stage approval.",

    oneSafeNextStep:
      "Create src/components/governance/PromptProfileRegistry.jsx with all requiredProfileFields " +
      "defined in this audit. This is a pure schema/data artifact — no UI component, no dispatch " +
      "logic. Do not add preview, approval, dispatch, or rollout components in this step.",

    filesChangedInNextStep: [
      "src/components/governance/PromptProfileRegistry.jsx (net-new — create only)",
      "src/components/governance/PhaseExecutionLog.jsx (append entry after creation)",
    ],
  },
};

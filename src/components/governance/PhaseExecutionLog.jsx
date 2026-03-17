export const PHASE_EXECUTION_LOG = {
  // Entry field schema — informational, not enforced at runtime.
  // Documents all recognized optional fields so future entries and consumers
  // know what the log supports without inspecting individual entries.
  entrySchema: {
    required: [
      'id',
      'date',
      'task',
      'taskRequested',
      'changedFiles',
      'diffSummary',
      'githubVisibility',
      'lockedFileVerification',
      // Defines the type of log entry.
      // Used to distinguish execution events from verification results.
      'entryType',
    ],
    optional: [
      // Structured GitHub verification target fields
      'verificationTargetType',
      'verificationTargetValue',
      'verificationBranch',
      'githubVerificationUrl',
      // Verification fields — output by buildVerificationLogEntry() in Verification.jsx.
      // Current output is preview-only structural scaffolding only. NOT persistent. NOT committed to
      // PHASE_EXECUTION_LOG.entries. NOT written anywhere in this phase.
      // No safe write layer exists. No append is authorized in this phase.
      'verificationStatus',
      'missingEvidence',
      'verificationNotes',
      // targetRef — included in verification entry previews.
      // Current runtime uses: { type: "plan_instance", id: planId, source: "planId-placeholder" }.
      // This is NOT true planInstanceId binding. True binding requires an execution-binding
      // layer that does not yet exist and must not be introduced in this phase.
      'targetRef',
    ],
    entryTypes: [
      'execution',
      'verification',
    ],
  },
  entries: [
    {
      id: 'Entry 1',
      date: 'YYYY-MM-DD',
      task: 'Bootstrap governance and admin framework',
      taskRequested: 'Not recorded at time of entry. Inferred from task title.',
      changedFiles: [
        'src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx',
        'src/pages/AdminDashboard.jsx'
      ],
      diffSummary: 'Initial project scaffolding',
      githubVisibility: 'Not yet verified',
      lockedFileVerification: 'Pending',
    },
    {
      id: 'Entry 2',
      date: '2026-03-14',
      task: 'Governance Source-of-Truth Alignment',
      taskRequested: 'Align locked file registry and governance state after baseline governance audit.',
      changedFiles: [
        'src/components/governance/LockedFiles.jsx',
        'src/components/governance/AI_STATE.jsx',
        'src/components/governance/NextSafeStep.jsx',
      ],
      diffSummary: [
        'Locked file registry expanded to match governance policy (added PhaseExecutionLog, AUDIT_INDEX, AUDIT_SYSTEM_GUIDE)',
        'Governance system state initialized for GovernanceHub (projectName, phase, status, lastVerified)',
        'Next safe step updated after baseline audit completion',
      ],
      githubVisibility: 'Files exist in repository — verified via live repo index',
      lockedFileVerification: 'Locked files not modified directly. LockedFiles.jsx extended through allowed registry update only.',
    },
    {
      id: 'Entry 3',
      date: '2026-03-15',
      task: 'Normalize locked-file definitions across governance files',
      taskRequested: 'Not recorded at time of entry. Inferred from task title.',
      changedFiles: [
        'src/components/governance/LockedFiles.jsx',
        'src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx',
        '.github/COPILOT_REVIEW_CHECKLIST.md',
        '.github/copilot-instructions.md',
      ],
      diffSummary: [
        'LockedFiles.jsx: removed INSTALL_POLICY.jsx and STARTER_KIT_VERSION.jsx (starter-kit-only, not present in main repo)',
        'AI_PROJECT_INSTRUCTIONS.jsx: added AI_PROJECT_INSTRUCTIONS.jsx and LockedFiles.jsx to LOCKED FILES section',
        '.github/COPILOT_REVIEW_CHECKLIST.md: added AI_PROJECT_INSTRUCTIONS.jsx and LockedFiles.jsx to locked files list',
        '.github/copilot-instructions.md: added LockedFiles.jsx to high-sensitivity files list',
      ],
      githubVisibility: 'verified — changes visible in GitHub on branch copilot/normalize-locked-file-definitions',
      verificationTargetType: 'pull_request',
      verificationTargetValue: 'copilot/normalize-locked-file-definitions',
      verificationBranch: 'main',
      githubVerificationUrl: 'https://github.com/Luckywolf82/governancehub/pulls?q=head%3Acopilot%2Fnormalize-locked-file-definitions',
      lockedFileVerification: 'AI_PROJECT_INSTRUCTIONS.jsx and LockedFiles.jsx modified as explicitly required by this normalization task.',
    },
    {
      id: 'Entry 4',
      date: '2026-03-15',
      task: 'Execution Log Schema Consistency Audit',
      taskRequested: 'Audit execution log schema consistency across PhaseExecutionLog.jsx, AI_PROJECT_INSTRUCTIONS.jsx, and INSTALL_POLICY.jsx. Identify field drift and report findings.',
      changedFiles: [
        'src/components/audits/governance/execution-log-schema-audit-2026-03-15.jsx',
        'src/components/audits/AUDIT_INDEX.jsx',
        'src/components/governance/PhaseExecutionLog.jsx',
      ],
      diffSummary: [
        'Created governance audit file: execution-log-schema-audit-2026-03-15.jsx — documents schema drift findings for gov-003',
        'AUDIT_INDEX.jsx: added gov-003 entry (Execution Log Schema Consistency, verified)',
        'PhaseExecutionLog.jsx: appended Entry 4 for this audit execution',
      ],
      githubVisibility: 'Not yet verified',
      verificationTargetType: 'pull_request',
      verificationTargetValue: '23',
      verificationBranch: 'main',
      githubVerificationUrl: 'https://github.com/Luckywolf82/governancehub/pull/23',
      lockedFileVerification: 'AUDIT_INDEX.jsx modified to register new audit entry per audit system rules. PhaseExecutionLog.jsx appended with this entry. No other locked files modified.',
    },
    {
      id: 'Entry 5',
      date: '2026-03-15',
      task: 'Complete gov-003 audit with required output fields',
      taskRequested: 'Audit the relationship between runtime execution log schema and install-policy logging schema. Determine whether INSTALL_POLICY.loggingRules.schema should exactly match, be a subschema of, or extend the canonical runtime execution log schema. Produce a complete audit with Options Considered and Recommended Model fields.',
      changedFiles: [
        'src/components/audits/governance/execution-log-schema-audit-2026-03-15.jsx',
        'src/components/audits/AUDIT_INDEX.jsx',
        'src/components/governance/PhaseExecutionLog.jsx',
      ],
      diffSummary: [
        'execution-log-schema-audit-2026-03-15.jsx: added overlappingFields, intentionalDivergenceAnalysis, optionsConsidered, and recommendedModel fields to complete the required audit output format',
        'AUDIT_INDEX.jsx: updated gov-003 header comment and summary to reflect recommended model (Option 3 — canonical extension)',
        'PhaseExecutionLog.jsx: appended Entry 5 for this audit completion',
      ],
      githubVisibility: 'Not yet verified',
      verificationTargetType: 'pull_request',
      verificationTargetValue: '25',
      verificationBranch: 'main',
      githubVerificationUrl: 'https://github.com/Luckywolf82/governancehub/pull/25',
      lockedFileVerification: 'AUDIT_INDEX.jsx and PhaseExecutionLog.jsx modified as explicitly required by audit output rules. execution-log-schema-audit-2026-03-15.jsx updated with required output fields. No other locked files modified.',
    },
    {
      id: 'Entry 6',
      date: '2026-03-15',
      task: 'Align INSTALL_POLICY logging schema with canonical execution log schema (gov-003 remediation)',
      taskRequested: 'Implement gov-003 audit recommendation: treat INSTALL_POLICY.loggingRules.schema as an extension of the canonical runtime execution log schema.',
      changedFiles: [
        'src/components/governance/INSTALL_POLICY.jsx',
        'src/components/governance/PhaseExecutionLog.jsx',
      ],
      diffSummary: [
        'INSTALL_POLICY.jsx loggingRules.schema: added all eight canonical required fields (id, date, task, taskRequested, changedFiles, diffSummary, githubVisibility, lockedFileVerification). Previously missing canonical fields "task" and "changedFiles" are now explicitly present.',
        'INSTALL_POLICY.jsx loggingRules.schema: preserved install-specific extension fields (filesCreated, filesModified, commitRef). Added inline comments documenting that filesCreated + filesModified are an install-context granular decomposition of changedFiles, and that commitRef is optional and only used when an actual commit SHA is known.',
        'PhaseExecutionLog.jsx: appended Entry 6 for this gov-003 remediation execution.',
      ],
      githubVisibility: 'Not yet verified',
      verificationTargetType: 'pull_request',
      verificationTargetValue: '26',
      verificationBranch: 'main',
      githubVerificationUrl: 'https://github.com/Luckywolf82/governancehub/pull/26',
      lockedFileVerification: 'INSTALL_POLICY.jsx modified intentionally as the explicit target of this gov-003 remediation task. PhaseExecutionLog.jsx appended with this entry per governance logging rules. No other locked files modified.',
    },
    {
      id: 'Entry 7',
      date: '2026-03-15',
      task: 'Governance alignment: update locked files to use WORKSTREAM_REGISTRY symbol',
      taskRequested: 'Complete the post-rename governance alignment after PROJECT_REGISTRY → WORKSTREAM_REGISTRY component-layer rename. Update AI_PROJECT_INSTRUCTIONS canonicalSources and governanceFiles, fix starter-kit INSTALL_POLICY prose, bump AI_PROJECT_INSTRUCTIONS to v2.1.',
      changedFiles: [
        'src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx',
        'starter-kit/src/components/governance/INSTALL_POLICY.jsx',
        'src/components/governance/PhaseExecutionLog.jsx',
      ],
      diffSummary: [
        'AI_PROJECT_INSTRUCTIONS.jsx: renamed "PROJECT_REGISTRY" to "WORKSTREAM_REGISTRY" in canonicalSources and governanceFiles arrays. Bumped version from v2.0 to v2.1. Added v2.1 entry to versionHistory.',
        'starter-kit/src/components/governance/INSTALL_POLICY.jsx: updated overwriteRules.lockedFiles prose to say WORKSTREAM_REGISTRY instead of PROJECT_REGISTRY — aligns starter-kit with canonical src version.',
        'PhaseExecutionLog.jsx: appended Entry 7 for this governance-alignment step.',
      ],
      githubVisibility: 'Not yet verified',
      verificationTargetType: 'pull_request',
      verificationTargetValue: '27',
      verificationBranch: 'main',
      githubVerificationUrl: 'https://github.com/Luckywolf82/governancehub/pull/27',
      lockedFileVerification: 'AI_PROJECT_INSTRUCTIONS.jsx modified intentionally for post-rename symbol alignment (version bumped to v2.1 per locked-file update rule). starter-kit INSTALL_POLICY.jsx updated to match canonical src version. PhaseExecutionLog.jsx appended with this entry. src/projects/PROJECT_REGISTRY.js confirmed untouched.',
    },
    {
      id: 'Entry 8',
      date: '2026-03-16',
      task: 'Execute gov-005 — App-Native Prompt Dispatch Governance Audit',
      taskRequested: 'Execute the planned gov-005 audit by directly inspecting all listed files, documenting verified findings, and updating audit status from planned to verified. Do not implement prompt dispatch or create PromptProfileRegistry.jsx in this step.',
      changedFiles: [
        'src/components/audits/governance/prompt-dispatch-governance-audit-2026-03-16.jsx',
        'src/components/audits/AUDIT_INDEX.jsx',
        'src/components/governance/PhaseExecutionLog.jsx',
      ],
      diffSummary: [
        'prompt-dispatch-governance-audit-2026-03-16.jsx: status changed from planned to verified; preliminary changed to false; evidenceSource changed to repo-derived. Added verifiedFindings section documenting all six audit objectives with repo-derived results. Updated globalRepoContext note with ActiveRepoContext inspection findings. Added gapsConfirmed list. Updated oneSafeNextStep and added filesChangedInNextStep.',
        'AUDIT_INDEX.jsx: gov-005 entry updated — status verified, preliminary false, evidenceSource repo-derived; summary updated with verified findings summary; oneSafeNextStep updated to reflect PromptProfileRegistry.jsx creation; header comment updated.',
        'PhaseExecutionLog.jsx: appended Entry 8 for this audit execution.',
      ],
      githubVisibility: 'Not yet verified',
      verificationTargetType: 'pull_request',
      verificationTargetValue: '50',
      verificationBranch: 'main',
      githubVerificationUrl: 'https://github.com/Luckywolf82/governancehub/pull/50',
      lockedFileVerification: 'AUDIT_INDEX.jsx modified to update gov-005 status per verified audit execution (standard pattern, consistent with gov-002, gov-003, gov-004). PhaseExecutionLog.jsx appended with this entry per governance logging rules. No other locked files modified. prompt-dispatch-governance-audit-2026-03-16.jsx is not a locked file.',
    },
    {
      id: 'Entry 9',
      date: '2026-03-16',
      task: 'gov-005 Phase 1 — Create PromptProfileRegistry.jsx (schema/data artifact)',
      taskRequested: 'Implement the next safe step after verified gov-005. Create src/components/governance/PromptProfileRegistry.jsx as a schema/data-only artifact. Define prompt profiles and requiredProfileFields. Include governance constraints and allowed targets. No UI components, no dispatch/send logic, no approval workflow implementation, no backend changes.',
      changedFiles: [
        'src/components/governance/PromptProfileRegistry.jsx',
        'src/components/governance/PhaseExecutionLog.jsx',
      ],
      diffSummary: [
        'PromptProfileRegistry.jsx (net-new): exports requiredProfileFields array (12 fields), governanceConstraints array (4 constraints), approvalStatusVocabulary array, and PROMPT_PROFILE_REGISTRY object (meta + empty profiles array). Schema-only — no populated draft profiles, no rollout policy (allowedTargets belongs with future PromptRolloutPanel per gov-005 Section 6), no UI components, no dispatch logic.',
        'PhaseExecutionLog.jsx: appended Entry 9 for this gov-005 Phase 1 execution.',
      ],
      githubVisibility: 'Not yet verified',
      verificationTargetType: 'pull_request',
      verificationTargetValue: '51',
      verificationBranch: 'main',
      githubVerificationUrl: 'https://github.com/Luckywolf82/governancehub/pull/51',
      lockedFileVerification: 'PhaseExecutionLog.jsx appended with this entry per governance logging rules. PromptProfileRegistry.jsx is a net-new file — not a locked file at creation time. No other locked files modified.',
    },
    {
      id: 'Entry 10',
      date: '2026-03-16',
      task: 'gov-005 Phase 2 — Create PromptProfileApprovalPolicy.jsx (approval-governance artifact)',
      taskRequested: 'Implement the first approval-governance step after PromptProfileRegistry. Create src/components/governance/PromptProfileApprovalPolicy.jsx as a pure schema/data artifact defining the approval path for prompt profiles. Define allowed approval transitions, governance roles, approval requirements, blocked capabilities before and after approval, and planned consuming components. No UI components, no approval workflow runtime logic, no dispatch logic, no preview/send capability, no backend automation.',
      changedFiles: [
        'src/components/governance/PromptProfileApprovalPolicy.jsx',
        'src/components/governance/PhaseExecutionLog.jsx',
      ],
      diffSummary: [
        'PromptProfileApprovalPolicy.jsx (net-new): exports policyMeta, approvalStatusVocabulary (mirrors registry), approvalTransitions (5 allowed state transitions with requiredActor and conditions), governanceRoles (profile-author, governance-approver, system), approvalRequirements (7 pre-conditions for the approved transition), blockedCapabilitiesBeforeApproval (5 dispatch/preview/target capabilities blocked until approved), blockedCapabilitiesAfterApproval (4 capabilities blocked even after approval until future governance phases are verified), and consumingComponentsPlanned (5 future components with phase and usage notes). Schema-only — no runtime logic, no UI, no dispatch coupling.',
        'PhaseExecutionLog.jsx: appended Entry 10 for this gov-005 Phase 2 execution.',
      ],
      githubVisibility: 'Not yet verified',
      verificationTargetType: 'pull_request',
      verificationTargetValue: '52',
      verificationBranch: 'main',
      githubVerificationUrl: 'https://github.com/Luckywolf82/governancehub/pull/52',
      lockedFileVerification: 'PhaseExecutionLog.jsx appended with this entry per governance logging rules. PromptProfileApprovalPolicy.jsx is a net-new file — not a locked file at creation time. No other locked files modified.',
    },
    {
      id: 'Entry 11',
      date: '2026-03-16',
      task: 'gov-005 Phase 2 — Targeted policy-governance check on PromptProfileApprovalPolicy.jsx',
      taskRequested: 'Pre-merge policy-governance check: verify approvalStatusVocabulary source-of-truth, confirm approvalTransitions and approvalRequirements are minimum safe only, confirm blockedCapabilitiesAfterApproval is strictly non-dispatchable, confirm file remains a pure policy artifact.',
      changedFiles: [
        'src/components/governance/PromptProfileApprovalPolicy.jsx',
        'src/components/governance/PhaseExecutionLog.jsx',
      ],
      diffSummary: [
        'PromptProfileApprovalPolicy.jsx: strengthened approvalStatusVocabulary section comment — replaced soft prose reminder with explicit "SINGLE SOURCE OF TRUTH: PromptProfileRegistry.approvalStatusVocabulary" heading and prohibition on independent edits.',
        'PromptProfileApprovalPolicy.jsx: removed one over-scoped condition from pending-review→approved transition: "No open amendment requests may be outstanding against this profile." The concept of amendment requests is undefined in any Phase 2 governance artifact and implies a workflow-tracking object that does not exist. Remaining three conditions are the minimum safe governance rules for this transition.',
        'PhaseExecutionLog.jsx: appended Entry 11 for this pre-merge check execution.',
      ],
      githubVisibility: 'Not yet verified',
      verificationTargetType: 'pull_request',
      verificationTargetValue: '52',
      verificationBranch: 'main',
      githubVerificationUrl: 'https://github.com/Luckywolf82/governancehub/pull/52',
      lockedFileVerification: 'PhaseExecutionLog.jsx appended with this entry per governance logging rules. PromptProfileApprovalPolicy.jsx modified to remove over-scoped condition and strengthen vocabulary source-of-truth comment — it is not a locked file. No other locked files modified.',
    },
    {
      id: 'Entry 12',
      date: '2026-03-16',
      task: 'Targeted governance cleanup — align PromptProfileApprovalPolicy with PromptProfileRegistry schema',
      taskRequested: 'Remove policy references to fields and workflow concepts not defined in PromptProfileRegistry.requiredProfileFields. Ensure approval policy references only defined schema fields.',
      changedFiles: [
        'src/components/governance/PromptProfileApprovalPolicy.jsx',
        'src/components/governance/PhaseExecutionLog.jsx',
      ],
      diffSummary: [
        'PromptProfileApprovalPolicy.jsx: removed policy condition referencing "reviewNote" — field is not defined in PromptProfileRegistry.requiredProfileFields.',
        'PromptProfileApprovalPolicy.jsx: removed policy condition referencing "deprecationReason" — field is not defined in PromptProfileRegistry.requiredProfileFields.',
        'PromptProfileApprovalPolicy.jsx: removed policy condition referencing "deprecatedAt" — field is not defined in PromptProfileRegistry.requiredProfileFields.',
        'PromptProfileApprovalPolicy.jsx: removed "review cycle" condition — workflow concept not defined in any current governance artifact.',
        'PhaseExecutionLog.jsx: appended Entry 12 for this schema/policy alignment cleanup.',
      ],
      githubVisibility: 'Not yet verified',
      verificationTargetType: 'pull_request',
      verificationTargetValue: '53',
      verificationBranch: 'main',
      githubVerificationUrl: 'https://github.com/Luckywolf82/governancehub/pull/53',
      lockedFileVerification: 'PhaseExecutionLog.jsx appended per governance logging rules. No other locked files modified.',
    },
    {
      id: 'Entry 13',
      date: '2026-03-16',
      task: 'gov-005 Phase 2 (bridge) — Create PromptApprovalGateSpec.jsx (read-only approval-gate interpretation contract)',
      taskRequested: 'Implement PromptApprovalGateSpec.jsx as the first read-only approval-gate bridge. Create a minimum safe governance artifact that defines how a future PromptApprovalGate must interpret existing prompt governance artifacts without becoming operational. Schema/data only — no imports, no functions, no mutable state, no JSX component export, no approval execution logic, no dispatch logic, no state transitions.',
      changedFiles: [
        'src/components/governance/PromptApprovalGateSpec.jsx',
        'src/components/governance/PhaseExecutionLog.jsx',
      ],
      diffSummary: [
        'PromptApprovalGateSpec.jsx (net-new): exports specMeta, readsFromArtifacts (2 source artifacts with writePermitted: false), displaysRegistryFields (10 fields the future gate may display), displaysPolicySections (6 policy sections the future gate may render), derivedReadOnlyStates (4 read-only computed states with actionPermitted: false), blockedActions (10 explicit prohibitions), blockedInterpretations (4 explicit non-equivalences including approved !== dispatchable), unresolvedDependencies (5 unresolved gaps before approval can become operational), futureWritableActionsBlocked (4 capabilities blocked even after approval), and consumingComponentPlanned (PromptApprovalGate.jsx — not yet created). Schema-only — no runtime logic, no UI, no dispatch coupling, no imports.',
        'PhaseExecutionLog.jsx: appended Entry 13 for this gov-005 Phase 2 bridge step.',
      ],
      githubVisibility: 'Not yet verified',
      verificationTargetType: 'pull_request',
      verificationTargetValue: '55',
      verificationBranch: 'main',
      githubVerificationUrl: 'https://github.com/Luckywolf82/governancehub/pull/55',
      lockedFileVerification: 'PhaseExecutionLog.jsx appended with this entry per governance logging rules. PromptApprovalGateSpec.jsx is a net-new file — not a locked file at creation time. PromptProfileRegistry.jsx and PromptProfileApprovalPolicy.jsx not modified. No other locked files modified.',
    },
    {
      id: 'Entry 14',
      date: '2026-03-16',
      task: 'gov-004 implementation — ExecutionLogPanel and NextSafeStep lifecycle update',
      taskRequested: 'Implement gov-004 acceptance criteria: ExecutionLogPanel.jsx renders PhaseExecutionLog entries with lifecycle status badges and GitHub verification links; Admin Govern tab includes ExecutionLogPanel; NextSafeStep reflects current lifecycle state.',
      changedFiles: [
        'src/components/admin/ExecutionLogPanel.jsx',
        'src/pages/Admin.jsx',
        'src/components/governance/NextSafeStep.jsx',
        'src/components/governance/PhaseExecutionLog.jsx',
      ],
      diffSummary: [
        'ExecutionLogPanel.jsx (net-new): renders PHASE_EXECUTION_LOG.entries in reverse-chronological order. Derives lifecycle status from githubVisibility free-text using deriveVisibilityStatus(). Flags unverified entries with amber VisibilityBadge and amber background. Provides "Verify on GitHub" link for each unverified entry pointing to repository commits. Header shows counts: total, verified, not-yet-verified.',
        'Admin.jsx: imports ExecutionLogPanel from @/components/admin/ExecutionLogPanel. Renders <ExecutionLogPanel /> in the Govern tab after GovernanceOrchestratorPanel, completing the audit → orchestrate → verify operator workflow.',
        'NextSafeStep.jsx: updated title to post-merge verification for gov-004 implementation. Added lifecycleStage field (implementation_complete_pending_verification). Reflects current state where ExecutionLogPanel is implemented and unverified entries await GitHub confirmation.',
        'PhaseExecutionLog.jsx: appended Entry 14 for this gov-004 implementation execution.',
      ],
      githubVisibility: 'Not yet verified',
      verificationTargetType: 'pull_request',
      verificationTargetValue: '65',
      verificationBranch: 'main',
      githubVerificationUrl: 'https://github.com/Luckywolf82/governancehub/pull/65',
      lockedFileVerification: 'PhaseExecutionLog.jsx appended with this entry per governance logging rules. NextSafeStep.jsx updated as explicitly required by gov-004 acceptance criteria. Admin.jsx and ExecutionLogPanel.jsx modified as the direct implementation targets. AUDIT_INDEX.jsx already registered gov-004 as verified in a prior step — not re-modified here.',
    },
    {
      id: 'Entry 15',
      date: '2026-03-16',
      task: 'Replace manual post-merge verification with automatic GitHub verification',
      taskRequested: 'The app should no longer depend on manual GitHub verification for execution-log entries. Implement automatic post-merge verification by checking GitHub targets directly. Introduce canonical structured verification model, create verifyExecutionLogEntry Deno function, update ExecutionLogPanel to use structured verification state as source of truth.',
      changedFiles: [
        'functions/verifyExecutionLogEntry.ts',
        'src/components/admin/ExecutionLogPanel.jsx',
        'src/components/governance/PhaseExecutionLog.jsx',
      ],
      diffSummary: [
        'verifyExecutionLogEntry.ts (net-new): Deno function that queries GitHub API to determine actual verification state. Supports pull_request (verified if merged) and commit (verified if reachable on main). Returns verificationStatus, verifiedAt, and verificationEvidence. Unsupported types return "unknown".',
        'ExecutionLogPanel.jsx: replaced free-text githubVisibility as the verification source of truth. Added liveResults state populated by auto-verification on mount via verifyExecutionLogEntry. resolveVerificationStatus() uses live GitHub result first, falls back to legacy text-parsing for backward compatibility. Entry badges, summary counts, and pending banner all derive from resolveVerificationStatus(). "Verify on GitHub" downgraded to secondary "Inspect on GitHub" link always visible.',
        'PhaseExecutionLog.jsx: added verificationTargetType, verificationTargetValue, verificationBranch, githubVerificationUrl fields to Entry 3 (PR branch copilot/normalize-locked-file-definitions). Appended Entry 15 for this change with its own structured verification target.',
      ],
      githubVisibility: 'Not yet verified',
      verificationTargetType: 'pull_request',
      verificationTargetValue: 'copilot/replace-manual-verification',
      verificationBranch: 'main',
      githubVerificationUrl: 'https://github.com/Luckywolf82/governancehub/pulls?q=head%3Acopilot%2Freplace-manual-verification',
      lockedFileVerification: 'PhaseExecutionLog.jsx appended per governance logging rules. ExecutionLogPanel.jsx modified as the explicit implementation target. No other locked files modified.',
    },
    {
      id: 'Entry 16',
      date: '2026-03-16',
      task: 'arch-001 step 1 — Confirm src/components/AdminDashboard.jsx absent',
      taskRequested: 'Implement arch-001 required change: Remove src/components/AdminDashboard.jsx (duplicate of src/pages/AdminDashboard.jsx, not registered in router). Append PhaseExecutionLog entry after verified change per arch-001 constraints.',
      changedFiles: [
        'src/components/governance/PhaseExecutionLog.jsx',
        'src/components/audits/AUDIT_INDEX.jsx',
      ],
      diffSummary: [
        'src/components/AdminDashboard.jsx: confirmed absent from repository. File was removed in PR #32 (merged to main). Acceptance criteria for arch-001 step 1 met — file is absent from GitHub with no new broken imports introduced.',
        'AUDIT_INDEX.jsx: arch-001 oneSafeNextStep updated from stale removal instruction to the next structural step: authoring verified content at src/components/audits/product/product-intelligence-audit-2026-03-12.jsx (addresses prod-001 orphaned audit). prod-001 and prod-002 entries already document the misplaced-file follow-ups.',
        'PhaseExecutionLog.jsx: appended Entry 16 for this arch-001 step 1 verification.',
      ],
      githubVisibility: 'Not yet verified',
      verificationTargetType: 'pull_request',
      verificationTargetValue: 'copilot/fix-file-placement-issues',
      verificationBranch: 'main',
      githubVerificationUrl: 'https://github.com/Luckywolf82/governancehub/pulls?q=head%3Acopilot%2Ffix-file-placement-issues',
      lockedFileVerification: 'PhaseExecutionLog.jsx appended per governance logging rules. AUDIT_INDEX.jsx arch-001 oneSafeNextStep updated to reflect step 1 completion and identify next structural step. No other locked files modified.',
    },
    {
      id: 'Entry 17',
      date: '2026-03-17',
      task: 'gov-006 Phase 10 — Create VerificationSpec.jsx (governance schema/data artifact)',
      taskRequested: 'Formalize the verification layer as a schema/spec-only artifact that sits between ExecutionWorker/ExecutionWorkerSpec and Verification.jsx. Must not implement external verification, GitHub API calls, or fabricate repo verification. Must keep verification truthful and governance-bound. Define: specMeta, verificationInputs, verificationPreconditions, verificationChecks, verificationStatusVocabulary, verificationDecisionRules, requiredVerificationEvidence, blockedVerificationCapabilities, blockedInterpretations, verificationOutputContract, consumingComponents.',
      changedFiles: [
        'src/components/governance/VerificationSpec.jsx',
        'src/components/governance/PhaseExecutionLog.jsx',
      ],
      diffSummary: [
        'VerificationSpec.jsx (net-new): pure schema/data artifact. Exports: specMeta (phase 10, schema-only, externalVerificationConnected: false), verificationInputs (3 upstream artifacts: ExecutionWorkerSpec, ChangePlanInstanceRegistry, DispatchAuthorizationSpec — all writePermitted: false), verificationPreconditions (4 preconditions: plan instance found in registry, required evidence schema available, read-only enforcement, no network calls), verificationChecks (4 checks: field presence, completeness summary, registry identity inspection, vocabulary conformance — all permitsNetworkCall: false), verificationStatusVocabulary (5 terms: verified, incomplete, unverifiable, failed, requires_manual_review — all externalVerificationPerformed: false), verificationDecisionRules (5 rules mapping evidence presence to status, including governance-violation → failed), requiredVerificationEvidence (12 evidence fields derived from ExecutionWorkerSpec ee-001 through ee-012, each with missingMeaning), blockedVerificationCapabilities (11 explicit blocks: fetch/axios, GitHub API, PR inspection, commit inspection, synthetic evidence, silent fallback, registry mutation, execution log fabrication, completion claims without evidence, background jobs, component state mutation affecting governed data), blockedInterpretations (6 explicit non-equivalences: reference-present vs. artifact-verified, governed-data-verified vs. externally-verified, unverifiable vs. failed, spec-exists vs. runtime-available, VerificationSpec-exists vs. verification-complete, all-evidence-present vs. execution-was-correct), verificationOutputContract (8 output fields: planId, verificationStatus, evidenceResults, requiredEvidencePresentCount, requiredEvidenceTotalCount, externalVerificationPerformed hardcoded false, verificationTimestamp, governanceBoundaryNote), consumingComponents (2: current Verification.jsx with vocabulary alignment note, future ExecutionLog layer).',
        'PhaseExecutionLog.jsx: appended Entry 17 for this gov-006 Phase 10 VerificationSpec creation.',
      ],
      githubVisibility: 'Not yet verified',
      verificationTargetType: 'pull_request',
      verificationTargetValue: 'copilot/add-verification-spec-file',
      verificationBranch: 'main',
      githubVerificationUrl: 'https://github.com/Luckywolf82/governancehub/pulls?q=head%3Acopilot%2Fadd-verification-spec-file',
      lockedFileVerification: 'PhaseExecutionLog.jsx appended with this entry per governance logging rules. VerificationSpec.jsx is a net-new file — not a locked file at creation time. Verification.jsx not modified — vocabulary alignment is noted in VerificationSpec but intentionally left as a future refactor. No other locked files modified.',
    },
  ],

  // Defines how new entries are added to the execution log.
  // This ensures append-only governance and prevents mutation of historical records.
  writeStrategy: {
    mode: "append-only",
    note: "Verification entries are currently preview-only output from buildVerificationLogEntry(). " +
          "They are NOT committed to PHASE_EXECUTION_LOG.entries and NOT written anywhere. " +
          "No safe write layer exists. No write is authorized in this phase. " +
          "The rules below are for future reference only — they do not authorize any write now.",

    rules: [
      {
        id: "ws-001",
        rule: "Verification results must create a new log entry, not overwrite existing entries",
        note: "Applies only if and when a safe write path is introduced in a future phase. Currently, verification output is preview-only and not committed.",
      },
      {
        id: "ws-002",
        rule: "Each verification entry must include a targetRef",
        note: "Current preview output uses planId as targetRef.id with source: 'planId-placeholder'. This is NOT true planInstanceId binding. True binding requires an execution-binding layer that does not yet exist.",
      },
      {
        id: "ws-003",
        rule: "Verification entries may reference previous execution entries but must not mutate them",
      },
      {
        id: "ws-004",
        rule: "Duplicate verification entries are allowed but must be timestamped",
      },
      {
        id: "ws-005",
        rule: "Verification entries must not be considered authoritative without required evidence",
      }
    ]
  },
};
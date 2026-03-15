// gov-004 — App-Native Audit Lifecycle Completion Audit
// Date: 2026-03-15
// Project: GovernanceHub
// Status: verified
// Focus: post-merge verification
// Evidence source: repo-derived — direct file inspection of all listed files

export const APP_NATIVE_AUDIT_LIFECYCLE_AUDIT = {
  id: "gov-004",
  title: "App-Native Audit Lifecycle Completion",
  category: "Governance",
  type: "Lifecycle Gap Audit",
  status: "verified",
  date: "2026-03-15",
  projectId: "governancehub",
  projectSlug: "governancehub",
  preliminary: false,
  evidenceSource: "repo-derived",

  // ── A. Files read ──────────────────────────────────────────────────────────
  filesRead: [
    "src/components/governance/PhaseExecutionLog.jsx",
    "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
    "src/components/governance/NextSafeStep.jsx",
    "src/components/admin/AuditRunnerPanel.jsx",
    "src/components/admin/GovernanceOrchestratorPanel.jsx",
    "src/components/admin/RepoVerificationPanel.jsx",
    "src/components/admin/RepoRawAccessPanel.jsx",
    "src/components/admin/orchestratorEngine.jsx",
    "src/pages/Admin.jsx",
    "src/components/audits/AUDIT_INDEX.jsx",
  ],

  // ── B. What already exists ─────────────────────────────────────────────────
  whatAlreadyExists: [
    "AuditRunnerPanel.jsx — automated checks against repo-derived and manual evidence. Produces structured audit objects with status badges.",
    "GovernanceOrchestratorPanel.jsx — receives audit objects (via injection or AUDIT_INDEX), computes readiness, generates Copilot task, issue prep, and execution log draft.",
    "orchestratorEngine.jsx — pure-function domain logic: getReadiness(), buildRecommendedStep(), buildIssuePrep(), buildExecutionLogDraft().",
    "RepoVerificationPanel.jsx — static ChatGPT repo index panel (copy raw URLs for ChatGPT context). Not tied to execution log entries.",
    "PhaseExecutionLog.jsx — canonical execution log with 7 entries. Required fields: id, date, task, taskRequested, changedFiles, diffSummary, githubVisibility, lockedFileVerification.",
    "NextSafeStep.jsx — exports NEXT_SAFE_STEP with fields: title, reason, scope, blockedBy.",
    "Admin.jsx — 'Govern' tab wires AuditRunnerPanel → GovernanceOrchestratorPanel via injectedAudit prop.",
    "AUDIT_INDEX.jsx — canonical audit registry with 7 entries (arch-001, prod-001, prod-002, gov-001, gov-002, gov-003, perf-001). Status vocabulary: verified / orphaned / planned.",
  ],

  // ── C. What is missing ─────────────────────────────────────────────────────
  whatIsMissing: [
    "ExecutionLogPanel.jsx — no in-app panel exists to display PhaseExecutionLog entries or their lifecycle status.",
    "Lifecycle status model — PhaseExecutionLog entries have no 'lifecycleStatus' field. The closest field is 'githubVisibility', which is a free-text string (e.g., 'Not yet verified', 'verified — changes visible in GitHub'). There is no enum for: drafted / implemented / merged / verified.",
    "'Verify after merge' action — no UI button or workflow step exists to mark a specific execution-log entry as post-merge verified. Verification is currently manual and external (paste URL into ChatGPT).",
    "Execution log in Admin 'Govern' tab — the operator workflow (audit → orchestrate → issue → verify) has no last step surfaced in the UI.",
    "RepoVerificationPanel not tied to execution log — it is a static ChatGPT context panel, not a post-merge verification action linked to a specific PhaseExecutionLog entry.",
    "NextSafeStep lifecycle model — NEXT_SAFE_STEP has no field to indicate current lifecycle stage (e.g., audit_complete / implementation_pending / merged / verified).",
  ],

  // ── D. Lifecycle gaps in current governance model ──────────────────────────
  lifecycleGaps: [
    {
      gap: "No in-app execution log view",
      detail: "PhaseExecutionLog data exists as a static JS export but is never rendered in any admin panel. Operators have no way to see the log from within GovernanceHub.",
    },
    {
      gap: "githubVisibility is unstructured",
      detail: "The githubVisibility field on each entry is a free-text string. It does not enforce a controlled vocabulary. Some entries say 'Not yet verified', some say 'verified — changes visible in GitHub on branch ...', and some say 'Files exist in repository — verified via live repo index'. No code can reliably parse or filter on this field.",
    },
    {
      gap: "No lifecycle status progression",
      detail: "There is no model for an entry progressing through: drafted → implemented → merged → verified. Entries are created when a change is made but never updated when the change is confirmed merged and verified in GitHub.",
    },
    {
      gap: "Post-merge verification is external only",
      detail: "The current verification workflow requires the operator to open ChatGPT, paste raw file URLs, and confirm manually. There is no in-app 'verify after merge' step that links a PhaseExecutionLog entry to its GitHub state.",
    },
    {
      gap: "Govern tab operator workflow is incomplete",
      detail: "Admin.jsx Govern tab shows: audit → orchestrate. It does not show: view execution log → verify after merge. The last two lifecycle stages are invisible in the UI.",
    },
    {
      gap: "NextSafeStep does not reflect lifecycle state",
      detail: "NEXT_SAFE_STEP.title is 'Governance Source-of-Truth Alignment' — stale relative to completed work. There is no field to indicate whether the system is in a post-implementation, pre-verification state.",
    },
  ],

  // ── E. Risk if audits become app-native before verification exists ──────────
  riskIfNativeBeforeVerification: [
    "Audits created and driven from the app will generate PhaseExecutionLog entries with githubVisibility = 'Not yet verified'. Without a verification step, these entries accumulate indefinitely with no closure mechanism.",
    "The governance model requires: 'GitHub visibility must be confirmed before setting githubVisibility to verified.' If there is no in-app path to confirm this, the rule becomes unenforced.",
    "Operators may treat 'implementation complete' as equivalent to 'verified' — skipping the confirmation step that is required by AI_PROJECT_INSTRUCTIONS.repositoryVisibilityProtocol.",
    "AUDIT_INDEX and PhaseExecutionLog could diverge: an audit marked 'verified' in AUDIT_INDEX but with unverified execution log entries creates a false confidence signal.",
    "Governance drift accelerates — each unverified entry adds noise to the execution log, making it harder to determine the true verified state of the repository.",
  ],

  // ── F. One safe next implementation step ──────────────────────────────────
  oneSafeNextStep:
    "Create src/components/admin/ExecutionLogPanel.jsx — an in-app panel that renders PhaseExecutionLog entries with their githubVisibility status highlighted. Entries where githubVisibility contains 'Not yet verified' should be visually flagged. Each entry should provide a GitHub link for manual post-merge verification. Add this panel to the Admin 'Govern' tab after GovernanceOrchestratorPanel to complete the operator workflow.",

  summary:
    "GovernanceHub has a functional audit-creation and task-generation workflow (AuditRunnerPanel → GovernanceOrchestratorPanel) but no in-app execution log view and no 'verify after merge' action. The execution log's githubVisibility field is unstructured free-text with no lifecycle status progression. The risk of enabling app-native audit creation before verification exists is that unverified entries will accumulate with no in-app closure path, violating AI_PROJECT_INSTRUCTIONS.repositoryVisibilityProtocol. The one safe next step is to create ExecutionLogPanel.jsx, which surfaces the execution log in the Admin Govern tab and flags unverified entries for post-merge verification.",

  problem:
    "GovernanceHub has no in-app execution log panel. Operators cannot see PhaseExecutionLog entries from within the application. The githubVisibility field is unstructured free-text with no controlled lifecycle vocabulary (drafted/implemented/merged/verified). Post-merge verification has no in-app action — it is entirely manual and external. The Admin Govern tab workflow is incomplete: it stops at task generation and does not include a 'verify after merge' step.",

  impact:
    "Without an in-app execution log view, the governance lifecycle cannot close within GovernanceHub. The 'verify → propose → implement → publish → verify' loop described in AI_PROJECT_INSTRUCTIONS.developmentLoop has no in-app endpoint. Governance drift risk increases with each unverified log entry.",

  affectedFiles: [
    "src/components/governance/PhaseExecutionLog.jsx",
    "src/components/governance/NextSafeStep.jsx",
    "src/pages/Admin.jsx",
  ],

  requiredChange:
    "Create src/components/admin/ExecutionLogPanel.jsx. Import and render PHASE_EXECUTION_LOG.entries. Display lifecycle status per entry using githubVisibility. Flag 'Not yet verified' entries with a warning badge. Provide GitHub links for post-merge verification. Add ExecutionLogPanel to Admin.jsx Govern tab.",

  constraints:
    "Modify only Admin.jsx and NextSafeStep.jsx in existing non-locked files. New file ExecutionLogPanel.jsx is a net-new addition. Do not modify locked governance files except PhaseExecutionLog (append entry) and AUDIT_INDEX (register audit). One structural change at a time.",

  acceptanceCriteria:
    "ExecutionLogPanel.jsx exists and renders PhaseExecutionLog entries. Entries with unverified githubVisibility are visually distinguished. Admin Govern tab includes ExecutionLogPanel. NextSafeStep reflects the current lifecycle state.",
};

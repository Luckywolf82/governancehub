/**
 * Governance Orchestrator Domain Logic Engine
 * Pure functions for audit analysis, readiness determination, and output generation.
 * No React dependencies. All functions accept parameters and return plain objects.
 */

// ── Audit Shape Normalization ─────────────────────────────────────────────────
// Accepts both canonical (meta/finding) and legacy (flat) audit shapes.
// Canonical shape: { meta: {...}, finding: {...} }
// Legacy shape:    flat object with all fields at the top level
// Returns a flat object with all expected orchestrator fields.
// Legacy audits are returned unchanged.

export function normalizeAuditShape(audit) {
  if (!audit) return audit;
  if (audit.meta && audit.finding) {
    // Spread order: meta fields first, finding fields second.
    // Per canonical schema (AUDIT_SYSTEM_GUIDE), meta and finding have no
    // overlapping keys, so no conflict is expected. finding wins if overlap occurs.
    return {
      ...audit.meta,
      ...audit.finding,
    };
  }
  return audit;
}

// ── Readiness Model ──────────────────────────────────────────────────────────
// Derived from audit.status + audit.preliminary — no new canonical fields needed.
//   "execution-ready"    → verified + preliminary: false
//   "remediation-first"  → orphaned
//   "analysis-first"     → planned OR preliminary: true (any status)

export function getReadiness(audit) {
  if (!audit) return null;
  if (audit.status === "orphaned") return "remediation-first";
  if (audit.status === "verified" && audit.preliminary === false) return "execution-ready";
  return "analysis-first";
}

// ── Recommended Step Builder ──────────────────────────────────────────────────

export function buildRecommendedStep(audit, isInjected, isLockedPath, lockedRuleFor) {
  if (!audit) return null;
  
  const affectedFiles = Array.isArray(audit.affectedFiles) ? audit.affectedFiles : [];
  const lockedInvolved = affectedFiles.filter(isLockedPath);
  
  return {
    title: `${audit.title} — Implementation`,
    why: isInjected
      ? `This recommendation is based on an Audit Runner generated result (${audit.id}). Evidence source: ${audit.evidenceSource ?? "unknown"}. Verify independently before acting.`
      : `This recommendation is based on the selected audit (${audit.id}). No priority ranking has been computed — verify independently before acting.`,
    scope: audit.category,
    affectedFiles,
    constraints: audit.constraints ?? "Follow locked file policy. One structural change only.",
    acceptanceCriteria: audit.acceptanceCriteria ?? null,
    acceptanceCriteriaMissing: !audit.acceptanceCriteria,
    lockedWarning: lockedInvolved.length > 0
      ? lockedInvolved.map((p) => `${p} — ${lockedRuleFor(p)}`).join("\n")
      : null,
  };
}

// ── Issue Dispatch Prep Builder ──────────────────────────────────────────────

export function buildIssuePrep(audit, readiness, isInjected, hasManualData, enrichedFields, githubIssue) {
  if (!audit) return null;

  // Title: prefix deterministically from readiness + category
  const categoryTag = audit.category ? `[${audit.category}]` : "";
  const baseTitle = audit.title ?? "Untitled audit";
  const issueTitle =
    readiness === "remediation-first" ? `[Remediation]${categoryTag} ${baseTitle}`.trim() :
    readiness === "analysis-first"    ? `[Planning]${categoryTag} ${baseTitle}`.trim() :
    `${categoryTag} ${baseTitle}`.trim();

  // Labels: deterministic from readiness
  const labelsSet = new Set();
  if (audit.category) labelsSet.add(audit.category.toLowerCase());
  labelsSet.add("audit");
  if (readiness === "remediation-first") labelsSet.add("remediation");
  if (readiness === "analysis-first") { labelsSet.add("needs-verification"); labelsSet.add("planning"); }
  if (audit.preliminary) labelsSet.add("preliminary");
  if (readiness === "execution-ready") labelsSet.add("verified");
  const labels = Array.from(labelsSet);

  // Readiness → GitHub signal
  const githubSignal =
    readiness === "execution-ready"   ? "Ready for GitHub" :
    readiness === "remediation-first" ? "Ready — remediation-focused" :
    "Planning/analysis — requires acknowledgement";

  // Provenance
  const source = isInjected ? "Audit Runner" : "AUDIT_INDEX";
  const evidenceSrc = audit.evidenceSource ?? "unknown";
  const enrichmentNote = hasManualData ? `Manual enrichment applied (${enrichedFields.join(", ")})` : null;

  // Full package text for copy
  const fullPackage = [
    `ISSUE DISPATCH PACKAGE`,
    ``,
    `Title: ${issueTitle}`,
    `Labels: ${labels.join(", ")}`,
    `Priority/Readiness: ${readiness ?? "unknown"} — ${githubSignal}`,
    ``,
    `PROVENANCE`,
    `Source: ${source}`,
    `Audit ID: ${audit.id}`,
    `Evidence: ${evidenceSrc}`,
    enrichmentNote ? `Enrichment: ${enrichmentNote}` : null,
    ``,
    `ISSUE BODY`,
    githubIssue ?? "(incomplete — fill required fields)",
  ].filter((l) => l !== null).join("\n").trim();

  return { issueTitle, labels, githubSignal, source, evidenceSrc, enrichmentNote, fullPackage };
}

// ── Dispatch Recommendation Builder ─────────────────────────────────────────
// Determines how the safe next step should be handled.
//   "blocked"       → locked files are involved
//   "copilot_task"  → execution-ready, one safe step, no locked files, few files, clear acceptance criteria
//   "github_issue"  → valid engineering task but not safe for direct copilot dispatch
//   "manual"        → analysis/strategy/non-code tasks, or missing required fields

export function buildDispatchRecommendation(audit, readiness, isLockedPath) {
  if (!audit) return null;

  const affectedFiles = Array.isArray(audit.affectedFiles) ? audit.affectedFiles : [];
  const lockedInvolved = affectedFiles.filter(isLockedPath);
  const hasLockedFiles = lockedInvolved.length > 0;
  const hasClearAcceptanceCriteria = !!(audit.acceptanceCriteria && audit.acceptanceCriteria.trim());
  const hasOneSafeNextStep = !!(audit.oneSafeNextStep && audit.oneSafeNextStep.trim());
  const fewFiles = affectedFiles.length <= 5;
  const hasRequiredEngineFields = !!(audit.problem && audit.requiredChange && audit.acceptanceCriteria);

  // Rule: blocked if locked files are involved
  if (hasLockedFiles) {
    return {
      dispatchTarget: "blocked",
      dispatchReason: `Locked files are involved (${lockedInvolved.join(", ")}). Manual review and explicit unlock required before dispatch.`,
    };
  }

  // Rule: manual for analysis/strategy/non-code tasks or missing required fields
  if (readiness === "analysis-first" || !hasRequiredEngineFields) {
    return {
      dispatchTarget: "manual",
      dispatchReason: readiness === "analysis-first"
        ? "Analysis-first audit — preliminary scope or unexecuted plan. Requires human analysis and verification before dispatch."
        : "Missing required engineering fields (problem, requiredChange, or acceptanceCriteria). Manual enrichment required before dispatch.",
    };
  }

  // Rule: copilot_task if execution-ready, one safe step, few files, clear acceptance criteria
  if (
    readiness === "execution-ready" &&
    hasOneSafeNextStep &&
    fewFiles &&
    hasClearAcceptanceCriteria
  ) {
    return {
      dispatchTarget: "copilot_task",
      dispatchReason: `Execution-ready with one safe next step, ${affectedFiles.length} affected file${affectedFiles.length === 1 ? "" : "s"}, clear acceptance criteria, and no locked files. Safe for direct Copilot dispatch.`,
    };
  }

  // Rule: github_issue for valid engineering tasks not safe for direct copilot dispatch
  const reasons = [];
  if (readiness === "remediation-first") reasons.push("remediation-first audit");
  if (!hasOneSafeNextStep) reasons.push("no oneSafeNextStep defined");
  if (!fewFiles) reasons.push(`${affectedFiles.length} affected files (exceeds threshold for direct dispatch)`);
  if (!hasClearAcceptanceCriteria) reasons.push("acceptance criteria missing");

  return {
    dispatchTarget: "github_issue",
    // reasons may be empty only if readiness is null/unknown (getReadiness returned null);
    // the defensive fallback ensures a useful message in that edge case.
    dispatchReason: `Valid engineering task but not safe for direct Copilot dispatch: ${reasons.length > 0 ? reasons.join("; ") : "recommend human review before automation"}.`,
  };
}

// ── Execution Log Draft Builder ──────────────────────────────────────────────

export function buildExecutionLogDraft(
  audit,
  readiness,
  isInjected,
  confirmedFiles,
  actualChangeSummary,
  hasManualData,
  enrichedFields,
  isLockedPath,
  lockedRuleFor,
  verificationNotes = ""
) {
  if (!audit) return null;

  const today = new Date().toISOString().slice(0, 10);
  const source = isInjected ? "Audit Runner" : "AUDIT_INDEX";
  const expectedFiles = Array.isArray(audit.affectedFiles) ? audit.affectedFiles : [];
  const lockedInvolved = expectedFiles.filter(isLockedPath);

  const confirmedList = confirmedFiles.trim()
    ? confirmedFiles.split("\n").map((s) => s.trim()).filter(Boolean)
    : null;

  const filesSection = confirmedList
    ? confirmedList.map((f) => `  - ${f}`).join("\n")
    : expectedFiles.length > 0
      ? expectedFiles.map((f) => `  - ${f} (expected — confirm after implementation)`).join("\n")
      : "  (none specified — fill in manually)";

  const lockedNote = lockedInvolved.length > 0
    ? `\nLOCKED FILE VERIFICATION REQUIRED\n${lockedInvolved.map((p) => `  - ${p} — ${lockedRuleFor(p)}`).join("\n")}\n  Confirm these files were not modified except through explicitly allowed operations.`
    : "";

  // planned = what the audit said should be done (requiredChange)
  const plannedChange = audit.requiredChange ?? "(not specified in audit — fill in manually)";
  // actual = what the operator confirms was actually done (user-editable)
  const actualChange = actualChangeSummary.trim() || "(not yet confirmed — fill in above before appending to log)";
  const actualIsConfirmed = !!actualChangeSummary.trim();

  const fullDraft = [
    `EXECUTION LOG DRAFT — VERIFY BEFORE APPENDING TO PhaseExecutionLog.jsx`,
    `Do not append until GitHub visibility is confirmed and implementation is verified.`,
    ``,
    `id: (assign next sequential entry id)`,
    `date: ${today}`,
    `task: ${audit.title}`,
    `auditId: ${audit.id}`,
    `source: ${source}`,
    `readiness: ${readiness ?? "unknown"}`,
    `evidenceSource: ${audit.evidenceSource ?? "unknown"}`,
    ``,
    `CHANGED FILES`,
    filesSection,
    lockedNote,
    ``,
    `PLANNED CHANGE (taskRequested — from audit.requiredChange)`,
    plannedChange,
    ``,
    `ACTUAL CHANGE SUMMARY (diffSummary — operator-confirmed)`,
    actualIsConfirmed ? actualChange : `⚠ ${actualChange}`,
    ``,
    `githubVisibility: Not yet verified — confirm before finalizing`,
    `lockedFileVerification: ${lockedInvolved.length > 0 ? "Required — see locked file section above" : "No locked files involved — standard verification applies"}`,
    ``,
    `FOLLOW-UP`,
    audit.oneSafeNextStep ? `Registry next safe step: ${audit.oneSafeNextStep}` : "(no oneSafeNextStep defined — review manually)",
    hasManualData ? `Note: Manual enrichment was applied for: ${enrichedFields.join(", ")}` : null,
    verificationNotes.trim() ? `` : null,
    verificationNotes.trim() ? `VERIFICATION AFTER MERGE` : null,
    verificationNotes.trim()
      ? verificationNotes.trim().split("\n").map((line) => `  - ${line.trim()}`).join("\n")
      : null,
  ].filter((l) => l !== null).join("\n").trim();

  const summaryOnly = `${today} — ${audit.title} (${audit.id}) — ${source} — ${readiness ?? "unknown"}`;

  const followUpNote = audit.oneSafeNextStep
    ? `Follow-up after ${audit.id}: ${audit.oneSafeNextStep}`
    : `Follow-up after ${audit.id}: Review next safe step manually — oneSafeNextStep not defined.`;

  return { fullDraft, summaryOnly, followUpNote, expectedFiles, lockedInvolved, actualIsConfirmed };
}
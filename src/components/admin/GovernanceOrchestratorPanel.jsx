import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCheck, AlertTriangle, Lock, ChevronDown, ChevronUp, X, FlaskConical, ShieldCheck, Wrench, BookOpen, Tag, Send } from "lucide-react";
import { AUDIT_INDEX } from "@/components/audits/AUDIT_INDEX";
import { LOCKED_FILES } from "@/components/governance/LockedFiles";
import { generateCopilotTask } from "@/components/governance/TaskGenerator";

// ── Helpers ────────────────────────────────────────────────────────────────

const REQUIRED_FIELDS = ["problem", "impact", "affectedFiles", "requiredChange", "constraints", "acceptanceCriteria"];

// ── Readiness model ────────────────────────────────────────────────────────
// Derived from audit.status + audit.preliminary — no new canonical fields needed.
//   "execution-ready"    → verified + preliminary: false
//   "remediation-first"  → orphaned
//   "analysis-first"     → planned OR preliminary: true (any status)

function getReadiness(audit) {
  if (!audit) return null;
  if (audit.status === "orphaned") return "remediation-first";
  if (audit.status === "verified" && audit.preliminary === false) return "execution-ready";
  return "analysis-first";
}

const READINESS_CONFIG = {
  "execution-ready": {
    icon: ShieldCheck,
    bg: "bg-green-50 border-green-200",
    text: "text-green-800",
    label: "Execution-ready",
    message: "Findings verified by direct file inspection and safe to use for implementation planning.",
    outputNote: null,
  },
  "remediation-first": {
    icon: Wrench,
    bg: "bg-red-50 border-red-200",
    text: "text-red-800",
    label: "Remediation-first",
    message: "Orphaned audit — findings indicate structural problems, but the canonical audit content file is missing or contains wrong data. Resolve the structural issue before using this for normal implementation workflow.",
    outputNote: "Outputs below are remediation-oriented. Resolve the orphaned file state before treating this as an implementation task.",
  },
  "analysis-first": {
    icon: BookOpen,
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-800",
    label: "Analysis-first",
    message: "Preliminary audit scope — this is a planned audit definition or unexecuted scope, not a verified audit result. Use for planning and scoping, not direct implementation guidance.",
    outputNote: "Outputs below are planning-oriented and based on preliminary scope definitions, not verified findings.",
  },
};

function missingFields(audit) {
  return REQUIRED_FIELDS.filter((f) => {
    const v = audit[f];
    return !v || (Array.isArray(v) && v.length === 0);
  });
}

// Exact path match only — no substring/includes matching
function isLockedPath(path) {
  return LOCKED_FILES.files.some((lf) => lf.path === path);
}

function lockedRuleFor(path) {
  return LOCKED_FILES.files.find((lf) => lf.path === path)?.rule;
}

// ── CopyBtn ─────────────────────────────────────────────────────────────────

function CopyBtn({ value, label }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      disabled={!value}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        copied ? "bg-green-100 text-green-700 border-green-300" : "border-slate-300 text-slate-600 hover:border-slate-500 hover:bg-slate-50"
      }`}
    >
      {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Kopiert!" : label}
    </button>
  );
}

// ── Enrichment field ─────────────────────────────────────────────────────────

function EnrichField({ label, name, value, onChange, isArray }) {
  return (
    <div className="mb-2">
      <label className="text-xs font-medium text-amber-700 flex items-center gap-1 mb-0.5">
        <AlertTriangle className="w-3 h-3" /> {label} <span className="text-slate-400 font-normal">(manuelt)</span>
      </label>
      <textarea
        rows={isArray ? 2 : 1}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={isArray ? "Én per linje" : "Skriv inn…"}
        className="w-full text-xs border border-amber-200 rounded px-2 py-1 bg-amber-50 focus:outline-none focus:border-amber-400 resize-none"
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function GovernanceOrchestratorPanel({ injectedAudit = null, onClearInjected }) {
  const [selectedId, setSelectedId] = useState("");
  const [enrichment, setEnrichment] = useState({});
  const [showOutputs, setShowOutputs] = useState(false);
  const [showLogAssistant, setShowLogAssistant] = useState(false);
  const [confirmedFiles, setConfirmedFiles] = useState("");

  // If an injected audit is present, use it directly — do not merge with AUDIT_INDEX
  const isInjected = !!injectedAudit;
  const baseAudit = isInjected ? injectedAudit : (AUDIT_INDEX.entries.find((e) => e.id === selectedId) ?? null);

  // Merge audit index data with manual enrichment; track which fields came from enrichment
  const { audit, enrichedFields } = useMemo(() => {
    if (!baseAudit) return { audit: null, enrichedFields: [] };
    // For injected audits, skip enrichment merge — fields are already populated by Audit Runner
    if (isInjected) return { audit: baseAudit, enrichedFields: [] };
    const merged = { ...baseAudit };
    const used = [];
    REQUIRED_FIELDS.forEach((f) => {
      const raw = enrichment[f] ?? "";
      if (!merged[f] && raw.trim()) {
        merged[f] = f === "affectedFiles" ? raw.split("\n").map((s) => s.trim()).filter(Boolean) : raw.trim();
        used.push(f);
      }
    });
    return { audit: merged, enrichedFields: used };
  }, [baseAudit, enrichment]);
  const hasManualData = enrichedFields.length > 0;

  const missing = audit ? missingFields(audit) : [];
  const isReady = audit && missing.length === 0;
  const readiness = getReadiness(audit);
  const readinessConfig = readiness ? READINESS_CONFIG[readiness] : null;

  function handleEnrich(name, val) {
    setEnrichment((prev) => ({ ...prev, [name]: val }));
  }

  // ── Generated outputs ──────────────────────────────────────────────────────

  const recommendedStep = useMemo(() => {
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
  }, [audit]);

  const copilotTask = useMemo(() => {
    if (!isReady) return null;
    return generateCopilotTask({
      ...audit,
      affectedFiles: Array.isArray(audit.affectedFiles) ? audit.affectedFiles : [],
    });
  }, [audit, isReady]);

  const base44Prompt = useMemo(() => {
    if (!isReady) return null;
    const locked = (audit.affectedFiles ?? []).filter(isLockedPath);
    return [
      `TASK: ${audit.title}`,
      ``,
      `CONTEXT`,
      `Audit ID: ${audit.id} | Category: ${audit.category} | Status: ${audit.status}`,
      ``,
      `PROBLEM`,
      audit.problem,
      ``,
      `IMPACT`,
      audit.impact,
      ``,
      `AFFECTED FILES`,
      (Array.isArray(audit.affectedFiles) ? audit.affectedFiles : []).join("\n"),
      ``,
      `REQUIRED CHANGE`,
      audit.requiredChange,
      ``,
      `CONSTRAINTS`,
      audit.constraints,
      locked.length > 0 ? `\nLOCKED FILE CAUTION\n${locked.map((p) => `${p} — ${lockedRuleFor(p)}`).join("\n")}` : "",
      ``,
      `ACCEPTANCE CRITERIA`,
      audit.acceptanceCriteria,
      ``,
      `GOVERNANCE RULES`,
      `- One structural change only`,
      `- Update execution log after implementation`,
      `- Confirm GitHub visibility before marking complete`,
    ].filter((l) => l !== undefined).join("\n").trim();
  }, [audit, isReady]);

  const githubIssue = useMemo(() => {
    if (!isReady) return null;
    const locked = (audit.affectedFiles ?? []).filter(isLockedPath);
    return [
      `## ${audit.title}`,
      ``,
      `**Audit ID:** \`${audit.id}\` | **Category:** ${audit.category}`,
      ``,
      `### Problem`,
      audit.problem,
      ``,
      `### Impact`,
      audit.impact,
      ``,
      `### Affected Files`,
      (Array.isArray(audit.affectedFiles) ? audit.affectedFiles : []).map((f) => `- \`${f}\``).join("\n"),
      ``,
      `### Required Change`,
      audit.requiredChange,
      ``,
      `### Constraints`,
      audit.constraints,
      locked.length > 0 ? `\n### ⚠️ Locked File Caution\n${locked.map((p) => `- \`${p}\` — ${lockedRuleFor(p)}`).join("\n")}` : "",
      ``,
      `### Acceptance Criteria`,
      audit.acceptanceCriteria,
      ``,
      `---`,
      `*Generated by GovernanceHub Orchestrator — verify before implementation*`,
    ].filter((l) => l !== undefined).join("\n").trim();
  }, [audit, isReady]);

  const verificationChecklist = useMemo(() => {
    if (!audit) return null;
    const files = Array.isArray(audit.affectedFiles) ? audit.affectedFiles : [];
    const locked = files.filter(isLockedPath);
    const lockedInConstraints = audit.constraints && LOCKED_FILES.files.some((lf) => audit.constraints.includes(lf.path));
    const followUpAuditAssessment =
      locked.length > 0
        ? "Yes — locked files are involved; an audit entry is required"
        : lockedInConstraints
        ? "Likely — locked file paths referenced in constraints; verify audit requirement"
        : "Requires manual review — insufficient data to determine automatically";
    return [
      `VERIFICATION CHECKLIST — ${audit.title}`,
      ``,
      `□ Verify that the following files were changed as expected:`,
      files.length > 0 ? files.map((f) => `  - ${f}`).join("\n") : "  (no files specified — verify manually)",
      ``,
      locked.length > 0 ? [`□ Re-read locked files and confirm they were not modified except through allowed operations:`, ...locked.map((p) => `  - ${p}`), ``].join("\n") : "",
      `□ Confirm execution log entry has been appended to PhaseExecutionLog.jsx (do not rewrite existing entries)`,
      `□ Confirm all changed files are visible in the GitHub repository`,
      `□ Follow-up audit assessment: ${followUpAuditAssessment}`,
      `□ Re-read LockedFiles.jsx and AI_PROJECT_INSTRUCTIONS.jsx to confirm locked file integrity`,
    ].filter((l) => l !== undefined).join("\n").trim();
  }, [audit]);

  // ── Issue Dispatch Prep ────────────────────────────────────────────────────

  const issuePrep = useMemo(() => {
    if (!audit) return null;

    // Title: cleaner, operational format
    const categoryTag = audit.category ? `[${audit.category}]` : "";
    const baseTitle = audit.title ?? "Untitled audit";
    const issueTitle = `${categoryTag} ${baseTitle}`.trim();

    // Labels: 2–4 based on category + state
    const labels = [];
    if (audit.category) labels.push(audit.category.toLowerCase());
    labels.push("audit");
    if (audit.status === "orphaned") labels.push("remediation");
    if (audit.preliminary) labels.push("preliminary");
    if (audit.status === "verified" && !audit.preliminary) labels.push("verified");

    // Readiness → GitHub signal
    const githubSignal =
      readiness === "execution-ready" ? "Ready for GitHub" :
      readiness === "remediation-first" ? "Ready — remediation-focused" :
      "Draft only — review before issue creation";

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
  }, [audit, readiness, isInjected, hasManualData, enrichedFields, githubIssue]);

  // ── Execution Log Draft ────────────────────────────────────────────────────

  const logDraft = useMemo(() => {
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

    const summaryText = audit.requiredChange ?? "(required change not specified — fill in manually)";

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
      `SUMMARY OF CHANGE`,
      summaryText,
      ``,
      `githubVisibility: Not yet verified — confirm before finalizing`,
      `lockedFileVerification: ${lockedInvolved.length > 0 ? "Required — see locked file section above" : "No locked files involved — standard verification applies"}`,
      ``,
      `FOLLOW-UP`,
      audit.oneSafeNextStep ? `Registry next safe step: ${audit.oneSafeNextStep}` : "(no oneSafeNextStep defined — review manually)",
      hasManualData ? `Note: Manual enrichment was applied for: ${enrichedFields.join(", ")}` : null,
    ].filter((l) => l !== null).join("\n").trim();

    const summaryOnly = `${today} — ${audit.title} (${audit.id}) — ${source} — ${readiness ?? "unknown"}`;

    const followUpNote = audit.oneSafeNextStep
      ? `Follow-up after ${audit.id}: ${audit.oneSafeNextStep}`
      : `Follow-up after ${audit.id}: Review next safe step manually — oneSafeNextStep not defined.`;

    return { fullDraft, summaryOnly, followUpNote, expectedFiles, lockedInvolved };
  }, [audit, readiness, isInjected, confirmedFiles, hasManualData, enrichedFields]);

  const recommendedStepText = useMemo(() => {
    if (!recommendedStep) return null;
    return [
      `RECOMMENDED NEXT SAFE STEP`,
      `Title: ${recommendedStep.title}`,
      `Why: ${recommendedStep.why}`,
      `Scope: ${recommendedStep.scope}`,
      `Affected Files:\n${recommendedStep.affectedFiles.map((f) => `  - ${f}`).join("\n") || "  (none specified)"}`,
      `Constraints: ${recommendedStep.constraints}`,
      `Acceptance Criteria: ${recommendedStep.acceptanceCriteriaMissing ? "Missing — manual definition required before implementation" : recommendedStep.acceptanceCriteria}`,
      recommendedStep.lockedWarning ? `\nLocked File Caution:\n${recommendedStep.lockedWarning}` : "",
    ].filter(Boolean).join("\n");
  }, [recommendedStep]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Governance Orchestrator</h2>
          <p className="text-xs text-slate-500">Audit → Safe Step → Task → Handoff → Verify</p>
        </div>
        <Badge className="bg-slate-100 text-slate-600 text-xs">Panel</Badge>
      </div>

      {/* ── SECTION 1: Audit Input ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-700">1. Velg audit</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">

          {/* Injected audit banner */}
          {isInjected ? (
            <div className="flex items-start justify-between gap-2 bg-indigo-50 border border-indigo-200 rounded px-3 py-2">
              <div className="flex items-start gap-2 text-xs text-indigo-800">
                <FlaskConical className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Audit Runner result</p>
                  <p className="text-indigo-600">Injisert fra Audit Runner — ikke hentet fra AUDIT_INDEX. Kilde: <span className="font-mono">{injectedAudit.evidenceSource ?? "ukjent"}</span></p>
                </div>
              </div>
              <button
                onClick={() => { onClearInjected?.(); setEnrichment({}); setShowOutputs(false); }}
                className="shrink-0 text-indigo-400 hover:text-indigo-700 transition-colors"
                title="Fjern injisert audit og gå tilbake til AUDIT_INDEX"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <select
              value={selectedId}
              onChange={(e) => { setSelectedId(e.target.value); setEnrichment({}); setShowOutputs(false); setConfirmedFiles(""); setShowLogAssistant(false); }}
              className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400"
            >
              <option value="">— Velg en audit fra indeksen —</option>
              {AUDIT_INDEX.entries.map((e) => (
                <option key={e.id} value={e.id}>{e.id} — {e.title} [{e.status}{e.preliminary ? " / preliminary" : ""}]</option>
              ))}
            </select>
          )}

          {audit && (
            <div className={`text-xs space-y-1 border rounded p-2 ${isInjected ? "border-indigo-100 bg-indigo-50/40" : "border-slate-100 bg-slate-50"}`}>
              <div className="flex flex-wrap gap-1.5 mb-1">
                <Badge className="bg-blue-100 text-blue-800 text-xs">{audit.category}</Badge>
                <Badge className={`text-xs ${
                  audit.status === "verified"  ? "bg-green-100 text-green-800" :
                  audit.status === "orphaned"  ? "bg-red-100 text-red-700" :
                  audit.status === "completed" ? "bg-green-100 text-green-800" :
                  "bg-amber-100 text-amber-800"
                }`}>{audit.status}</Badge>
                {audit.date && <span className="text-slate-400">{audit.date}</span>}
              </div>
              <p className="text-slate-600">{audit.summary}</p>
            </div>
          )}

          {/* Readiness banner — shown for all audits, injected or registry */}
          {audit && readinessConfig && (() => {
            const Icon = readinessConfig.icon;
            return (
              <div className={`flex items-start gap-2 border rounded px-3 py-2 ${readinessConfig.bg}`}>
                <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${readinessConfig.text}`} />
                <div className={`text-xs ${readinessConfig.text}`}>
                  <span className="font-semibold">{readinessConfig.label}</span>
                  {" — "}
                  {isInjected
                    ? readiness === "execution-ready"
                      ? "Audit Runner result med verified status og preliminary: false — behandles som execution-ready, men verifiser uavhengig."
                      : readiness === "remediation-first"
                      ? "Audit Runner result indikerer orphaned status — outputs er remediation-orienterte, ikke normal implementering."
                      : "Audit Runner result er preliminary eller unexecuted scope — outputs er planning-orienterte, ikke implementeringsklar."
                    : readinessConfig.message
                  }
                  {!isInjected && audit.preliminary && audit.preliminaryNote && (
                    <p className="mt-1 opacity-80">{audit.preliminaryNote}</p>
                  )}
                  {/* evidenceSource shown here for registry audits; injected audits already show it in provenance banner above */}
                  {!isInjected && audit.evidenceSource && (
                    <p className="mt-1 font-mono opacity-70">Evidence source: {audit.evidenceSource}</p>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Enrichment area — only for AUDIT_INDEX audits, not injected */}
          {audit && !isInjected && missing.length > 0 && (
            <div className="border border-amber-200 rounded p-3 bg-amber-50/50">
              <p className="text-xs font-medium text-amber-700 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Audit-indeksen mangler {missing.length} felt som trengs for full oppgavegenerering.
                Fyll inn manuelt eller la stå for begrenset output.
              </p>
              {missing.map((f) => (
                <EnrichField
                  key={f}
                  label={f}
                  name={f}
                  value={enrichment[f] ?? ""}
                  onChange={handleEnrich}
                  isArray={f === "affectedFiles"}
                />
              ))}
            </div>
          )}

          {audit && (
            <div className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 ${isReady ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
              {isReady ? <CheckCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {isReady
                ? isInjected
                  ? "Audit Runner result er komplett — alle outputs tilgjengelig."
                  : "Audit er komplett — alle outputs tilgjengelig."
                : `Mangler: ${missing.join(", ")} — outputs vil reflektere usikkerhet.`
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── SECTION 2: Recommended Next Safe Step ── */}
      {recommendedStep && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-700">2. Anbefalt neste steg</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2 text-xs">
            <p className="font-semibold text-slate-800">{recommendedStep.title}</p>
            <p className="text-slate-600"><span className="font-medium">Hvorfor:</span> {recommendedStep.why}</p>
            <p className="text-slate-600"><span className="font-medium">Scope:</span> {recommendedStep.scope}</p>
            {audit?.oneSafeNextStep && (
              <div className="flex items-start gap-1.5 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-700">
                <ShieldCheck className="w-3 h-3 mt-0.5 shrink-0 text-slate-400" />
                <span><span className="font-medium">Registry one safe next step:</span> {audit.oneSafeNextStep}</span>
              </div>
            )}
            {recommendedStep.affectedFiles.length > 0 && (
              <div>
                <span className="font-medium text-slate-600">Berørte filer:</span>
                <ul className="mt-0.5 space-y-0.5">
                  {recommendedStep.affectedFiles.map((f) => (
                    <li key={f} className="font-mono text-slate-500 flex items-center gap-1">
                      {isLockedPath(f) && <Lock className="w-3 h-3 text-red-400 shrink-0" />}
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-slate-600"><span className="font-medium">Constraints:</span> {recommendedStep.constraints}</p>
            <div className="text-slate-600">
              <span className="font-medium">Akseptansekriterier: </span>
              {recommendedStep.acceptanceCriteriaMissing
                ? <span className="text-amber-600 italic flex items-center gap-1 inline-flex"><AlertTriangle className="w-3 h-3" /> Ikke spesifisert i audit — krever manuell definisjon før implementering.</span>
                : recommendedStep.acceptanceCriteria
              }
            </div>
            {recommendedStep.lockedWarning && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700">
                <p className="font-medium flex items-center gap-1 mb-1"><Lock className="w-3 h-3" /> Låste filer involvert:</p>
                <pre className="whitespace-pre-wrap font-mono text-xs">{recommendedStep.lockedWarning}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── SECTION 3 + 4: Generated outputs + Copy Actions ── */}
      {audit && (
        <Card>
          <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowOutputs((v) => !v)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-700">3. Genererte handoff-outputs</CardTitle>
              <div className="flex items-center gap-2">
                {!isReady && <Badge className="bg-amber-100 text-amber-700 text-xs">Begrenset — data mangler</Badge>}
                {isReady && hasManualData && (
                  <Badge className="bg-amber-100 text-amber-700 text-xs flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Bruker manuell data ({enrichedFields.join(", ")})
                  </Badge>
                )}
                {showOutputs ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
          </CardHeader>

          {showOutputs && (
            <CardContent className="pt-0 space-y-4">
              {readinessConfig?.outputNote && (
                <div className={`flex items-start gap-1.5 text-xs border rounded px-2 py-1.5 ${readinessConfig.bg} ${readinessConfig.text}`}>
                  {readiness === "remediation-first"
                    ? <Wrench className="w-3 h-3 mt-0.5 shrink-0" />
                    : <BookOpen className="w-3 h-3 mt-0.5 shrink-0" />}
                  <span>{readinessConfig.outputNote}</span>
                </div>
              )}
              {hasManualData && (
                <div className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>Disse outputs bruker manuelt oppgitte verdier for: <strong>{enrichedFields.join(", ")}</strong>. Verifiser at verdiene er korrekte før du bruker outputene.</span>
                </div>
              )}

              {/* Copy action bar */}
              <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                <CopyBtn value={copilotTask}          label="Kopier Copilot Task" />
                <CopyBtn value={base44Prompt}         label="Kopier Base44 Prompt" />
                <CopyBtn value={githubIssue}          label="Kopier GitHub Issue" />
                <CopyBtn value={recommendedStepText}  label="Kopier Anbefalt Steg" />
                <CopyBtn value={verificationChecklist} label="Kopier Sjekkliste" />
              </div>

              {/* Copilot Task */}
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Copilot Task</p>
                {copilotTask
                  ? <pre className="text-xs font-mono bg-slate-50 border border-slate-100 rounded p-2 whitespace-pre-wrap text-slate-700 max-h-40 overflow-y-auto">{copilotTask}</pre>
                  : <p className="text-xs text-amber-600 italic">Mangler påkrevde felt — fyll inn enrichment for å aktivere.</p>
                }
              </div>

              {/* Base44 Prompt */}
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Base44 Prompt</p>
                {base44Prompt
                  ? <pre className="text-xs font-mono bg-slate-50 border border-slate-100 rounded p-2 whitespace-pre-wrap text-slate-700 max-h-40 overflow-y-auto">{base44Prompt}</pre>
                  : <p className="text-xs text-amber-600 italic">Mangler påkrevde felt — fyll inn enrichment for å aktivere.</p>
                }
              </div>

              {/* GitHub Issue */}
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">GitHub Issue Draft</p>
                {githubIssue
                  ? <pre className="text-xs font-mono bg-slate-50 border border-slate-100 rounded p-2 whitespace-pre-wrap text-slate-700 max-h-40 overflow-y-auto">{githubIssue}</pre>
                  : <p className="text-xs text-amber-600 italic">Mangler påkrevde felt — fyll inn enrichment for å aktivere.</p>
                }
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* ── SECTION 4: Issue Dispatch Prep ── */}
      {issuePrep && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-slate-400" />
                4. Issue Dispatch Prep
              </CardTitle>
              <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                readiness === "execution-ready"   ? "bg-green-50 border-green-200 text-green-700" :
                readiness === "remediation-first" ? "bg-red-50 border-red-200 text-red-700" :
                "bg-amber-50 border-amber-200 text-amber-700"
              }`}>{issuePrep.githubSignal}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">

            {/* Title row */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-slate-400 mb-0.5">Issue title</p>
                <p className="text-xs font-mono font-medium text-slate-800 truncate">{issuePrep.issueTitle}</p>
              </div>
              <CopyBtn value={issuePrep.issueTitle} label="Kopier tittel" />
            </div>

            {/* Labels row */}
            <div>
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Tag className="w-3 h-3" />Labels</p>
              <div className="flex flex-wrap gap-1">
                {issuePrep.labels.map((l) => (
                  <span key={l} className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">{l}</span>
                ))}
              </div>
            </div>

            {/* Provenance row */}
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded px-2 py-1.5 space-y-0.5">
              <p><span className="font-medium text-slate-600">Source:</span> {issuePrep.source} · <span className="font-mono">{audit.id}</span></p>
              <p><span className="font-medium text-slate-600">Evidence:</span> {issuePrep.evidenceSrc}</p>
              {issuePrep.enrichmentNote && (
                <p className="text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{issuePrep.enrichmentNote}</p>
              )}
            </div>

            {/* Issue body preview */}
            <div>
              <p className="text-xs text-slate-400 mb-1">Issue body</p>
              {githubIssue
                ? <pre className="text-xs font-mono bg-slate-50 border border-slate-100 rounded p-2 whitespace-pre-wrap text-slate-700 max-h-36 overflow-y-auto">{githubIssue}</pre>
                : <p className="text-xs text-amber-600 italic">Mangler påkrevde felt — fyll inn enrichment for å aktivere issue body.</p>
              }
            </div>

            {/* Copy actions */}
            <div className="flex flex-wrap gap-2">
              <CopyBtn value={issuePrep.issueTitle}   label="Kopier tittel" />
              <CopyBtn value={issuePrep.labels.join(", ")} label="Kopier labels" />
              <CopyBtn value={githubIssue}             label="Kopier issue body" />
              <CopyBtn value={issuePrep.fullPackage}   label="Kopier full pakke" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── SECTION 5: Execution Log Assistant ── */}
      {logDraft && (
        <Card>
          <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowLogAssistant((v) => !v)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-700">5. Execution Log Assistant</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Utkast — ikke auto-skrevet</span>
                {showLogAssistant ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
          </CardHeader>

          {showLogAssistant && (
            <CardContent className="pt-0 space-y-3">

              {/* Draft-only framing */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Utkast — verifiser før du legger inn</p>
                  <p className="opacity-80">Ikke legg til i PhaseExecutionLog.jsx før implementeringen er verifisert og GitHub-synlighet er bekreftet.</p>
                </div>
              </div>

              {/* Locked file warning */}
              {logDraft.lockedInvolved.length > 0 && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-800">
                  <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Låste filer involvert</p>
                    <ul className="mt-0.5 space-y-0.5">
                      {logDraft.lockedInvolved.map((p) => (
                        <li key={p} className="font-mono">{p} — {lockedRuleFor(p)}</li>
                      ))}
                    </ul>
                    <p className="mt-1 opacity-80">Bekreft at disse filene ikke ble endret utenom tillatte operasjoner.</p>
                  </div>
                </div>
              )}

              {/* Expected vs confirmed files */}
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">Bekreft endrede filer</p>
                <p className="text-xs text-slate-400 mb-1">Forventede filer fra audit (forhåndsutfylt). Overskriv med faktisk endrede filer.</p>
                <textarea
                  rows={Math.max(2, logDraft.expectedFiles.length + 1)}
                  value={confirmedFiles}
                  onChange={(e) => setConfirmedFiles(e.target.value)}
                  placeholder={logDraft.expectedFiles.length > 0
                    ? logDraft.expectedFiles.join("\n")
                    : "Skriv inn endrede filer, én per linje"}
                  className="w-full text-xs font-mono border border-slate-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400 resize-none"
                />
                {confirmedFiles.trim()
                  ? <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1"><CheckCheck className="w-3 h-3" />Bekreftet filsett vil bli brukt i utkastet.</p>
                  : <p className="text-xs text-slate-400 mt-0.5">La stå tomt for å bruke forventede filer fra audit.</p>
                }
              </div>

              {/* Provenance row */}
              <div className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded px-2 py-1.5 space-y-0.5">
                <p><span className="font-medium text-slate-600">Kilde:</span> {isInjected ? "Audit Runner" : "AUDIT_INDEX"} · <span className="font-mono">{audit.id}</span></p>
                <p><span className="font-medium text-slate-600">Evidence:</span> {audit.evidenceSource ?? "unknown"} · <span className="font-medium">Readiness:</span> {readiness ?? "unknown"}</p>
              </div>

              {/* Draft preview */}
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">Log-utkast</p>
                <pre className="text-xs font-mono bg-slate-50 border border-slate-100 rounded p-2 whitespace-pre-wrap text-slate-700 max-h-48 overflow-y-auto">{logDraft.fullDraft}</pre>
              </div>

              {/* Copy actions */}
              <div className="flex flex-wrap gap-2">
                <CopyBtn value={logDraft.fullDraft}    label="Kopier fullt utkast" />
                <CopyBtn value={logDraft.summaryOnly}  label="Kopier sammendrag" />
                <CopyBtn value={logDraft.followUpNote} label="Kopier oppfølging" />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* ── SECTION 6: Verification Checklist ── */}
      {verificationChecklist && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-700">6. Verifikasjons-sjekkliste</CardTitle>
            <p className="text-xs text-slate-400">Etter implementering — gå gjennom punkt for punkt</p>
          </CardHeader>
          <CardContent className="pt-0">
            <pre className="text-xs font-mono bg-slate-50 border border-slate-100 rounded p-3 whitespace-pre-wrap text-slate-700">
              {verificationChecklist}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCheck, AlertTriangle, Lock, ChevronDown, ChevronUp, X, FlaskConical } from "lucide-react";
import { AUDIT_INDEX } from "@/components/audits/AUDIT_INDEX";
import { LOCKED_FILES } from "@/components/governance/LockedFiles";
import { generateCopilotTask } from "@/components/governance/TaskGenerator";

// ── Helpers ────────────────────────────────────────────────────────────────

const REQUIRED_FIELDS = ["problem", "impact", "affectedFiles", "requiredChange", "constraints", "acceptanceCriteria"];

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
              onChange={(e) => { setSelectedId(e.target.value); setEnrichment({}); setShowOutputs(false); }}
              className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400"
            >
              <option value="">— Velg en audit fra indeksen —</option>
              {AUDIT_INDEX.entries.map((e) => (
                <option key={e.id} value={e.id}>{e.id} — {e.title} [{e.status}]</option>
              ))}
            </select>
          )}

          {audit && (
            <div className={`text-xs space-y-1 border rounded p-2 ${isInjected ? "border-indigo-100 bg-indigo-50/40" : "border-slate-100 bg-slate-50"}`}>
              <div className="flex flex-wrap gap-1.5 mb-1">
                <Badge className="bg-blue-100 text-blue-800 text-xs">{audit.category}</Badge>
                <Badge className={`text-xs ${audit.status === "completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{audit.status}</Badge>
                {audit.date && <span className="text-slate-400">{audit.date}</span>}
              </div>
              <p className="text-slate-600">{audit.summary}</p>
            </div>
          )}

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

      {/* ── SECTION 5: Verification Checklist ── */}
      {verificationChecklist && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-700">4. Verifikasjons-sjekkliste</CardTitle>
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
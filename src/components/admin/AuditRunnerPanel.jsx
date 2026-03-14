import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCheck, AlertTriangle, CheckCircle2, HelpCircle, Play, ChevronDown, ChevronUp } from "lucide-react";
import { LOCKED_FILES } from "@/components/governance/LockedFiles";
import { AI_PROJECT_INSTRUCTIONS } from "@/components/governance/AI_PROJECT_INSTRUCTIONS";
import { AI_STATE } from "@/components/governance/AI_STATE";
import { NEXT_SAFE_STEP } from "@/components/governance/NextSafeStep";
import { AUDIT_INDEX } from "@/components/audits/AUDIT_INDEX";

// ── Constants ──────────────────────────────────────────────────────────────────

const REQUIRED_AUDIT_FIELDS = ["problem", "impact", "affectedFiles", "requiredChange", "constraints", "acceptanceCriteria"];

// Explicit bootstrap placeholder patterns only — generic words like "placeholder" or "Bootstrap"
// are intentionally excluded to avoid false positives on legitimate content.
const PLACEHOLDER_PATTERNS = ["New Base44 App", "YYYY-MM-DD", "yourname/yourrepo", "your-repo"];

// Extract locked file paths mentioned in AI_PROJECT_INSTRUCTIONS text
function extractLockedPathsFromInstructions(text) {
  const lines = text.split("\n");
  const paths = [];
  let inLockedSection = false;
  for (const line of lines) {
    if (line.includes("LOCKED FILES") || line.includes("locked governance files")) {
      inLockedSection = true;
    }
    if (inLockedSection && line.trim().startsWith("- src/")) {
      paths.push(line.trim().replace(/^- /, ""));
    }
    if (inLockedSection && line.trim() === "" && paths.length > 0) {
      // keep going — section may have more lines
    }
    if (inLockedSection && line.trim().startsWith("---")) {
      inLockedSection = false;
    }
  }
  return paths;
}

// ── CopyBtn ────────────────────────────────────────────────────────────────────

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

// ── Status badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  if (status === "pass")    return <Badge className="bg-green-100 text-green-700 text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Pass</Badge>;
  if (status === "warn")    return <Badge className="bg-amber-100 text-amber-700 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Warning</Badge>;
  if (status === "fail")    return <Badge className="bg-red-100 text-red-700 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Fail</Badge>;
  if (status === "manual")  return <Badge className="bg-blue-100 text-blue-700 text-xs flex items-center gap-1"><HelpCircle className="w-3 h-3" />Manual evidence</Badge>;
  return <Badge className="bg-slate-100 text-slate-500 text-xs">Not run</Badge>;
}

// ── Evidence source label ──────────────────────────────────────────────────────

function EvidenceLabel({ source }) {
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${source === "repo-derived" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
      {source === "repo-derived" ? "repo-derived" : "manual evidence"}
    </span>
  );
}

// ── Run all checks ─────────────────────────────────────────────────────────────

function runChecks(manualEvidence) {
  const checks = [];

  // CHECK 1: Governance placeholder state
  // Can auto-check AI_STATE and NEXT_SAFE_STEP (imported). PhaseExecutionLog requires manual paste.
  const stateValues = [AI_STATE.projectName, AI_STATE.phase, AI_STATE.status, AI_STATE.lastVerified,
    NEXT_SAFE_STEP.title, NEXT_SAFE_STEP.reason, NEXT_SAFE_STEP.scope];
  const foundPlaceholders = stateValues.filter(v => PLACEHOLDER_PATTERNS.some(p => typeof v === "string" && v.includes(p)));
  const phaseLogContent = manualEvidence.phaseLog || "";
  const phaseLogPlaceholders = phaseLogContent ? PLACEHOLDER_PATTERNS.filter(p => phaseLogContent.includes(p)) : null;

  let placeholderStatus = "pass";
  let placeholderFindings = [];
  if (foundPlaceholders.length > 0) {
    placeholderStatus = "fail";
    placeholderFindings.push(`AI_STATE/NextSafeStep contain placeholders: ${foundPlaceholders.join(", ")}`);
  }
  if (phaseLogPlaceholders && phaseLogPlaceholders.length > 0) {
    placeholderStatus = "fail";
    placeholderFindings.push(`PhaseExecutionLog contains placeholders: ${phaseLogPlaceholders.join(", ")}`);
  }
  if (!phaseLogContent) {
    if (placeholderStatus === "pass") placeholderStatus = "warn";
    placeholderFindings.push("PhaseExecutionLog not inspected — paste content above to include in check.");
  }

  checks.push({
    id: "check-1",
    title: "Governance Placeholder State",
    description: "Detects obvious placeholder values in governance core files.",
    status: placeholderStatus,
    evidenceSource: phaseLogContent ? "repo-derived + manual evidence" : "repo-derived",
    findings: placeholderFindings.length > 0 ? placeholderFindings : ["No placeholder values detected in AI_STATE or NextSafeStep."],
    affectedFiles: ["src/components/governance/AI_STATE.jsx", "src/components/governance/NextSafeStep.jsx", "src/components/governance/PhaseExecutionLog.jsx"],
    manualRequired: !phaseLogContent,
  });

  // CHECK 2: Locked-file policy mismatch
  const lockedInRegistry = LOCKED_FILES.files.map(f => f.path);
  const lockedInInstructions = extractLockedPathsFromInstructions(AI_PROJECT_INSTRUCTIONS);
  const inRegistryNotInstructions = lockedInRegistry.filter(p => !lockedInInstructions.includes(p));
  const inInstructionsNotRegistry = lockedInInstructions.filter(p => !lockedInRegistry.includes(p));
  const hasMismatch = inRegistryNotInstructions.length > 0 || inInstructionsNotRegistry.length > 0;

  const mismatchFindings = [];
  if (inRegistryNotInstructions.length > 0)
    mismatchFindings.push(`In LockedFiles.jsx but NOT in AI_PROJECT_INSTRUCTIONS: ${inRegistryNotInstructions.join(", ")}`);
  if (inInstructionsNotRegistry.length > 0)
    mismatchFindings.push(`In AI_PROJECT_INSTRUCTIONS but NOT in LockedFiles.jsx: ${inInstructionsNotRegistry.join(", ")}`);
  if (!hasMismatch)
    mismatchFindings.push("Locked file registries are consistent.");

  checks.push({
    id: "check-2",
    title: "Locked-File Policy Mismatch",
    description: "Compares locked file lists between LockedFiles.jsx and AI_PROJECT_INSTRUCTIONS.",
    status: hasMismatch ? "warn" : "pass",
    evidenceSource: "repo-derived",
    findings: mismatchFindings,
    affectedFiles: ["src/components/governance/LockedFiles.jsx", "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx"],
    manualRequired: false,
  });

  // CHECK 3: Routing source-of-truth mismatch
  const appJsxContent = manualEvidence.appJsx || "";
  let routingStatus = "manual";
  let routingFindings = [];
  if (appJsxContent) {
    const hasPagesConfig = appJsxContent.includes("pagesConfig");
    const hasExplicitRoute = appJsxContent.includes("<Route");
    const hasBoth = hasPagesConfig && hasExplicitRoute;
    routingStatus = hasBoth ? "warn" : "pass";
    if (hasBoth) {
      routingFindings.push("Heuristic: both pagesConfig loop and explicit <Route> elements detected in App.jsx. This may indicate dual routing responsibility — manual verification required to confirm whether this is intentional.");
    } else {
      routingFindings.push("No dual routing pattern detected. Routing source appears consistent based on heuristic check.");
    }
  } else {
    routingFindings.push("App.jsx content not supplied — cannot determine routing source-of-truth. Paste App.jsx content to enable this check.");
  }

  checks.push({
    id: "check-3",
    title: "Routing Source-of-Truth Mismatch",
    description: "Heuristic check for dual routing patterns in App.jsx — does not definitively confirm routing conflicts.",
    status: routingStatus,
    evidenceSource: appJsxContent ? "manual evidence" : "manual evidence",
    findings: routingFindings,
    affectedFiles: ["src/App.jsx"],
    manualRequired: !appJsxContent,
  });

  // CHECK 4: Audit object thinness
  const thinEntries = AUDIT_INDEX.entries.filter(entry =>
    REQUIRED_AUDIT_FIELDS.some(f => {
      const v = entry[f];
      return !v || (Array.isArray(v) && v.length === 0);
    })
  );

  const thinFindings = [];
  if (thinEntries.length === 0) {
    thinFindings.push("All audit entries have complete required fields.");
  } else {
    thinEntries.forEach(entry => {
      const missingF = REQUIRED_AUDIT_FIELDS.filter(f => {
        const v = entry[f];
        return !v || (Array.isArray(v) && v.length === 0);
      });
      thinFindings.push(`${entry.id} (${entry.title}): missing [${missingF.join(", ")}]`);
    });
  }

  checks.push({
    id: "check-4",
    title: "Audit Object Thinness",
    description: "Detects AUDIT_INDEX entries missing fields required by TaskGenerator.",
    status: thinEntries.length === 0 ? "pass" : "fail",
    evidenceSource: "repo-derived",
    findings: thinFindings,
    affectedFiles: ["src/components/audits/AUDIT_INDEX.jsx"],
    manualRequired: false,
  });

  return checks;
}

// ── Build audit output object ──────────────────────────────────────────────────

function buildAuditObject(checks, runId) {
  const failedChecks = checks.filter(c => c.status === "fail" || c.status === "warn");
  // A check counts as using manual evidence if its evidenceSource includes "manual" AND the evidence was actually supplied (manualRequired === false means evidence was present)
  const hasManual = checks.some(c => c.evidenceSource.includes("manual") && !c.manualRequired);
  const allPass = checks.every(c => c.status === "pass");

  const problem = failedChecks.length > 0
    ? failedChecks.map(c => `[${c.title}]\n${c.findings.map(f => `  - ${f}`).join("\n")}`).join("\n\n")
    : "No issues detected in this audit run.";

  const affectedFiles = [...new Set(failedChecks.flatMap(c => c.affectedFiles))];

  return {
    id: runId,
    title: "GovernanceHub Automated Governance Audit",
    category: "Governance",
    type: "Automated",
    status: allPass ? "passed" : "findings-present",
    date: new Date().toISOString().slice(0, 10),
    summary: `Ran ${checks.length} deterministic checks. ${failedChecks.length} check(s) flagged issues.`,
    problem,
    impact: "Governance drift, locked-file policy inconsistency, or thin audit entries reduce the reliability of the governance system.",
    affectedFiles,
    requiredChange: failedChecks.length > 0
      ? failedChecks.map(c => {
          if (c.id === "check-1") return "Remove or replace placeholder values in governance core files. Update PhaseExecutionLog with a verified entry after changes.";
          if (c.id === "check-2") return "Reconcile the locked-file list between LockedFiles.jsx and AI_PROJECT_INSTRUCTIONS. Both registries must reference the same set of paths.";
          if (c.id === "check-3") return "Inspect App.jsx routing manually. If both pagesConfig loop and explicit <Route> elements are present intentionally, document the rationale. Otherwise consolidate to a single routing source.";
          if (c.id === "check-4") return `Enrich thin AUDIT_INDEX entries with missing required fields (problem, impact, affectedFiles, requiredChange, constraints, acceptanceCriteria). Affected: ${c.findings.join("; ")}`;
          return `Resolve findings for: ${c.title}`;
        }).join("\n")
      : "No changes required.",
    constraints: "Follow locked-file policy. One structural change at a time. Update PhaseExecutionLog after each verified change.",
    acceptanceCriteria: failedChecks.length > 0
      ? failedChecks.map(c => {
          if (c.id === "check-1") return "Governance Placeholder State: no placeholder patterns remain in AI_STATE, NextSafeStep, or PhaseExecutionLog after re-run.";
          if (c.id === "check-2") return "Locked-File Policy Mismatch: LockedFiles.jsx and AI_PROJECT_INSTRUCTIONS reference identical locked file paths.";
          if (c.id === "check-3") return "Routing Source-of-Truth: App.jsx routing responsibility is verified as intentional or consolidated. Documented in PhaseExecutionLog.";
          if (c.id === "check-4") return "Audit Object Thinness: all AUDIT_INDEX entries contain the required fields and are usable by TaskGenerator without enrichment.";
          return `${c.title}: findings resolved.`;
        }).join("\n")
      : "All checks pass. No further action required.",
    evidenceSource: hasManual ? "repo-derived + manual evidence" : "repo-derived",
    manualEvidenceUsed: hasManual,
    checksRun: checks.map(c => ({ id: c.id, title: c.title, status: c.status, evidenceSource: c.evidenceSource })),
  };
}

function formatAuditAsText(obj) {
  return [
    `AUDIT RESULT`,
    `ID: ${obj.id}`,
    `Title: ${obj.title}`,
    `Category: ${obj.category} | Type: ${obj.type}`,
    `Status: ${obj.status} | Date: ${obj.date}`,
    `Evidence Source: ${obj.evidenceSource}`,
    ``,
    `SUMMARY`,
    obj.summary,
    ``,
    `PROBLEM`,
    obj.problem,
    ``,
    `IMPACT`,
    obj.impact,
    ``,
    `AFFECTED FILES`,
    obj.affectedFiles.length > 0 ? obj.affectedFiles.map(f => `  - ${f}`).join("\n") : "  (none)",
    ``,
    `REQUIRED CHANGE`,
    obj.requiredChange,
    ``,
    `CONSTRAINTS`,
    obj.constraints,
    ``,
    `ACCEPTANCE CRITERIA`,
    obj.acceptanceCriteria,
    ``,
    `CHECKS RUN`,
    obj.checksRun.map(c => `  [${c.status.toUpperCase()}] ${c.title} (${c.evidenceSource})`).join("\n"),
  ].join("\n").trim();
}

function formatAuditAsGithubIssue(obj) {
  return [
    `## ${obj.title}`,
    ``,
    `**Audit ID:** \`${obj.id}\` | **Category:** ${obj.category} | **Status:** ${obj.status}`,
    ``,
    `### Problem`,
    obj.problem,
    ``,
    `### Impact`,
    obj.impact,
    ``,
    `### Affected Files`,
    obj.affectedFiles.map(f => `- \`${f}\``).join("\n") || "_(none identified)_",
    ``,
    `### Required Change`,
    obj.requiredChange,
    ``,
    `### Acceptance Criteria`,
    obj.acceptanceCriteria,
    ``,
    `### Checks Run`,
    obj.checksRun.map(c => `- [${c.status}] ${c.title} _(${c.evidenceSource})_`).join("\n"),
    ``,
    `---`,
    `*Generated by GovernanceHub AuditRunner — ${obj.date} — evidence: ${obj.evidenceSource}*`,
  ].join("\n").trim();
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AuditRunnerPanel() {
  const [hasRun, setHasRun] = useState(false);
  const [checks, setChecks] = useState([]);
  const [manualEvidence, setManualEvidence] = useState({ phaseLog: "", appJsx: "" });
  const [showEvidence, setShowEvidence] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [runId] = useState(() => `run-${Date.now().toString(36)}`);

  function handleRun() {
    const result = runChecks(manualEvidence);
    setChecks(result);
    setHasRun(true);
    setShowOutput(true);
  }

  const auditObject = useMemo(() => {
    if (!hasRun) return null;
    return buildAuditObject(checks, runId);
  }, [checks, hasRun, runId]);

  const auditText = useMemo(() => auditObject ? formatAuditAsText(auditObject) : null, [auditObject]);
  const githubIssueText = useMemo(() => auditObject ? formatAuditAsGithubIssue(auditObject) : null, [auditObject]);
  const auditJson = useMemo(() => auditObject ? JSON.stringify(auditObject, null, 2) : null, [auditObject]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Audit Runner</h2>
          <p className="text-xs text-slate-500">Kjør deterministic governance-sjekker og generer strukturerte audit-resultater</p>
        </div>
        <Badge className="bg-slate-100 text-slate-600 text-xs">Beta</Badge>
      </div>

      {/* Checks overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-700">Sjekker som vil kjøre</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2 text-xs">
          {[
            { id: "check-1", title: "Governance Placeholder State", evidence: "repo-derived + optional manual paste (PhaseExecutionLog)" },
            { id: "check-2", title: "Locked-File Policy Mismatch", evidence: "repo-derived (fully deterministic)" },
            { id: "check-3", title: "Routing Source-of-Truth Mismatch", evidence: "manual paste required (App.jsx)" },
            { id: "check-4", title: "Audit Object Thinness", evidence: "repo-derived (fully deterministic)" },
          ].map(c => (
            <div key={c.id} className="flex items-start justify-between gap-2 py-1 border-b border-slate-50 last:border-0">
              <span className="text-slate-700 font-medium">{c.title}</span>
              <span className="text-slate-400 text-right shrink-0">{c.evidence}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Optional manual evidence */}
      <Card>
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowEvidence(v => !v)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-slate-700">Manuell bevis-input (valgfritt)</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Lim inn filinnhold for bredere sjekker</span>
              {showEvidence ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </div>
        </CardHeader>
        {showEvidence && (
          <CardContent className="pt-0 space-y-3">
            <div>
              <label className="text-xs font-medium text-amber-700 flex items-center gap-1 mb-1">
                <AlertTriangle className="w-3 h-3" /> PhaseExecutionLog.jsx — innhold (for placeholder-check)
              </label>
              <textarea
                rows={3}
                value={manualEvidence.phaseLog}
                onChange={e => setManualEvidence(p => ({ ...p, phaseLog: e.target.value }))}
                placeholder="Lim inn råinnhold fra src/components/governance/PhaseExecutionLog.jsx..."
                className="w-full text-xs border border-amber-200 rounded px-2 py-1.5 bg-amber-50 focus:outline-none focus:border-amber-400 resize-y font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-amber-700 flex items-center gap-1 mb-1">
                <AlertTriangle className="w-3 h-3" /> App.jsx — innhold (for routing-check)
              </label>
              <textarea
                rows={3}
                value={manualEvidence.appJsx}
                onChange={e => setManualEvidence(p => ({ ...p, appJsx: e.target.value }))}
                placeholder="Lim inn råinnhold fra src/App.jsx..."
                className="w-full text-xs border border-amber-200 rounded px-2 py-1.5 bg-amber-50 focus:outline-none focus:border-amber-400 resize-y font-mono"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Run button */}
      <button
        onClick={handleRun}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded transition-colors"
      >
        <Play className="w-4 h-4" />
        Kjør audit
      </button>

      {/* Results */}
      {hasRun && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-700">Resultat</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {checks.map(c => (
              <div key={c.id} className="border border-slate-100 rounded p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-800">{c.title}</span>
                  <div className="flex items-center gap-1.5">
                    <EvidenceLabel source={c.evidenceSource} />
                    <StatusBadge status={c.status} />
                  </div>
                </div>
                <ul className="space-y-0.5">
                  {c.findings.map((f, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <span className="mt-0.5 shrink-0">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {c.manualRequired && (
                  <p className="text-xs text-blue-600 italic">Åpne manual evidence-input ovenfor for å aktivere denne sjekken fullt ut.</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Structured output */}
      {hasRun && auditObject && (
        <Card>
          <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowOutput(v => !v)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-700">Strukturert audit-output</CardTitle>
              <div className="flex items-center gap-2">
                <EvidenceLabel source={auditObject.evidenceSource} />
                {showOutput ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
          </CardHeader>
          {showOutput && (
            <CardContent className="pt-0 space-y-3">
              {auditObject.manualEvidenceUsed && (
                <div className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>Dette resultatet inkluderer manuelt oppgitte verdier. Verifiser evidens før bruk.</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <CopyBtn value={auditText} label="Kopier som tekst (Orchestrator)" />
                <CopyBtn value={githubIssueText} label="Kopier GitHub Issue" />
                <CopyBtn value={auditJson} label="Kopier JSON" />
              </div>

              <pre className="text-xs font-mono bg-slate-50 border border-slate-100 rounded p-3 whitespace-pre-wrap text-slate-700 max-h-60 overflow-y-auto">
                {auditText}
              </pre>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
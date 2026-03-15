/**
 * INSTALL_READINESS_CHECK
 *
 * Read-only component that checks whether canonical GovernanceHub
 * governance files already exist in a connected target repository.
 *
 * Determines install readiness BEFORE the starter-kit install prompt
 * is shown or acted upon. No writes, no installs, no routing changes.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2, Circle, Loader2, RefreshCw } from "lucide-react";
import { useActiveRepo } from "@/components/ActiveRepoContext";
import { base44 } from "@/api/base44Client";

// ── Canonical governance files to check (exact paths, case-sensitive) ──────────

const CHECKED_FILES = [
  {
    path: "src/components/governance/AI_STATE.jsx",
    label: "AI_STATE",
    module: "governance",
  },
  {
    path: "src/components/governance/PhaseExecutionLog.jsx",
    label: "PhaseExecutionLog",
    module: "governance",
  },
  {
    path: "src/components/governance/LockedFiles.jsx",
    label: "LockedFiles",
    module: "governance",
  },
  {
    path: "src/components/projects/PROJECT_REGISTRY.jsx",
    label: "PROJECT_REGISTRY",
    module: "projects",
  },
];

// ── Readiness states ───────────────────────────────────────────────────────────

const READINESS = {
  idle:                         { label: "Ikke kontrollert",         color: "bg-slate-100 text-slate-600 border-slate-200" },
  checking:                     { label: "Sjekker…",                 color: "bg-blue-50 text-blue-700 border-blue-200" },
  safe_to_install:              { label: "Klar for installasjon",    color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  existing_governance_detected: { label: "Eksisterende governance",  color: "bg-red-50 text-red-700 border-red-200" },
  partial_governance_detected:  { label: "Delvis governance",        color: "bg-amber-50 text-amber-700 border-amber-200" },
  repo_not_connected:           { label: "Repo ikke tilkoblet",      color: "bg-slate-100 text-slate-500 border-slate-200" },
  verification_failed:          { label: "Verifisering feilet",      color: "bg-red-50 text-red-600 border-red-200" },
};

function deriveReadiness(results) {
  const found = results.filter((r) => r.exists === true).length;
  const failed = results.filter((r) => r.error && !r.notFound).length;
  const total  = results.length;

  if (failed > 0)     return "verification_failed";
  if (found === 0)    return "safe_to_install";
  if (found === total) return "existing_governance_detected";
  return "partial_governance_detected";
}

function recommendation(state) {
  switch (state) {
    case "safe_to_install":              return "Ingen eksisterende governance-filer funnet — trygt å installere starter kit.";
    case "existing_governance_detected": return "Alle sjekket filer eksisterer allerede — ikke installer blindt. Gjør en audit/merge-vurdering først.";
    case "partial_governance_detected":  return "Noen filer eksisterer, andre mangler — audit/merge kreves før installasjon.";
    case "verification_failed":          return "En eller flere filer kunne ikke verifiseres — bekreft repo-tilgang og prøv igjen.";
    case "repo_not_connected":           return "Velg et aktivt repo for å kjøre readiness-sjekk.";
    default:                             return "Kjør readiness-sjekk for å se installasjonsstatus.";
  }
}

function ReadinessIcon({ state }) {
  const cls = "w-4 h-4 shrink-0";
  if (state === "safe_to_install")              return <ShieldCheck className={`${cls} text-emerald-600`} />;
  if (state === "existing_governance_detected") return <XCircle className={`${cls} text-red-600`} />;
  if (state === "partial_governance_detected")  return <AlertTriangle className={`${cls} text-amber-600`} />;
  if (state === "verification_failed")          return <AlertTriangle className={`${cls} text-red-500`} />;
  return <Circle className={`${cls} text-slate-400`} />;
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function InstallReadinessCheck() {
  const { activeRepo } = useActiveRepo();
  const [results, setResults]       = useState([]);   // [{ path, label, exists, notFound, error }]
  const [readiness, setReadiness]   = useState("idle");
  const [checking, setChecking]     = useState(false);
  const [checkedRepo, setCheckedRepo] = useState(null);

  async function runCheck() {
    if (!activeRepo) return;
    setChecking(true);
    setReadiness("checking");
    setResults([]);

    const checks = await Promise.all(
      CHECKED_FILES.map(async (f) => {
        try {
          const res = await base44.functions.invoke("getGithubRepoContents", {
            owner: activeRepo.owner,
            repo:  activeRepo.repo,
            path:  f.path,
          });
          // Success → file exists
          if (res.data?.success) {
            return { ...f, exists: true, notFound: false, error: null };
          }
          // Error response
          const errMsg = res.data?.error ?? res.data?.message ?? "unknown";
          // GitHub 404 → file simply does not exist
          const isNotFound = errMsg === "Not Found" || res.status === 404;
          return { ...f, exists: false, notFound: isNotFound, error: isNotFound ? null : errMsg };
        } catch (e) {
          return { ...f, exists: false, notFound: false, error: e.message ?? "request failed" };
        }
      })
    );

    const state = deriveReadiness(checks);
    setResults(checks);
    setReadiness(state);
    setCheckedRepo(`${activeRepo.owner}/${activeRepo.repo}`);
    setChecking(false);
  }

  // Derive `repo_not_connected` when no repo is selected and no check has run yet.
  // `idle` is reserved strictly for the untouched initial state before any evaluation.
  const effectiveReadiness = (!activeRepo && readiness === "idle") ? "repo_not_connected" : readiness;

  const meta = READINESS[effectiveReadiness] ?? READINESS.idle;
  const existCount  = results.filter((r) => r.exists).length;
  const missingCount = results.filter((r) => !r.exists && !r.error).length;
  const errorCount  = results.filter((r) => r.error).length;

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
            <ReadinessIcon state={readiness} />
            Install Readiness Check
          </CardTitle>
          <div className="flex items-center gap-2">
            {readiness !== "idle" && (
              <Badge className={`text-xs border ${meta.color}`}>
                {meta.label}
              </Badge>
            )}
            <button
              onClick={runCheck}
              disabled={!activeRepo || checking}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:border-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {checking
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Sjekker…</>
                : <><RefreshCw className="w-3 h-3" /> {readiness === "idle" ? "Kjør sjekk" : "Kjør igjen"}</>
              }
            </button>
          </div>
        </div>

        {/* Recommendation */}
        <p className="text-xs text-slate-500 mt-1">{recommendation(readiness)}</p>

        {/* Checked-against repo label */}
        {checkedRepo && (
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Sjekket: {checkedRepo}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-1">
        {/* No repo selected */}
        {!activeRepo && readiness === "idle" && (
          <p className="text-xs text-slate-400 text-center py-2">
            Velg et aktivt repo for å kjøre readiness-sjekk.
          </p>
        )}

        {/* File results */}
        {results.length > 0 && (
          <ul className="space-y-1 pt-1">
            {results.map((r) => (
              <li key={r.path} className="flex items-start gap-2 text-xs">
                {r.exists
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                  : r.error
                    ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    : <Circle className="w-3.5 h-3.5 text-slate-300 mt-0.5 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <span className={`font-mono ${r.exists ? "text-red-700" : r.error ? "text-amber-700" : "text-slate-400"}`}>
                    {r.path}
                  </span>
                  {r.exists && (
                    <span className="ml-1.5 text-red-600 font-medium">eksisterer</span>
                  )}
                  {!r.exists && !r.error && (
                    <span className="ml-1.5 text-emerald-600">mangler</span>
                  )}
                  {r.error && (
                    <span className="ml-1.5 text-amber-600">feil: {r.error}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Summary row */}
        {results.length > 0 && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span><span className="font-medium text-red-600">{existCount}</span> eksisterer</span>
            <span><span className="font-medium text-emerald-600">{missingCount}</span> mangler</span>
            {errorCount > 0 && (
              <span><span className="font-medium text-amber-600">{errorCount}</span> feil</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
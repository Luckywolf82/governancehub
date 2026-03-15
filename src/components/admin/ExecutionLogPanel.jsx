import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Clock, ExternalLink, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { PHASE_EXECUTION_LOG } from "@/components/governance/PhaseExecutionLog";

// ── Lifecycle status helpers ──────────────────────────────────────────────────
// githubVisibility is currently a free-text field. We derive a display status
// from it until a structured lifecycleStatus field is added to the schema.

function deriveVisibilityStatus(githubVisibility) {
  if (!githubVisibility) return "unknown";
  const v = githubVisibility.toLowerCase();
  if (v.includes("not yet verified")) return "unverified";
  if (v.includes("not recorded")) return "unverified";
  if (v.includes("pending")) return "unverified";
  if (v.includes("verified")) return "verified";
  if (v.includes("files exist")) return "verified";
  return "unknown";
}

function VisibilityBadge({ githubVisibility }) {
  const status = deriveVisibilityStatus(githubVisibility);
  if (status === "verified") {
    return (
      <Badge className="bg-green-100 text-green-700 text-xs flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> Verified
      </Badge>
    );
  }
  if (status === "unverified") {
    return (
      <Badge className="bg-amber-100 text-amber-700 text-xs flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" /> Not yet verified
      </Badge>
    );
  }
  return (
    <Badge className="bg-slate-100 text-slate-500 text-xs flex items-center gap-1">
      <Clock className="w-3 h-3" /> Unknown
    </Badge>
  );
}

// ── Entry row ─────────────────────────────────────────────────────────────────

function EntryRow({ entry }) {
  const [expanded, setExpanded] = useState(false);
  const status = deriveVisibilityStatus(entry.githubVisibility);
  const isUnverified = status === "unverified";

  const repoBase = "https://github.com/Luckywolf82/governancehub";

  return (
    <div className={`border rounded-lg mb-2 transition-colors ${isUnverified ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
      <button
        className="w-full text-left px-4 py-3 flex items-center gap-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="shrink-0 w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
          {entry.id.replace("Entry ", "")}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-800 truncate">{entry.task}</span>
            <VisibilityBadge githubVisibility={entry.githubVisibility} />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{entry.date || "Date not recorded"}</p>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        }
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
          {entry.taskRequested && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-0.5">Task requested</p>
              <p className="text-xs text-slate-500">{entry.taskRequested}</p>
            </div>
          )}

          {entry.changedFiles && entry.changedFiles.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Changed files</p>
              <div className="flex flex-col gap-0.5">
                {(Array.isArray(entry.changedFiles) ? entry.changedFiles : [entry.changedFiles]).map((f) => (
                  <div key={f} className="flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                    <a
                      href={`${repoBase}/blob/main/${f}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-blue-600 hover:underline truncate"
                    >
                      {f}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {entry.diffSummary && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Diff summary</p>
              {Array.isArray(entry.diffSummary)
                ? (
                  <ul className="space-y-0.5 list-disc list-inside">
                    {entry.diffSummary.map((line, i) => (
                      <li key={i} className="text-xs text-slate-500">{line}</li>
                    ))}
                  </ul>
                )
                : <p className="text-xs text-slate-500">{entry.diffSummary}</p>
              }
            </div>
          )}

          <div className={`rounded p-3 ${isUnverified ? "bg-amber-100 border border-amber-200" : "bg-green-50 border border-green-200"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 mb-0.5">GitHub visibility</p>
                <p className="text-xs text-slate-600">{entry.githubVisibility}</p>
              </div>
              {isUnverified && (
                <a
                  href={`${repoBase}/commits/main`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded border border-amber-400 text-amber-800 bg-white hover:bg-amber-50 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Verify on GitHub
                </a>
              )}
            </div>
          </div>

          {entry.lockedFileVerification && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-0.5">Locked file verification</p>
              <p className="text-xs text-slate-500">{entry.lockedFileVerification}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ExecutionLogPanel() {
  const entries = [...(PHASE_EXECUTION_LOG.entries ?? [])].reverse();
  const unverifiedCount = entries.filter(
    (e) => deriveVisibilityStatus(e.githubVisibility) === "unverified"
  ).length;
  const verifiedCount = entries.filter(
    (e) => deriveVisibilityStatus(e.githubVisibility) === "verified"
  ).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base text-slate-800">Execution Log</CardTitle>
          <div className="flex items-center gap-2">
            {unverifiedCount > 0 && (
              <Badge className="bg-amber-100 text-amber-700 text-xs flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {unverifiedCount} not yet verified
              </Badge>
            )}
            <Badge className="bg-green-100 text-green-700 text-xs">
              {verifiedCount} verified
            </Badge>
            <Badge className="bg-slate-100 text-slate-500 text-xs">
              {entries.length} total
            </Badge>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Governance execution log — most recent first. Amber entries have not yet been verified in GitHub.
        </p>
        {unverifiedCount > 0 && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-amber-800 mt-2">
            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
            <span>
              <strong>{unverifiedCount} {unverifiedCount === 1 ? "entry" : "entries"} pending post-merge verification.</strong>
              {" "}Open each entry and use the "Verify on GitHub" link to confirm visibility after merge.
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No execution log entries found.</p>
        ) : (
          entries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
  );
}

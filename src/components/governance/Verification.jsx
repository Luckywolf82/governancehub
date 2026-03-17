// Verification — governance-bound, read-only verification surface
// gov-006 Phase 10 — created 2026-03-16
// Project: GovernanceHub (projectId: governancehub, projectSlug: governancehub)
//
// This component is a controlled, governance-bound verification surface.
// It is downstream of ExecutionWorker and may only inspect currently available
// governed data and execution evidence expectations already defined upstream.
//
// STRICTLY FORBIDDEN in this file:
//   fetch() — axios() — GitHub API calls — PR inspection — commit inspection
//   registry mutation — synthetic evidence — fabricated verification success
//   external repository verification — background jobs — network calls
//
// This component does NOT perform external verification.
// External execution is not connected in this phase.
// No execution evidence has been produced. No verification can be completed.
// This component reports that state truthfully.
//
// Source artifacts (read-only):
//   ExecutionWorkerSpec.jsx          — canonical execution worker contract (required evidence)
//   ChangePlanInstanceRegistry.jsx   — canonical registry of plan instances
//   DispatchAuthorizationSpec.jsx    — dispatch authorization spec (metadata reference)

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lock,
  ShieldOff,
  AlertTriangle,
  XCircle,
  MinusCircle,
  Search,
  ClipboardList,
} from "lucide-react";

import {
  CHANGE_PLAN_INSTANCE_REGISTRY,
} from "@/components/governance/ChangePlanInstanceRegistry";

import {
  specMeta as workerSpecMeta,
  executionWorkerRequiredEvidence,
} from "@/components/governance/ExecutionWorkerSpec";

import {
  specMeta as dispatchSpecMeta,
} from "@/components/governance/DispatchAuthorizationSpec";

import {
  verificationStatusVocabulary,
} from "@/components/governance/VerificationSpec";
// Verification status vocabulary aligned with VerificationSpec

// PHASE_EXECUTION_LOG imported read-only — for structural reference only.
// DO NOT mutate entries. DO NOT push to entries array.
import { PHASE_EXECUTION_LOG } from "@/components/governance/PhaseExecutionLog";

// ── Evidence availability evaluator ───────────────────────────────────────────
// Pure function — no side effects, no state mutation, no inferred values.
// Returns an array of evidence check results for a single registry entry.
// Conservative and truthful: evidence fields that are absent or null because
// external execution is not connected are explicitly labelled as missing.

function evaluateEvidence(entry) {
  return executionWorkerRequiredEvidence.map((ev) => {
    const { evidenceId, label, required } = ev;
    const value = entry[label];
    const present =
      value !== null && value !== undefined && value !== "" &&
      !(Array.isArray(value) && value.length === 0);

    return {
      evidenceId,
      label,
      required,
      present,
      value: present ? value : null,
      reason: present
        ? `Present: ${Array.isArray(value) ? JSON.stringify(value) : String(value)}`
        : "Not present — execution evidence has not been produced. " +
          "External execution is not connected in this phase.",
    };
  });
}

// ── Derive verification status ─────────────────────────────────────────────────
// Pure read-only derivation.
// Returns a value from verificationStatusVocabulary: "verified" | "incomplete" | "unverifiable"
//
// Conservative rule:
//   - Any required evidence missing → "unverifiable" (if execution not connected at all)
//     or "incomplete" (if some evidence is present but not all)
//   - All required evidence present → "verified"
//     (Note: "verified" here means all required fields are present in governed data —
//      it does NOT mean external repository verification was performed)

// Status string constants sourced from spec vocabulary (spec as source of truth)
const VERIFIED_STATUS = verificationStatusVocabulary.find((v) => v.status === "verified").status;

function deriveVerificationStatus(evidenceResults) {
  if (!Array.isArray(evidenceResults) || evidenceResults.length === 0) {
    return "unverifiable";
  }
  const requiredResults = evidenceResults.filter((r) => r.required);
  const allPresent = requiredResults.every((r) => r.present);
  if (allPresent) return VERIFIED_STATUS;
  const anyPresent = requiredResults.some((r) => r.present);
  if (anyPresent) return "incomplete";
  return "unverifiable";
}

// ── Governance notice banner ───────────────────────────────────────────────────

function GovernanceNoticeBanner() {
  return (
    <div className="rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 space-y-1">
      <div className="flex items-center gap-2 font-semibold">
        <Lock className="h-4 w-4 shrink-0" />
        Verification Governance Boundary — External Verification Not Connected
      </div>
      <ul className="list-disc pl-5 space-y-0.5">
        <li>This verification surface is read-only and governance-bound. No verification actions may be performed here.</li>
        <li>External repository verification is not connected in this phase. No GitHub API calls, PR inspection, or commit inspection will occur.</li>
        <li>Verification is limited to currently available governed data in this repository only.</li>
        <li>Execution evidence has not been produced — external execution is not connected. No verification result can be derived from absent evidence.</li>
        <li>A verification status of &quot;unverifiable&quot; is the correct and truthful result when execution evidence is not present.</li>
      </ul>
    </div>
  );
}

// ── Verification status badge ──────────────────────────────────────────────────

function VerificationStatusBadge({ status }) {
  if (status === VERIFIED_STATUS) {
    return (
      <Badge className="bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 w-fit">
        <ClipboardList className="h-3 w-3 shrink-0" />
        Verification Data Complete
      </Badge>
    );
  }
  if (status === "incomplete") {
    return (
      <Badge className="bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
        <MinusCircle className="h-3 w-3 shrink-0" />
        Verification Incomplete
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 border border-red-200 flex items-center gap-1 w-fit">
      <ShieldOff className="h-3 w-3 shrink-0" />
      Unverifiable from Current Governed Data
    </Badge>
  );
}

// ── Evidence result row ────────────────────────────────────────────────────────

function EvidenceResultRow({ result }) {
  const icon = result.present ? (
    <ClipboardList className="h-4 w-4 text-blue-500 shrink-0" />
  ) : (
    <XCircle className="h-4 w-4 text-red-500 shrink-0" />
  );

  const reasonColor = result.present ? "text-slate-500" : "text-red-600";

  return (
    <div className="flex items-start gap-2 text-sm py-1 border-b border-slate-100 last:border-0">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-slate-700">{result.label}</span>
          <span className="text-xs text-slate-400 font-mono">{result.evidenceId}</span>
          {result.required && !result.present && (
            <span className="text-xs text-red-500 font-medium">required — missing</span>
          )}
        </div>
        <div className={`text-xs mt-0.5 ${reasonColor}`}>{result.reason}</div>
      </div>
    </div>
  );
}

// ── Field row helper ───────────────────────────────────────────────────────────

function FieldRow({ label, value }) {
  return (
    <div className="flex gap-1 flex-wrap">
      <span className="font-medium text-slate-500">{label}:</span>
      <span className="text-slate-700 break-all">
        {value !== null && value !== undefined && value !== ""
          ? String(value)
          : <span className="italic text-slate-400">null</span>}
      </span>
    </div>
  );
}

// ── Verification truthfulness block ───────────────────────────────────────────
// Explicitly states why verification is incomplete or unverifiable.

function VerificationTruthfulnessBlock({ status, missingCount, totalRequired }) {
  if (status === VERIFIED_STATUS) {
    return (
      <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-3 space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wide">
          <Search className="h-3.5 w-3.5 shrink-0" />
          Verification Assessment
        </div>
        <div className="text-xs text-blue-800">
          All required execution evidence fields are present in current governed data.
          However, verification completeness from governed data alone does not constitute
          external repository verification. No external repository, PR, or commit has been
          independently verified in this phase.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 space-y-1">
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-wide">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        Verification Incomplete — Required Evidence Not Present
      </div>
      <div className="text-xs text-amber-800 space-y-0.5">
        <div className="font-medium">
          {status === "unverifiable"
            ? "Verification incomplete — required execution evidence not yet produced."
            : `Verification blocked — ${missingCount} of ${totalRequired} required evidence fields are missing.`}
        </div>
        <ul className="list-disc pl-4 space-y-0.5 text-amber-700">
          <li>External execution is not connected in this phase.</li>
          <li>No execution evidence has been produced by the execution worker.</li>
          <li>External repository verification is unavailable in this phase.</li>
          <li>No verification result will be fabricated from absent evidence.</li>
          <li>
            Unverifiable from current governed data — verification requires execution
            evidence that has not yet been produced.
          </li>
        </ul>
      </div>
    </div>
  );
}

// ── Per-instance verification card ────────────────────────────────────────────

function VerificationInstanceCard({ entry }) {
  const evidenceResults = evaluateEvidence(entry);
  const status = deriveVerificationStatus(evidenceResults);
  const requiredResults = evidenceResults.filter((r) => r.required);
  const missingCount = requiredResults.filter((r) => !r.present).length;

  // Preview-only helper — reads current verification result and logs it.
  // Does NOT write to PhaseExecutionLog, does NOT mutate state.
  function handleRecordVerificationResult() {
    const missingEvidence = requiredResults
      .filter((r) => !r.present)
      .map((r) => r.label);

    console.log({
      verificationStatus: status,
      missingEvidence,
      verificationNotes: "manual entry",
    });
  }

  // Builds a structured log entry preview — read-only, no mutation, no persistence.
  // References PHASE_EXECUTION_LOG for structural awareness only.
  // Does NOT push to PHASE_EXECUTION_LOG.entries. Does NOT mutate anything.
  function buildVerificationLogEntry() {
    const missingEvidence = requiredResults
      .filter((r) => !r.present)
      .map((r) => r.label);

    // Structural reference: PHASE_EXECUTION_LOG.entrySchema defines expected optional fields
    // (verificationStatus, missingEvidence, verificationNotes) — read-only, no mutation.
    void PHASE_EXECUTION_LOG.entrySchema;

    return {
      targetRef: {
        type: "plan_instance",
        id: entry.planId,
      },
      verificationStatus: status,
      missingEvidence,
      verificationNotes: "manual entry",
      timestamp: new Date().toISOString(),
    };
  }

  return (
    <Card className="border border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-800">
              {entry.title ?? <span className="italic text-slate-400">No title</span>}
            </CardTitle>
            <div className="text-xs text-slate-500 mt-0.5 font-mono">{entry.planId}</div>
          </div>
          <VerificationStatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">

        {/* Registry identity fields */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
          <FieldRow label="Repo" value={entry.repoFullName} />
          <FieldRow label="Lifecycle Stage" value={entry.lifecycleStage} />
          <FieldRow label="Execution Status" value={entry.executionStatus} />
          <FieldRow label="Verification Branch" value={entry.verificationBranch} />
          <FieldRow label="Verification Target Type" value={entry.verificationTargetType} />
          <FieldRow label="Verification Target Value" value={entry.verificationTargetValue} />
        </div>

        {/* Evidence availability */}
        <div>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Required Execution Evidence ({requiredResults.filter((r) => r.present).length}/{requiredResults.length} present)
            </span>
            {missingCount > 0 && (
              <span className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                {missingCount} missing
              </span>
            )}
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 divide-y divide-slate-100">
            {evidenceResults.map((result) => (
              <EvidenceResultRow key={result.evidenceId} result={result} />
            ))}
          </div>
        </div>

        {/* Verification truthfulness assessment */}
        <VerificationTruthfulnessBlock
          status={status}
          missingCount={missingCount}
          totalRequired={requiredResults.length}
        />

        {/* Preview-only action — no persistence */}
        <div className="pt-1 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label="Preview verification result without saving"
            onClick={handleRecordVerificationResult}
          >
            Record verification result (preview)
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Prepare log entry preview — no persistence"
            onClick={() => {
              const entry = buildVerificationLogEntry();
              console.log("VERIFICATION LOG ENTRY PREVIEW:", entry);
            }}
          >
            Prepare log entry
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}

// ── Empty registry state ───────────────────────────────────────────────────────

function EmptyRegistryState() {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 space-y-2">
      <div className="font-semibold text-slate-600">No governed plan instances available for verification</div>
      <div>
        CHANGE_PLAN_INSTANCE_REGISTRY currently contains no plan instances.
      </div>
      <div className="text-xs text-slate-400 space-y-1">
        <div>No verification result can be produced — no registry entries exist to evaluate.</div>
        <div>No result will be fabricated. An empty registry is the correct and truthful initial state.</div>
        <div>Real plan instances may only be added by future verified runtime layers.</div>
      </div>
    </div>
  );
}

// ── Spec metadata strip ────────────────────────────────────────────────────────

function SpecMetaStrip() {
  const { meta } = CHANGE_PLAN_INSTANCE_REGISTRY;
  return (
    <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-0.5 border border-slate-100 bg-slate-50 rounded px-3 py-2">
      <span><span className="font-medium text-slate-500">Worker Spec:</span> {workerSpecMeta.specId} v{workerSpecMeta.version}</span>
      <span><span className="font-medium text-slate-500">Phase:</span> {workerSpecMeta.phase}</span>
      <span><span className="font-medium text-slate-500">Dispatch Spec:</span> {dispatchSpecMeta.specId} v{dispatchSpecMeta.version}</span>
      <span><span className="font-medium text-slate-500">Registry:</span> {meta.artifactId}</span>
      <span><span className="font-medium text-slate-500">Required Evidence Fields:</span> {executionWorkerRequiredEvidence.length}</span>
      <span><span className="font-medium text-slate-500">Execution Implemented:</span> {String(workerSpecMeta.executionImplemented)}</span>
      <span><span className="font-medium text-slate-500">External Verification:</span> not connected</span>
    </div>
  );
}

// ── Default export ─────────────────────────────────────────────────────────────

export default function Verification() {
  const entries = CHANGE_PLAN_INSTANCE_REGISTRY.entries;

  return (
    <div className="space-y-4">

      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
          Verification
        </p>
        <p className="text-sm text-slate-500">
          Governance-bound verification surface. Evaluates whether execution evidence is
          present from currently available governed data. External repository verification
          is not connected in this phase.
        </p>
      </div>

      <GovernanceNoticeBanner />

      <SpecMetaStrip />

      {entries.length === 0 ? (
        <EmptyRegistryState />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <VerificationInstanceCard key={entry.planId} entry={entry} />
          ))}
        </div>
      )}

    </div>
  );
}

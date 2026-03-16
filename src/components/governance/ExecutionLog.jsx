// ExecutionLog — governance-bound, read-only downstream lifecycle log surface
// gov-006 Phase 11 — created 2026-03-16
// Project: GovernanceHub (projectId: governancehub, projectSlug: governancehub)
//
// This component is the final canonical step in the governed execution pipeline.
// It is a READ-ONLY / DERIVED governance log surface.
// It is downstream of Verification and may only summarise or log what upstream
// governed artifacts actually support.
//
// STRICTLY FORBIDDEN in this file:
//   fetch() — axios() — GitHub API calls — PR inspection — commit inspection
//   registry mutation — synthetic entries — fabricated lifecycle completion
//   hidden async side effects — fabricated execution outcomes
//   fabricated verification results — fabricated pull-request evidence
//
// This component does NOT:
//   - fabricate completed executions
//   - fabricate verification success
//   - fabricate repository changes
//   - fabricate pull requests
//   - fabricate produced evidence
//   - mutate registry state
//   - perform network calls
//   - read external repositories
//   - inspect GitHub APIs
//   - write back into other governance artifacts
//
// It ONLY derives a conservative lifecycle log from currently available governed data.
// If execution and verification remain incomplete, the log reflects that truthfully.
//
// Source artifacts (read-only):
//   ChangePlanInstanceRegistry.jsx   — canonical registry of plan instances
//   ExecutionWorkerSpec.jsx          — required execution evidence contract
//   DispatchAuthorizationSpec.jsx    — dispatch authorization spec metadata

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  AlertTriangle,
  XCircle,
  MinusCircle,
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

// ── Lifecycle checkpoint evaluator ────────────────────────────────────────────
// Pure function — no side effects, no state mutation, no inferred values.
// Derives a conservative checkpoint summary from a single registry entry.
// Returns an array of checkpoint objects with status: "present" | "absent" | "not-evaluable"

function deriveLifecycleCheckpoints(entry) {
  // Checkpoint 1: Plan reference
  const planRefPresent =
    typeof entry.planId === "string" && entry.planId.trim().length > 0;

  // Checkpoint 2: Prompt reference
  const promptRefPresent =
    entry.promptId !== null && entry.promptId !== undefined && entry.promptId !== "";

  // Checkpoint 3: Dispatch review state
  const dispatchReviewReached =
    entry.dispatchStatus !== null &&
    entry.dispatchStatus !== undefined &&
    entry.dispatchStatus !== "" &&
    entry.dispatchStatus !== "not-started";

  // Checkpoint 4: Execution review state — can only assess whether lifecycle shows progress
  // beyond 'dispatched'; actual execution is not connected in this phase
  const lifecycleStage = entry.lifecycleStage ?? null;
  const executionStatusValue = entry.executionStatus ?? null;
  const executionReviewEligible =
    lifecycleStage === "executing" ||
    lifecycleStage === "execution-complete" ||
    lifecycleStage === "executed" ||
    lifecycleStage === "verified";

  // Checkpoint 5: Verification state
  const verificationStatusValue = entry.verificationStatus ?? null;
  const verificationComplete =
    verificationStatusValue === "verified" || verificationStatusValue === "complete";

  // Checkpoint 6: Execution evidence — check all required evidence fields
  const evidenceResults = executionWorkerRequiredEvidence.map((ev) => {
    const value = entry[ev.label];
    const present =
      value !== null && value !== undefined && value !== "" &&
      !(Array.isArray(value) && value.length === 0);
    return { ...ev, present };
  });
  const requiredEvidence = evidenceResults.filter((e) => e.required);
  const allEvidencePresent = requiredEvidence.every((e) => e.present);
  const anyEvidencePresent = requiredEvidence.some((e) => e.present);
  const missingEvidenceCount = requiredEvidence.filter((e) => !e.present).length;

  return {
    planRef: {
      label: "Plan reference",
      status: planRefPresent ? "present" : "absent",
      detail: planRefPresent
        ? `planId: ${entry.planId}`
        : "planId is absent or empty — no plan reference can be confirmed.",
    },
    promptRef: {
      label: "Prompt reference",
      status: promptRefPresent ? "present" : "absent",
      detail: promptRefPresent
        ? `promptId: ${entry.promptId}`
        : "promptId is null — no governed prompt reference has been recorded.",
    },
    dispatchReview: {
      label: "Dispatch review state",
      status: dispatchReviewReached ? "present" : "absent",
      detail: dispatchReviewReached
        ? `dispatchStatus: ${entry.dispatchStatus}`
        : "dispatchStatus is not set or has not progressed past 'not-started'.",
    },
    executionReview: {
      label: "Execution review state",
      status: executionReviewEligible
        ? "present"
        : executionStatusValue !== null
          ? "not-evaluable"
          : "absent",
      detail: executionReviewEligible
        ? `lifecycleStage: ${lifecycleStage} / executionStatus: ${executionStatusValue ?? "null"}`
        : executionStatusValue !== null
          ? `executionStatus is '${executionStatusValue}' — execution review is blocked or not yet eligible.`
          : "executionStatus is null — execution is not connected in this phase. Execution review cannot be evaluated.",
    },
    verification: {
      label: "Verification state",
      status: verificationComplete
        ? "present"
        : verificationStatusValue !== null
          ? "not-evaluable"
          : "absent",
      detail: verificationComplete
        ? `verificationStatus: ${verificationStatusValue}`
        : verificationStatusValue !== null
          ? `verificationStatus is '${verificationStatusValue}' — verification is incomplete.`
          : "verificationStatus is null — verification has not been completed.",
    },
    evidence: {
      label: "Required execution evidence",
      status: allEvidencePresent
        ? "present"
        : anyEvidencePresent
          ? "not-evaluable"
          : "absent",
      detail: allEvidencePresent
        ? "All required execution evidence fields are present."
        : `${missingEvidenceCount} of ${requiredEvidence.length} required evidence fields are missing. ` +
          "Execution evidence has not been produced — external execution is not connected in this phase.",
    },
    allEvidencePresent,
    anyEvidencePresent,
    missingEvidenceCount,
    totalRequiredEvidence: requiredEvidence.length,
    verificationComplete,
    executionReviewEligible,
  };
}

// ── Derive final log assertability ────────────────────────────────────────────
// Derives whether a final execution log record can be asserted from current governed data.
// Returns: "available" | "incomplete" | "not-assertable"
//
// Conservative rule:
//   - "available" only when ALL checkpoints are fully present (including evidence + verification)
//   - "incomplete" when some checkpoints are present but execution/verification are not complete
//   - "not-assertable" when execution evidence is absent (external execution not connected)

function deriveFinalLogAssertability(checkpoints) {
  if (
    checkpoints.planRef.status === "present" &&
    checkpoints.promptRef.status === "present" &&
    checkpoints.dispatchReview.status === "present" &&
    checkpoints.executionReview.status === "present" &&
    checkpoints.verification.status === "present" &&
    checkpoints.evidence.status === "present"
  ) {
    return "available";
  }
  if (
    checkpoints.evidence.status === "absent" ||
    !checkpoints.anyEvidencePresent
  ) {
    return "not-assertable";
  }
  return "incomplete";
}

// ── Governance notice banner ───────────────────────────────────────────────────

function GovernanceNoticeBanner() {
  return (
    <div className="rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 space-y-1">
      <div className="flex items-center gap-2 font-semibold">
        <Lock className="h-4 w-4 shrink-0" />
        ExecutionLog Governance Boundary — Read-Only Derived Log Surface
      </div>
      <ul className="list-disc pl-5 space-y-0.5">
        <li>This log only reflects currently available governed data. It does not fabricate missing execution or verification outcomes.</li>
        <li>No network calls, GitHub API calls, or repository reads are performed. No registry state is mutated.</li>
        <li>Execution evidence has not been produced — external execution is not connected in this phase.</li>
        <li>Verification remains incomplete — no external repository verification has occurred.</li>
        <li>A final execution log record can only be asserted when all lifecycle checkpoints are supported by actual governed data.</li>
        <li>If the system lacks actual execution evidence, this log explicitly shows that no completed execution record can be asserted.</li>
      </ul>
    </div>
  );
}

// ── Log assertability badge ────────────────────────────────────────────────────

function LogAssertabilityBadge({ assertability }) {
  if (assertability === "available") {
    return (
      <Badge className="bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 w-fit">
        <ClipboardList className="h-3 w-3 shrink-0" />
        Final Log Record Available
      </Badge>
    );
  }
  if (assertability === "incomplete") {
    return (
      <Badge className="bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
        <MinusCircle className="h-3 w-3 shrink-0" />
        Lifecycle Log Incomplete
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 border border-red-200 flex items-center gap-1 w-fit">
      <XCircle className="h-3 w-3 shrink-0" />
      No Final Record Assertable from Current Governed Data
    </Badge>
  );
}

// ── Checkpoint status icon ─────────────────────────────────────────────────────

function CheckpointIcon({ status }) {
  if (status === "present") {
    return <ClipboardList className="h-4 w-4 text-blue-500 shrink-0" />;
  }
  if (status === "not-evaluable") {
    return <MinusCircle className="h-4 w-4 text-amber-500 shrink-0" />;
  }
  return <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
}

// ── Checkpoint row ─────────────────────────────────────────────────────────────

function CheckpointRow({ checkpoint }) {
  const detailColor =
    checkpoint.status === "present"
      ? "text-slate-500"
      : checkpoint.status === "not-evaluable"
        ? "text-amber-700"
        : "text-red-600";

  return (
    <div className="flex items-start gap-2 text-sm py-1 border-b border-slate-100 last:border-0">
      <div className="mt-0.5">
        <CheckpointIcon status={checkpoint.status} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-slate-700">{checkpoint.label}</span>
          {checkpoint.status === "absent" && (
            <span className="text-xs text-red-500 font-medium">absent</span>
          )}
          {checkpoint.status === "not-evaluable" && (
            <span className="text-xs text-amber-600 font-medium">not evaluable</span>
          )}
        </div>
        <div className={`text-xs mt-0.5 ${detailColor}`}>{checkpoint.detail}</div>
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

// ── Truthfulness block ─────────────────────────────────────────────────────────
// Explicitly states why a final log record can or cannot be asserted.

function TruthfulnessBlock({ assertability }) {
  if (assertability === "available") {
    return (
      <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-3 space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wide">
          <ClipboardList className="h-3.5 w-3.5 shrink-0" />
          Log Record Assessment
        </div>
        <div className="text-xs text-blue-800">
          All lifecycle checkpoints are supported by current governed data.
          A final execution log record can be asserted.
          Note: this reflects governed data only — it does not constitute external
          repository verification or confirmation of a merged pull request.
        </div>
      </div>
    );
  }

  if (assertability === "incomplete") {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-wide">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Lifecycle Log Incomplete — Not All Checkpoints Supported
        </div>
        <div className="text-xs text-amber-800 space-y-0.5">
          <div className="font-medium">
            Final execution log record cannot yet be asserted — lifecycle log is incomplete.
          </div>
          <ul className="list-disc pl-4 space-y-0.5 text-amber-700">
            <li>Execution evidence partially present but not complete.</li>
            <li>Verification has not been confirmed from governed data.</li>
            <li>No final log record will be fabricated from partial lifecycle data.</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 space-y-1">
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-wide">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        No Final Execution Log Record Can Be Asserted from Current Governed Data
      </div>
      <div className="text-xs text-amber-800 space-y-0.5">
        <div className="font-medium">
          Lifecycle log incomplete — execution evidence not yet produced.
        </div>
        <ul className="list-disc pl-4 space-y-0.5 text-amber-700">
          <li>External execution is not connected in this phase.</li>
          <li>No execution evidence has been produced by the execution worker.</li>
          <li>Verification remains incomplete — no external repository verification has occurred.</li>
          <li>No final execution record will be fabricated from absent evidence.</li>
          <li>
            Unassertable from current governed data — a final log record requires execution
            evidence and verified lifecycle completion that have not yet been produced.
          </li>
        </ul>
      </div>
    </div>
  );
}

// ── Per-instance execution log card ───────────────────────────────────────────

function ExecutionLogInstanceCard({ entry }) {
  const checkpoints = deriveLifecycleCheckpoints(entry);
  const assertability = deriveFinalLogAssertability(checkpoints);

  const checkpointList = [
    checkpoints.planRef,
    checkpoints.promptRef,
    checkpoints.dispatchReview,
    checkpoints.executionReview,
    checkpoints.verification,
    checkpoints.evidence,
  ];

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
          <LogAssertabilityBadge assertability={assertability} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">

        {/* Identity fields */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
          <FieldRow label="Repo" value={entry.repoFullName} />
          <FieldRow label="Lifecycle Stage" value={entry.lifecycleStage} />
          <FieldRow label="Dispatch Status" value={entry.dispatchStatus} />
          <FieldRow label="Execution Status" value={entry.executionStatus} />
          <FieldRow label="Verification Status" value={entry.verificationStatus} />
          <FieldRow label="Execution Log Entry ID" value={entry.executionLogEntryId} />
        </div>

        {/* Lifecycle checkpoints */}
        <div>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Lifecycle Checkpoints
            </span>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 divide-y divide-slate-100">
            {checkpointList.map((cp) => (
              <CheckpointRow key={cp.label} checkpoint={cp} />
            ))}
          </div>
        </div>

        {/* Truthfulness block */}
        <TruthfulnessBlock assertability={assertability} />

      </CardContent>
    </Card>
  );
}

// ── Empty registry state ───────────────────────────────────────────────────────

function EmptyRegistryState() {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 space-y-2">
      <div className="font-semibold text-slate-600">No governed plan instances exist</div>
      <div>
        CHANGE_PLAN_INSTANCE_REGISTRY currently contains no plan instances.
      </div>
      <div className="text-xs text-slate-400 space-y-1">
        <div>No execution lifecycle record can be logged — no registry entries exist to evaluate.</div>
        <div>Nothing will be fabricated. An empty registry is the correct and truthful initial state.</div>
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
      <span><span className="font-medium text-slate-500">Pipeline Step:</span> ExecutionLog (Phase 11)</span>
      <span><span className="font-medium text-slate-500">Execution Implemented:</span> {String(workerSpecMeta.executionImplemented)}</span>
      <span><span className="font-medium text-slate-500">External Verification:</span> not connected</span>
      <span><span className="font-medium text-slate-500">Log Surface:</span> read-only / derived</span>
    </div>
  );
}

// ── Default export ─────────────────────────────────────────────────────────────

export default function ExecutionLog() {
  const entries = CHANGE_PLAN_INSTANCE_REGISTRY.entries;

  return (
    <div className="space-y-4">

      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
          Execution Log
        </p>
        <p className="text-sm text-slate-500">
          Downstream lifecycle log surface. Shows what can truthfully be logged from currently
          available governed data. This is a read-only derived view — it does not fabricate
          execution outcomes, verification results, or repository changes.
        </p>
      </div>

      <GovernanceNoticeBanner />

      <SpecMetaStrip />

      {entries.length === 0 ? (
        <EmptyRegistryState />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <ExecutionLogInstanceCard key={entry.planId} entry={entry} />
          ))}
        </div>
      )}

    </div>
  );
}

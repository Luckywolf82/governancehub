// ExecutionWorker — governance-bound, read-only execution worker surface
// gov-006 Phase 9 — created 2026-03-16
// Project: GovernanceHub (projectId: governancehub, projectSlug: governancehub)
//
// This component is a controlled, governance-bound execution surface.
// It reads governed state from CHANGE_PLAN_INSTANCE_REGISTRY and evaluates
// execution eligibility per ExecutionWorkerSpec preconditions.
//
// STRICTLY FORBIDDEN in this file:
//   dispatch() — execute() — createPR() — fetch() — axios()
//   registry mutation — worker invocation — background jobs
//   synthetic execution success — fabricated evidence artifacts
//   GitHub API calls — repository writes — PR creation
//
// This component does NOT perform external execution.
// External execution is not connected in this phase.
// This is a read-only, simulated execution review surface only.
//
// Source artifacts (read-only):
//   ExecutionWorkerSpec.jsx          — canonical execution worker contract (governing spec)
//   ChangePlanInstanceRegistry.jsx   — canonical registry of plan instances
//   DispatchAuthorizationSpec.jsx    — dispatch authorization spec (metadata reference)

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  ShieldOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Terminal,
  ClipboardList,
} from "lucide-react";

import {
  CHANGE_PLAN_INSTANCE_REGISTRY,
} from "@/components/governance/ChangePlanInstanceRegistry";

import {
  specMeta,
  executionWorkerPreconditions,
  executionWorkerRequiredEvidence,
  executionWorkerFailureModes,
} from "@/components/governance/ExecutionWorkerSpec";

import {
  specMeta as dispatchSpecMeta,
} from "@/components/governance/DispatchAuthorizationSpec";

// ── Read-only precondition evaluator ──────────────────────────────────────────
// Pure function — no side effects, no state mutation, no inferred values.
// Returns an array of precondition results for a single registry entry.
// Conservative and truthful: preconditions that cannot be verified from
// available governed data are explicitly labelled as not-evaluable.

function evaluatePreconditions(entry) {
  return executionWorkerPreconditions.map((precondition) => {
    const { preconditionId } = precondition;

    if (preconditionId === "ep-001") {
      // Plan instance found in registry: planId present and found in entries
      const found = CHANGE_PLAN_INSTANCE_REGISTRY.entries.some(
        (e) => e.planId === entry.planId
      );
      return {
        preconditionId,
        label: precondition.label,
        status: found ? "pass" : "fail",
        reason: found
          ? "Plan instance is present in the canonical registry by planId."
          : "Plan instance not found in CHANGE_PLAN_INSTANCE_REGISTRY by planId.",
        failureModeId: found ? null : "ef-registry-not-found",
      };
    }

    if (preconditionId === "ep-002") {
      // Dispatch authorization 'authorized' — cannot be verified without a dispatch runtime
      return {
        preconditionId,
        label: precondition.label,
        status: "not-evaluable",
        reason:
          "Dispatch authorization runtime is not yet connected in this phase. " +
          "This precondition cannot be fully verified from current governed data alone. " +
          "A future verified dispatch runtime component is required.",
        failureModeId: "ef-authorization-not-confirmed",
      };
    }

    if (preconditionId === "ep-003") {
      // All requiredDispatchConditions satisfied — cannot be verified without dispatch runtime
      return {
        preconditionId,
        label: precondition.label,
        status: "not-evaluable",
        reason:
          "Dispatch conditions verification requires a dispatch authorization runtime " +
          "that is not yet connected in this phase. " +
          "This precondition is an external execution dependency.",
        failureModeId: "ef-dispatch-conditions-unmet",
      };
    }

    if (preconditionId === "ep-004") {
      // approvalStatus must be 'approved'
      const pass = entry.approvalStatus === "approved";
      return {
        preconditionId,
        label: precondition.label,
        status: pass ? "pass" : "fail",
        reason: pass
          ? "approvalStatus is 'approved'."
          : `approvalStatus is "${entry.approvalStatus ?? "null/absent"}" — must be 'approved'.`,
        failureModeId: pass ? null : "ef-approval-status-invalid",
      };
    }

    if (preconditionId === "ep-005") {
      // lifecycleStage must be 'dispatched'
      const pass = entry.lifecycleStage === "dispatched";
      return {
        preconditionId,
        label: precondition.label,
        status: pass ? "pass" : "fail",
        reason: pass
          ? "lifecycleStage is 'dispatched'."
          : `lifecycleStage is "${entry.lifecycleStage ?? "null/absent"}" — must be 'dispatched'.`,
        failureModeId: pass ? null : "ef-lifecycle-stage-invalid",
      };
    }

    if (preconditionId === "ep-006") {
      // repoFullName must be present and match owner/repo
      const repo = entry.repoFullName;
      const pass =
        typeof repo === "string" &&
        repo.trim().length > 0 &&
        /^[^/\s]+\/[^/\s]+$/.test(repo.trim());
      return {
        preconditionId,
        label: precondition.label,
        status: pass ? "pass" : "fail",
        reason: pass
          ? `Repo binding confirmed: ${repo}.`
          : repo
          ? `repoFullName "${repo}" does not match expected 'owner/repo' format.`
          : "repoFullName is absent or empty — repo binding not confirmed.",
        failureModeId: pass ? null : "ef-repo-binding-invalid",
      };
    }

    if (preconditionId === "ep-007") {
      // promptId must be non-null
      const pass =
        entry.promptId !== null &&
        entry.promptId !== undefined &&
        entry.promptId !== "";
      return {
        preconditionId,
        label: precondition.label,
        status: pass ? "pass" : "fail",
        reason: pass
          ? `Prompt linked: ${entry.promptId}.`
          : "promptId is null or absent — no governed prompt is linked to this instance.",
        failureModeId: pass ? null : "ef-prompt-not-linked",
      };
    }

    if (preconditionId === "ep-008") {
      // singleStepOnly must be true
      const pass = entry.singleStepOnly === true;
      return {
        preconditionId,
        label: precondition.label,
        status: pass ? "pass" : "fail",
        reason: pass
          ? "singleStepOnly is true — single-step constraint satisfied."
          : `singleStepOnly is ${entry.singleStepOnly ?? "null/absent"} — must be true.`,
        failureModeId: pass ? null : "ef-single-step-constraint-violated",
      };
    }

    if (preconditionId === "ep-009") {
      // requiresPreviewBeforeExecution must be true
      const pass = entry.requiresPreviewBeforeExecution === true;
      return {
        preconditionId,
        label: precondition.label,
        status: pass ? "pass" : "fail",
        reason: pass
          ? "requiresPreviewBeforeExecution is true — preview requirement satisfied."
          : `requiresPreviewBeforeExecution is ${entry.requiresPreviewBeforeExecution ?? "null/absent"} — must be true.`,
        failureModeId: pass ? null : "ef-preview-requirement-not-met",
      };
    }

    // Unknown precondition — cannot evaluate
    return {
      preconditionId,
      label: precondition.label,
      status: "not-evaluable",
      reason: `Precondition ${preconditionId} is not evaluable by this worker surface.`,
      failureModeId: null,
    };
  });
}

// ── Derive execution eligibility ───────────────────────────────────────────────
// Pure read-only derivation.
// Returns: "eligible-for-review" | "blocked" | "not-evaluable"
//
// Conservative rule:
//   - Any "fail" result → "blocked"
//   - Any "not-evaluable" result without any "fail" → "not-evaluable"
//   - All "pass" → "eligible-for-review"
//     (note: eligible-for-review does NOT mean execution is connected or permitted)

function deriveEligibility(preconditionResults) {
  if (!Array.isArray(preconditionResults) || preconditionResults.length === 0) {
    return "not-evaluable";
  }
  const hasFail = preconditionResults.some((r) => r.status === "fail");
  if (hasFail) return "blocked";
  const hasNotEvaluable = preconditionResults.some((r) => r.status === "not-evaluable");
  if (hasNotEvaluable) return "not-evaluable";
  return "eligible-for-review";
}

// ── Governance notice banner ───────────────────────────────────────────────────

function GovernanceNoticeBanner() {
  return (
    <div className="rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 space-y-1">
      <div className="flex items-center gap-2 font-semibold">
        <Lock className="h-4 w-4 shrink-0" />
        Execution Governance Boundary — External Execution Not Connected
      </div>
      <ul className="list-disc pl-5 space-y-0.5">
        <li>This worker surface is read-only and governance-bound. No execution actions may be performed here.</li>
        <li>External execution is not connected in this phase. No repository writes, GitHub API calls, or PR creation will occur.</li>
        <li>This component evaluates execution eligibility from governed registry data only.</li>
        <li>An &quot;eligible for review&quot; status does not initiate execution — it records that governed preconditions appear satisfied from available data.</li>
        <li>Preconditions that require a dispatch authorization runtime are explicitly labelled as not evaluable in this phase.</li>
      </ul>
    </div>
  );
}

// ── Eligibility badge ──────────────────────────────────────────────────────────

function EligibilityBadge({ eligibility }) {
  if (eligibility === "eligible-for-review") {
    return (
      <Badge className="bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 w-fit">
        <ClipboardList className="h-3 w-3 shrink-0" />
        Eligible for Execution Review
      </Badge>
    );
  }
  if (eligibility === "blocked") {
    return (
      <Badge className="bg-red-100 text-red-800 border border-red-200 flex items-center gap-1 w-fit">
        <ShieldOff className="h-3 w-3 shrink-0" />
        Blocked by Governance Preconditions
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
      <MinusCircle className="h-3 w-3 shrink-0" />
      Not Fully Evaluable
    </Badge>
  );
}

// ── Precondition result row ────────────────────────────────────────────────────

function PreconditionResultRow({ result }) {
  const icon =
    result.status === "pass" ? (
      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
    ) : result.status === "fail" ? (
      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
    ) : (
      <MinusCircle className="h-4 w-4 text-amber-500 shrink-0" />
    );

  const reasonColor =
    result.status === "pass"
      ? "text-slate-500"
      : result.status === "fail"
      ? "text-red-600"
      : "text-amber-700";

  return (
    <div className="flex items-start gap-2 text-sm py-1 border-b border-slate-100 last:border-0">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-slate-700">{result.label}</span>
          <span className="text-xs text-slate-400 font-mono">{result.preconditionId}</span>
          {result.failureModeId && result.status !== "pass" && (
            <span className="text-xs text-slate-400 font-mono">{result.failureModeId}</span>
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

// ── External execution status block ───────────────────────────────────────────
// Truthfully states that external execution is not connected in this phase.

function ExternalExecutionStatus() {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 space-y-1">
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-wide">
        <Terminal className="h-3.5 w-3.5 shrink-0" />
        External Execution Status
      </div>
      <div className="text-xs text-amber-800 space-y-0.5">
        <div className="font-medium">Not connected — unavailable in this phase.</div>
        <ul className="list-disc pl-4 space-y-0.5 text-amber-700">
          <li>No repository execution is configured for this worker surface.</li>
          <li>No GitHub API calls will be made.</li>
          <li>No repository writes will occur.</li>
          <li>No pull request will be created.</li>
          <li>Evidence generation is unavailable until an execution integration connector is implemented.</li>
          <li>External execution dependency: not yet connected.</li>
        </ul>
      </div>
    </div>
  );
}

// ── Required evidence categories block ────────────────────────────────────────
// Shows what evidence would be required by ExecutionWorkerSpec when execution is connected.

function RequiredEvidenceBlock() {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 space-y-2">
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
        Required Evidence (from ExecutionWorkerSpec)
      </div>
      <div className="text-xs text-slate-400 mb-1">
        The following evidence fields would need to be produced by the execution connector
        before handoff to the verification and execution log layers. None can be produced
        in this phase as external execution is not connected.
      </div>
      <div className="divide-y divide-slate-100">
        {executionWorkerRequiredEvidence.map((ev) => (
          <div key={ev.evidenceId} className="flex items-start gap-2 py-1 text-xs">
            <span className="font-mono text-slate-400 shrink-0 w-12">{ev.evidenceId}</span>
            <span className="font-medium text-slate-600 w-36 shrink-0">{ev.label}</span>
            <span className="text-slate-400 italic">not yet produced — execution not connected</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Per-instance execution card ────────────────────────────────────────────────

function ExecutionInstanceCard({ entry }) {
  const preconditionResults = evaluatePreconditions(entry);
  const eligibility = deriveEligibility(preconditionResults);
  const failedCount = preconditionResults.filter((r) => r.status === "fail").length;
  const notEvaluableCount = preconditionResults.filter((r) => r.status === "not-evaluable").length;

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
          <EligibilityBadge eligibility={eligibility} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">

        {/* Registry identity fields */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
          <FieldRow label="Repo" value={entry.repoFullName} />
          <FieldRow label="Lifecycle Stage" value={entry.lifecycleStage} />
          <FieldRow label="Dispatch Status" value={entry.dispatchStatus} />
          <FieldRow label="Execution Status" value={entry.executionStatus} />
          <FieldRow label="Approval Status" value={entry.approvalStatus} />
          <FieldRow label="Prompt ID" value={entry.promptId} />
        </div>

        {/* Precondition results */}
        <div>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Execution Preconditions ({preconditionResults.filter((r) => r.status === "pass").length}/{preconditionResults.length} passing)
            </span>
            <div className="flex gap-2">
              {failedCount > 0 && (
                <span className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  {failedCount} blocking
                </span>
              )}
              {notEvaluableCount > 0 && (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <MinusCircle className="h-3 w-3 shrink-0" />
                  {notEvaluableCount} not evaluable
                </span>
              )}
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 divide-y divide-slate-100">
            {preconditionResults.map((result) => (
              <PreconditionResultRow key={result.preconditionId} result={result} />
            ))}
          </div>
        </div>

        {/* External execution status */}
        <ExternalExecutionStatus />

        {/* Required evidence categories */}
        <RequiredEvidenceBlock />

      </CardContent>
    </Card>
  );
}

// ── Empty registry state ───────────────────────────────────────────────────────

function EmptyRegistryState() {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 space-y-2">
      <div className="font-semibold text-slate-600">No governed plan instances available</div>
      <div>
        CHANGE_PLAN_INSTANCE_REGISTRY currently contains no plan instances.
      </div>
      <div className="text-xs text-slate-400 space-y-1">
        <div>No execution attempt can be made — no registry entries exist to evaluate.</div>
        <div>No runtime will be fabricated. An empty registry is the correct and truthful initial state.</div>
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
      <span><span className="font-medium text-slate-500">Worker Spec:</span> {specMeta.specId} v{specMeta.version}</span>
      <span><span className="font-medium text-slate-500">Phase:</span> {specMeta.phase}</span>
      <span><span className="font-medium text-slate-500">Dispatch Spec:</span> {dispatchSpecMeta.specId} v{dispatchSpecMeta.version}</span>
      <span><span className="font-medium text-slate-500">Registry:</span> {meta.artifactId}</span>
      <span><span className="font-medium text-slate-500">Preconditions:</span> {executionWorkerPreconditions.length}</span>
      <span><span className="font-medium text-slate-500">Failure Modes:</span> {executionWorkerFailureModes.length}</span>
      <span><span className="font-medium text-slate-500">Execution Implemented:</span> {String(specMeta.executionImplemented)}</span>
      <span><span className="font-medium text-slate-500">Worker Runtime:</span> {String(specMeta.workerRuntimeImplemented)}</span>
    </div>
  );
}

// ── Default export ─────────────────────────────────────────────────────────────

export default function ExecutionWorker() {
  const entries = CHANGE_PLAN_INSTANCE_REGISTRY.entries;

  return (
    <div className="space-y-4">

      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
          Execution Worker
        </p>
        <p className="text-sm text-slate-500">
          Governance-bound execution worker surface. Evaluates execution eligibility
          from governed registry data. External execution is not connected in this phase.
        </p>
      </div>

      <GovernanceNoticeBanner />

      <SpecMetaStrip />

      {entries.length === 0 ? (
        <EmptyRegistryState />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <ExecutionInstanceCard key={entry.planId} entry={entry} />
          ))}
        </div>
      )}

    </div>
  );
}

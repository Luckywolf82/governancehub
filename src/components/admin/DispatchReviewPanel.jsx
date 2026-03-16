// DispatchReviewPanel — read-only dispatch authorization review surface
// gov-006 Phase 6 — created 2026-03-16
// Project: GovernanceHub (projectId: governancehub, projectSlug: governancehub)
//
// This component is a pure read-only governance inspection surface.
// It reads from CHANGE_PLAN_INSTANCE_REGISTRY and evaluates dispatch authorization
// readiness using requiredDispatchConditions from DispatchAuthorizationSpec.
//
// STRICTLY FORBIDDEN in this file:
//   dispatch() — execute() — createPR() — fetch() — axios()
//   worker invocation — registry mutation — prompt generation runtime
//   synthetic registry entries
//
// Source artifacts (read-only):
//   ChangePlanInstanceRegistry.jsx   — canonical registry of plan instances
//   DispatchAuthorizationSpec.jsx    — required dispatch conditions and status vocabulary
//   ApprovedChangePlanInstanceSpec.jsx — required instance fields

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, ShieldCheck, ShieldOff, AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";

import {
  CHANGE_PLAN_INSTANCE_REGISTRY,
} from "@/components/governance/ChangePlanInstanceRegistry";

import {
  requiredDispatchConditions,
  specMeta,
} from "@/components/governance/DispatchAuthorizationSpec";

import {
  requiredInstanceFields,
} from "@/components/governance/ApprovedChangePlanInstanceSpec";

// ── Read-only condition evaluator ─────────────────────────────────────────────
// Pure function — no side effects, no state mutation, no inferred values.
// Returns an array of condition results for a single plan instance entry.

function evaluateConditions(entry) {
  return requiredDispatchConditions.map((condition) => {
    const { conditionId } = condition;

    if (conditionId === "dc-001") {
      // Approved change plan exists: planId must be present and non-empty
      const pass = typeof entry.planId === "string" && entry.planId.trim().length > 0;
      return {
        conditionId,
        label: condition.label,
        pass,
        reason: pass
          ? "planId is present — plan identity is recorded."
          : "planId is absent or empty — no approved change plan can be confirmed.",
      };
    }

    if (conditionId === "dc-002") {
      // Valid plan instance in registry: all requiredInstanceFields must be present
      const missingFields = requiredInstanceFields.filter(
        (f) => !(f in entry) || entry[f] === undefined
      );
      const pass = missingFields.length === 0;
      return {
        conditionId,
        label: condition.label,
        pass,
        reason: pass
          ? "All required instance fields are present."
          : `Missing required fields: ${missingFields.join(", ")}.`,
      };
    }

    if (conditionId === "dc-003") {
      // Registry entry exists for planId: instance is found in CHANGE_PLAN_INSTANCE_REGISTRY
      // (we are iterating entries, so this is always true for entries shown here)
      const found = CHANGE_PLAN_INSTANCE_REGISTRY.entries.some(
        (e) => e.planId === entry.planId
      );
      return {
        conditionId,
        label: condition.label,
        pass: found,
        reason: found
          ? "Registry entry found for this planId."
          : "No registry entry found for this planId — instance not recognized.",
      };
    }

    if (conditionId === "dc-004") {
      // Repo binding confirmed: repoFullName present and matches owner/repo
      const repo = entry.repoFullName;
      const pass =
        typeof repo === "string" &&
        repo.trim().length > 0 &&
        /^[^/\s]+\/[^/\s]+$/.test(repo.trim());
      return {
        conditionId,
        label: condition.label,
        pass,
        reason: pass
          ? `Repo binding confirmed: ${repo}.`
          : repo
          ? `repoFullName "${repo}" does not match expected 'owner/repo' format.`
          : "repoFullName is absent or empty — repo binding not confirmed.",
      };
    }

    if (conditionId === "dc-005") {
      // Approved prompt exists and is linked: promptId must be non-null
      const pass = entry.promptId !== null && entry.promptId !== undefined && entry.promptId !== "";
      return {
        conditionId,
        label: condition.label,
        pass,
        reason: pass
          ? `Approved prompt linked: ${entry.promptId}.`
          : "promptId is null or absent — no approved prompt is linked to this instance.",
      };
    }

    if (conditionId === "dc-006") {
      // approvalStatus must be 'approved'
      const pass = entry.approvalStatus === "approved";
      return {
        conditionId,
        label: condition.label,
        pass,
        reason: pass
          ? "approvalStatus is 'approved'."
          : `approvalStatus is "${entry.approvalStatus ?? "null/absent"}" — must be 'approved'.`,
      };
    }

    if (conditionId === "dc-007") {
      // lifecycleStage must be 'prompt-generated'
      const pass = entry.lifecycleStage === "prompt-generated";
      return {
        conditionId,
        label: condition.label,
        pass,
        reason: pass
          ? "lifecycleStage is 'prompt-generated'."
          : `lifecycleStage is "${entry.lifecycleStage ?? "null/absent"}" — must be 'prompt-generated'.`,
      };
    }

    if (conditionId === "dc-008") {
      // dispatchStatus must be 'not-dispatched'
      const pass = entry.dispatchStatus === "not-dispatched";
      return {
        conditionId,
        label: condition.label,
        pass,
        reason: pass
          ? "dispatchStatus is 'not-dispatched'."
          : `dispatchStatus is "${entry.dispatchStatus ?? "null/absent"}" — must be 'not-dispatched'.`,
      };
    }

    if (conditionId === "dc-009") {
      // singleStepOnly must be true
      const pass = entry.singleStepOnly === true;
      return {
        conditionId,
        label: condition.label,
        pass,
        reason: pass
          ? "singleStepOnly is true — single-step constraint satisfied."
          : `singleStepOnly is ${entry.singleStepOnly ?? "null/absent"} — must be true.`,
      };
    }

    if (conditionId === "dc-010") {
      // requiresPreviewBeforeExecution must be true
      const pass = entry.requiresPreviewBeforeExecution === true;
      return {
        conditionId,
        label: condition.label,
        pass,
        reason: pass
          ? "requiresPreviewBeforeExecution is true — preview requirement satisfied."
          : `requiresPreviewBeforeExecution is ${entry.requiresPreviewBeforeExecution ?? "null/absent"} — must be true.`,
      };
    }

    // Unknown condition — cannot evaluate
    return {
      conditionId,
      label: condition.label,
      pass: false,
      reason: `Condition ${conditionId} is not evaluable by this panel.`,
    };
  });
}

// ── Derive dispatch outcome ────────────────────────────────────────────────────
// Pure read-only derivation of the authorization outcome from condition results.
// Returns: "authorized" | "held" | "authorization-not-evaluable"

function deriveOutcome(conditionResults) {
  if (!Array.isArray(conditionResults) || conditionResults.length === 0) {
    return "authorization-not-evaluable";
  }
  const allPass = conditionResults.every((r) => r.pass);
  return allPass ? "authorized" : "held";
}

// ── Governance notice banner ──────────────────────────────────────────────────

function GovernanceNoticeBanner() {
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 space-y-1">
      <div className="flex items-center gap-2 font-semibold">
        <Lock className="h-4 w-4 shrink-0" />
        Governance Notice — Read-Only Panel
      </div>
      <ul className="list-disc pl-5 space-y-0.5">
        <li>This panel is read-only. No dispatch or execution actions may be performed here.</li>
        <li>Authorization conditions are evaluated from static registry data only.</li>
        <li>An authorized status does not initiate dispatch — it records that conditions are met.</li>
        <li>Dispatch runtime remains blocked pending a future verified dispatch component.</li>
      </ul>
    </div>
  );
}

// ── Outcome badge ─────────────────────────────────────────────────────────────

function OutcomeBadge({ outcome }) {
  if (outcome === "authorized") {
    return (
      <Badge className="bg-green-100 text-green-800 border border-green-200 flex items-center gap-1 w-fit">
        <ShieldCheck className="h-3 w-3 shrink-0" />
        Authorized
      </Badge>
    );
  }
  if (outcome === "held") {
    return (
      <Badge className="bg-red-100 text-red-800 border border-red-200 flex items-center gap-1 w-fit">
        <ShieldOff className="h-3 w-3 shrink-0" />
        Held / Blocked
      </Badge>
    );
  }
  return (
    <Badge className="bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1 w-fit">
      <Info className="h-3 w-3 shrink-0" />
      Authorization Not Evaluable
    </Badge>
  );
}

// ── Condition result row ──────────────────────────────────────────────────────

function ConditionResultRow({ result }) {
  return (
    <div className="flex items-start gap-2 text-sm py-1 border-b border-slate-100 last:border-0">
      <div className="mt-0.5 shrink-0">
        {result.pass ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-slate-700">{result.label}</span>
          <span className="text-xs text-slate-400 font-mono">{result.conditionId}</span>
        </div>
        <div className={`text-xs mt-0.5 ${result.pass ? "text-slate-500" : "text-red-600"}`}>
          {result.reason}
        </div>
      </div>
    </div>
  );
}

// ── Plan instance review card ─────────────────────────────────────────────────

function PlanInstanceCard({ entry }) {
  const conditionResults = evaluateConditions(entry);
  const outcome = deriveOutcome(conditionResults);
  const failedCount = conditionResults.filter((r) => !r.pass).length;

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
          <OutcomeBadge outcome={outcome} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">

        {/* Summary fields */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
          <FieldRow label="Repo" value={entry.repoFullName} />
          <FieldRow label="Lifecycle Stage" value={entry.lifecycleStage} />
          <FieldRow label="Dispatch Status" value={entry.dispatchStatus} />
          <FieldRow label="Execution Status" value={entry.executionStatus} />
          <FieldRow label="Verification Status" value={entry.verificationStatus} />
          <FieldRow label="Approval Status" value={entry.approvalStatus} />
        </div>

        {/* Condition-by-condition results */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Dispatch Conditions ({conditionResults.length - failedCount}/{conditionResults.length} passing)
            </span>
            {outcome === "held" && (
              <span className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                {failedCount} condition{failedCount !== 1 ? "s" : ""} blocking dispatch
              </span>
            )}
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 divide-y divide-slate-100">
            {conditionResults.map((result) => (
              <ConditionResultRow key={result.conditionId} result={result} />
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

// ── Field row helper ──────────────────────────────────────────────────────────

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

// ── Empty registry state ──────────────────────────────────────────────────────

function EmptyRegistryState() {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 space-y-2">
      <div className="font-semibold text-slate-600">Registry is empty</div>
      <div>
        CHANGE_PLAN_INSTANCE_REGISTRY currently contains no plan instances.
      </div>
      <div className="text-xs text-slate-400">
        No dispatch authorization results can be shown for instances that do not exist.
        Real plan instances may only be added by future verified runtime layers.
      </div>
    </div>
  );
}

// ── Registry metadata strip ───────────────────────────────────────────────────

function RegistryMetaStrip() {
  const { meta } = CHANGE_PLAN_INSTANCE_REGISTRY;
  return (
    <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-0.5 border border-slate-100 bg-slate-50 rounded px-3 py-2">
      <span><span className="font-medium text-slate-500">Registry:</span> {meta.artifactId}</span>
      <span><span className="font-medium text-slate-500">Version:</span> {meta.version}</span>
      <span><span className="font-medium text-slate-500">Spec:</span> {specMeta.specId} v{specMeta.version}</span>
      <span><span className="font-medium text-slate-500">Project:</span> {meta.projectSlug}</span>
      <span><span className="font-medium text-slate-500">Conditions checked:</span> {requiredDispatchConditions.length}</span>
    </div>
  );
}

// ── Default export ────────────────────────────────────────────────────────────

export default function DispatchReviewPanel() {
  const entries = CHANGE_PLAN_INSTANCE_REGISTRY.entries;

  return (
    <div className="space-y-4">

      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
          Dispatch Authorization Review
        </p>
        <p className="text-sm text-slate-500">
          Read-only review of dispatch authorization readiness for all plan instances in the canonical registry.
        </p>
      </div>

      <GovernanceNoticeBanner />

      <RegistryMetaStrip />

      {entries.length === 0 ? (
        <EmptyRegistryState />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <PlanInstanceCard key={entry.planId} entry={entry} />
          ))}
        </div>
      )}

    </div>
  );
}

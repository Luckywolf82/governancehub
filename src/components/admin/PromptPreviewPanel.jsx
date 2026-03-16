// PromptPreviewPanel — read-only prompt preview surface
// gov-006 Phase 7 — created 2026-03-16
// Project: GovernanceHub (projectId: governancehub, projectSlug: governancehub)
//
// This component is a pure read-only governance preview surface.
// It reads from CHANGE_PLAN_INSTANCE_REGISTRY and presents the prompt-related
// data that is actually present in each registry entry.
//
// STRICTLY FORBIDDEN in this file:
//   dispatch() — execute() — createPR() — fetch() — axios()
//   worker invocation — registry mutation — prompt generation runtime
//   synthetic registry entries — external artifact verification
//
// Source artifacts (read-only):
//   ChangePlanInstanceRegistry.jsx    — canonical registry of plan instances
//   ApprovedChangePromptSpec.jsx      — prompt spec schema reference (display only)
//
// Epistemic contract:
//   This panel may ONLY claim what the registry entry actually contains.
//   It may NOT claim external prompt verification, artifact loading, or approval confirmation.
//   If the registry only holds promptId, the panel reports: "Prompt reference present".
//   It does NOT report: "Prompt verified", "Prompt approved", or "Prompt artifact loaded".

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, FileSearch, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";

import {
  CHANGE_PLAN_INSTANCE_REGISTRY,
} from "@/components/governance/ChangePlanInstanceRegistry";

import {
  specMeta as promptSpecMeta,
} from "@/components/governance/ApprovedChangePromptSpec";

import {
  requiredPromptLinkageFields,
} from "@/components/governance/ApprovedChangePlanInstanceSpec";

// ── Derive prompt reference status from registry entry ────────────────────────
// Pure function — no side effects. Returns structured prompt status for one entry.

function derivePromptStatus(entry) {
  const hasPromptId =
    entry.promptId !== null &&
    entry.promptId !== undefined &&
    entry.promptId !== "";

  // Determine which prompt-related fields are actually present in the entry
  const presentPromptFields = requiredPromptLinkageFields
    .map((f) => f.field)
    .filter((field) => field in entry && entry[field] !== undefined);

  // Preview text/body is never available in registry-only data
  const previewAvailable = false;

  return {
    hasPromptId,
    promptId: hasPromptId ? entry.promptId : null,
    presentPromptFields,
    previewAvailable,
    referenceStatus: hasPromptId ? "present" : "missing",
    previewStatus: "unavailable-registry-only",
  };
}

// ── Governance notice banner ──────────────────────────────────────────────────

function GovernanceNoticeBanner() {
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 space-y-1">
      <div className="flex items-center gap-2 font-semibold">
        <Lock className="h-4 w-4 shrink-0" />
        Governance Notice — Read-Only Preview Surface
      </div>
      <ul className="list-disc pl-5 space-y-0.5">
        <li>This panel is read-only. No dispatch, execution, or generation actions may be performed here.</li>
        <li>Prompt preview data is derived solely from registry entries in CHANGE_PLAN_INSTANCE_REGISTRY.</li>
        <li>This panel does not access external prompt artifacts, repositories, or execution logs.</li>
        <li>Only fields that genuinely exist in each registry entry are shown — nothing is inferred or fabricated.</li>
      </ul>
    </div>
  );
}

// ── Prompt reference status badge ─────────────────────────────────────────────

function PromptReferenceBadge({ status }) {
  if (status === "present") {
    return (
      <Badge className="bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 w-fit">
        <CheckCircle2 className="h-3 w-3 shrink-0" />
        Prompt reference present
      </Badge>
    );
  }
  return (
    <Badge className="bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1 w-fit">
      <XCircle className="h-3 w-3 shrink-0" />
      Prompt reference missing
    </Badge>
  );
}

// ── Preview availability badge ────────────────────────────────────────────────

function PreviewAvailabilityBadge({ available }) {
  if (available) {
    return (
      <Badge className="bg-green-100 text-green-800 border border-green-200 flex items-center gap-1 w-fit">
        <Eye className="h-3 w-3 shrink-0" />
        Preview available from registry data
      </Badge>
    );
  }
  return (
    <Badge className="bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1 w-fit">
      <EyeOff className="h-3 w-3 shrink-0" />
      Preview unavailable from registry-only data
    </Badge>
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

// ── Prompt preview block ──────────────────────────────────────────────────────
// Truthfully presents only what the registry entry contains.

function PromptPreviewBlock({ promptStatus }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 space-y-3">

      {/* Prompt reference */}
      <div className="space-y-1">
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Prompt Reference
        </div>
        <PromptReferenceBadge status={promptStatus.referenceStatus} />
        {promptStatus.hasPromptId && (
          <div className="text-xs text-slate-500 font-mono mt-1">
            promptId: {promptStatus.promptId}
          </div>
        )}
        {!promptStatus.hasPromptId && (
          <div className="text-xs text-slate-400 mt-0.5">
            No promptId is recorded in this registry entry.
          </div>
        )}
      </div>

      {/* Preview availability */}
      <div className="space-y-1">
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Preview Availability
        </div>
        <PreviewAvailabilityBadge available={promptStatus.previewAvailable} />
        <div className="text-xs text-slate-400 mt-0.5">
          Prompt text, title, and body are not stored in the registry. Only a
          prompt reference (promptId) is carried at registry level.
          Full prompt content is accessible only through a future verified prompt
          artifact layer — not from this panel.
        </div>
      </div>

    </div>
  );
}

// ── Per-instance prompt preview card ─────────────────────────────────────────

function PromptPreviewCard({ entry }) {
  const promptStatus = derivePromptStatus(entry);

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
          <PromptReferenceBadge status={promptStatus.referenceStatus} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">

        {/* Registry identity fields */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
          <FieldRow label="Repo" value={entry.repoFullName} />
          <FieldRow label="Lifecycle Stage" value={entry.lifecycleStage} />
          <FieldRow label="Dispatch Status" value={entry.dispatchStatus} />
          <FieldRow label="Approval Status" value={entry.approvalStatus} />
        </div>

        {/* Prompt preview block */}
        <div>
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <FileSearch className="h-3.5 w-3.5 shrink-0" />
            Prompt Preview
          </div>
          <PromptPreviewBlock promptStatus={promptStatus} />
        </div>

      </CardContent>
    </Card>
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
        No prompt preview data can be shown for instances that do not exist.
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
      <span><span className="font-medium text-slate-500">Prompt Spec:</span> {promptSpecMeta.specId} v{promptSpecMeta.version}</span>
      <span><span className="font-medium text-slate-500">Project:</span> {meta.projectSlug}</span>
      <span><span className="font-medium text-slate-500">Entries:</span> {CHANGE_PLAN_INSTANCE_REGISTRY.entries.length}</span>
    </div>
  );
}

// ── Default export ────────────────────────────────────────────────────────────

export default function PromptPreviewPanel() {
  const entries = CHANGE_PLAN_INSTANCE_REGISTRY.entries;

  return (
    <div className="space-y-4">

      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
          Prompt Preview
        </p>
        <p className="text-sm text-slate-500">
          Read-only preview of prompt reference data for all plan instances in the canonical registry.
          Only fields present in each registry entry are displayed.
        </p>
      </div>

      <GovernanceNoticeBanner />

      <RegistryMetaStrip />

      {entries.length === 0 ? (
        <EmptyRegistryState />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <PromptPreviewCard key={entry.planId} entry={entry} />
          ))}
        </div>
      )}

    </div>
  );
}

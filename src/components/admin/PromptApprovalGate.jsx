// PromptApprovalGate — read-only admin inspection panel
// gov-005 Phase 2 (runtime component) — created 2026-03-16
// Project: GovernanceHub (projectId: governancehub, projectSlug: governancehub)
//
// This component is a pure read-only governance inspection surface.
// It renders governed information derived from the three governance artifacts below.
// It does NOT execute approval transitions, dispatch prompts, mutate state, or call any API.
//
// Source artifacts (read-only):
//   PromptProfileRegistry.jsx        — profile schema, registry, status vocabulary
//   PromptProfileApprovalPolicy.jsx  — transitions, roles, requirements, blocked capabilities
//   PromptApprovalGateSpec.jsx       — derived read-only states and blocked interpretations

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldOff, Lock, AlertTriangle, Info } from "lucide-react";

import {
  requiredProfileFields,
  governanceConstraints,
  approvalStatusVocabulary,
  PROMPT_PROFILE_REGISTRY,
} from "@/components/governance/PromptProfileRegistry";

import {
  policyMeta,
  approvalTransitions,
  governanceRoles,
  approvalRequirements,
  blockedCapabilitiesBeforeApproval,
  blockedCapabilitiesAfterApproval,
} from "@/components/governance/PromptProfileApprovalPolicy";

import {
  specMeta,
  derivedReadOnlyStates,
  blockedActions,
  blockedInterpretations,
} from "@/components/governance/PromptApprovalGateSpec";

// ── Governance notice banner ──────────────────────────────────────────────────

function GovernanceNoticeBanner() {
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 space-y-1">
      <div className="flex items-center gap-2 font-semibold">
        <Lock className="h-4 w-4 shrink-0" />
        Governance Notice — Read-Only Panel
      </div>
      <ul className="list-disc pl-5 space-y-0.5">
        <li>This panel is read-only. No actions may be performed here.</li>
        <li>Approved does not mean dispatchable.</li>
        <li>Dispatch remains blocked pending future governance phases (gov-005 Phase 3–5).</li>
      </ul>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-500" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-slate-700 space-y-2">
        {children}
      </CardContent>
    </Card>
  );
}

// ── Field row ────────────────────────────────────────────────────────────────

function FieldRow({ label, value }) {
  return (
    <div className="flex flex-wrap gap-1">
      <span className="font-medium text-slate-600 min-w-[140px]">{label}:</span>
      <span className="break-all">{value ?? <span className="italic text-slate-400">—</span>}</span>
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  approved: "bg-green-100 text-green-800 border-green-200",
  "pending-review": "bg-blue-100 text-blue-800 border-blue-200",
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  deprecated: "bg-red-100 text-red-700 border-red-200",
};

function ApprovalStatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || "bg-slate-100 text-slate-600 border-slate-200";
  return <Badge variant="outline" className={cls}>{status ?? "—"}</Badge>;
}

// ── Blocked chip ─────────────────────────────────────────────────────────────

function BlockedChip({ label }) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-red-50 border border-red-200 px-2 py-0.5 text-xs text-red-700">
      <ShieldOff className="h-3 w-3 shrink-0" />
      {label}
    </span>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyRegistryState() {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 space-y-1">
      <div className="font-medium">No profiles in registry</div>
      <div>
        The prompt profile registry is currently empty. Profiles may only be added after
        passing the governance approval path defined in PromptProfileApprovalPolicy.
      </div>
    </div>
  );
}

// ── Section: Profile Overview ─────────────────────────────────────────────────

function ProfileOverviewSection({ profile }) {
  if (!profile) return <EmptyRegistryState />;
  return (
    <div className="space-y-1">
      <FieldRow label="ID" value={profile.id} />
      <FieldRow label="Name" value={profile.name} />
      <FieldRow label="Version" value={profile.version} />
      <FieldRow label="Target Audience" value={profile.targetAudience} />
      <FieldRow label="Created By" value={profile.createdBy} />
      <FieldRow label="Created At" value={profile.createdAt} />
      <div className="flex flex-wrap gap-1 items-center">
        <span className="font-medium text-slate-600 min-w-[140px]">Approval Status:</span>
        <ApprovalStatusBadge status={profile.approvalStatus} />
      </div>
    </div>
  );
}

// ── Section: Governed Content ─────────────────────────────────────────────────

function GovernedContentSection({ profile }) {
  if (!profile) return <EmptyRegistryState />;
  return (
    <div className="space-y-2">
      <div>
        <div className="font-medium text-slate-600 mb-1">Intent Description</div>
        <div className="rounded bg-slate-50 border border-slate-200 px-3 py-2 text-sm whitespace-pre-wrap">
          {profile.intentDescription || <span className="italic text-slate-400">—</span>}
        </div>
      </div>
      <div>
        <div className="font-medium text-slate-600 mb-1">Template Body <span className="font-normal text-slate-400">(read-only — no variable resolution)</span></div>
        <div className="rounded bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-mono whitespace-pre-wrap">
          {profile.templateBody || <span className="italic text-slate-400">—</span>}
        </div>
      </div>
      <div>
        <div className="font-medium text-slate-600 mb-1">Allowed Variables <span className="font-normal text-slate-400">(read-only visibility only)</span></div>
        {Array.isArray(profile.allowedVariables) && profile.allowedVariables.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {profile.allowedVariables.map((v) => (
              <Badge key={v} variant="secondary">{v}</Badge>
            ))}
          </div>
        ) : (
          <span className="italic text-slate-400">—</span>
        )}
      </div>
    </div>
  );
}

// ── Section: Approval Metadata ────────────────────────────────────────────────

function ApprovalMetadataSection({ profile }) {
  if (!profile) return <EmptyRegistryState />;
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1 items-center">
        <span className="font-medium text-slate-600 min-w-[140px]">Approval Status:</span>
        <ApprovalStatusBadge status={profile.approvalStatus} />
      </div>
      <FieldRow label="Approved By" value={profile.approvedBy} />
      <FieldRow label="Approved At" value={profile.approvedAt} />
    </div>
  );
}

// ── Section: Policy Constraints ───────────────────────────────────────────────

function PolicyConstraintsSection() {
  return (
    <div className="space-y-4">
      <div>
        <div className="font-medium text-slate-600 mb-1">Policy</div>
        <FieldRow label="Policy ID" value={policyMeta.policyId} />
        <FieldRow label="Version" value={policyMeta.version} />
        <FieldRow label="Governed By" value={policyMeta.governedBy} />
        <FieldRow label="Status" value={policyMeta.status} />
        <div className="mt-1 rounded bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          {policyMeta.note}
        </div>
      </div>

      <div>
        <div className="font-medium text-slate-600 mb-1">Approval Status Vocabulary</div>
        <div className="flex flex-wrap gap-1">
          {approvalStatusVocabulary.map((s) => (
            <ApprovalStatusBadge key={s} status={s} />
          ))}
        </div>
      </div>

      <div>
        <div className="font-medium text-slate-600 mb-1">Approval Requirements</div>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          {approvalRequirements.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>

      <div>
        <div className="font-medium text-slate-600 mb-1">Governance Roles</div>
        <div className="space-y-2">
          {governanceRoles.map((gr) => (
            <div key={gr.role} className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="font-medium">{gr.role}</div>
              <div className="text-slate-500">{gr.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="font-medium text-slate-600 mb-1">
          Valid Transitions <span className="font-normal text-slate-400">(read-only — not executable here)</span>
        </div>
        <div className="space-y-2">
          {approvalTransitions.map((t) => (
            <div key={`${t.from}-${t.to}`} className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{t.from}</Badge>
                <span className="text-slate-400">→</span>
                <Badge variant="outline">{t.to}</Badge>
                <span className="text-slate-500 text-xs">{t.label}</span>
                <Badge variant="secondary" className="text-xs">{t.requiredActor}</Badge>
              </div>
              <ul className="mt-1 list-disc pl-5 text-xs text-slate-500 space-y-0.5">
                {t.conditions.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="font-medium text-slate-600 mb-1">Registry Governance Constraints</div>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          {governanceConstraints.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </div>

      <div>
        <div className="font-medium text-slate-600 mb-1">Required Profile Fields</div>
        <div className="flex flex-wrap gap-1">
          {requiredProfileFields.map((f) => (
            <Badge key={f} variant="secondary">{f}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section: Derived Gate States ──────────────────────────────────────────────

function DerivedGateStatesSection({ profile }) {
  // Derive read-only display values. No state is mutated and no actions are triggered.
  const isApproved = profile ? profile.approvalStatus === "approved" : false;
  const isDispatchBlocked = true; // always blocked until future governance phases
  const currentStatus = profile?.approvalStatus ?? null;
  const allowedNextTransitions = currentStatus
    ? approvalTransitions.filter((t) => t.from === currentStatus)
    : [];

  return (
    <div className="space-y-4">
      <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 space-y-1">
        <div className="font-medium text-slate-600">isApproved</div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={isApproved ? "bg-green-100 text-green-800 border-green-200" : "bg-slate-100 text-slate-600 border-slate-200"}>
            {String(isApproved)}
          </Badge>
          <span className="text-xs text-slate-500">{"— derived from approvalStatus === 'approved'"}</span>
        </div>
        <div className="text-xs text-amber-700 font-medium">
          isApproved does not mean dispatchable. See Blocked Actions section.
        </div>
      </div>

      <div className="rounded border border-red-200 bg-red-50 px-3 py-2 space-y-1">
        <div className="font-medium text-red-700">isDispatchBlocked</div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
            {String(isDispatchBlocked)}
          </Badge>
          <span className="text-xs text-slate-500">— always blocked until gov-005 Phases 3–5 are verified</span>
        </div>
      </div>

      <div>
        <div className="font-medium text-slate-600 mb-1">Allowed Next Transitions (read-only display)</div>
        {allowedNextTransitions.length === 0 ? (
          <div className="text-slate-400 italic text-xs">
            {profile ? "No defined transitions from current state." : "No profile selected."}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allowedNextTransitions.map((t) => (
              <div key={`${t.from}-${t.to}`} className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs">
                <Badge variant="outline" className="text-xs">{t.from}</Badge>
                <span className="text-slate-400">→</span>
                <Badge variant="outline" className="text-xs">{t.to}</Badge>
                <span className="text-slate-400">({t.label})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="font-medium text-slate-600 mb-1">Derived State Definitions (from spec)</div>
        <div className="space-y-2">
          {derivedReadOnlyStates.map((ds) => (
            <div key={ds.state} className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
              <div className="font-medium">{ds.state}</div>
              <div className="text-slate-500">{ds.purpose}</div>
              <div className="text-amber-700 mt-0.5">{ds.note}</div>
              <div className="text-slate-400 font-mono mt-0.5">derived from: {ds.derivedFrom}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section: Blocked Actions ──────────────────────────────────────────────────

function BlockedActionsSection() {
  return (
    <div className="space-y-4">
      <div>
        <div className="font-medium text-slate-600 mb-1">Actions This Panel Must Never Perform</div>
        <div className="flex flex-wrap gap-1">
          {blockedActions.map((a) => (
            <BlockedChip key={a} label={a} />
          ))}
        </div>
      </div>

      <div>
        <div className="font-medium text-slate-600 mb-1">Blocked Before Approval</div>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          {blockedCapabilitiesBeforeApproval.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>

      <div>
        <div className="font-medium text-slate-600 mb-1">Blocked After Approval (remains blocked)</div>
        <div className="space-y-2">
          {blockedCapabilitiesAfterApproval.map((b) => (
            <div key={b.capability} className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs">
              <div className="font-medium text-red-700">{b.capability}</div>
              <div className="text-slate-600">Blocked until: {b.blockedUntil}</div>
              <div className="text-slate-500 mt-0.5">{b.rationale}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="font-medium text-slate-600 mb-1">Blocked Interpretations</div>
        <div className="space-y-2">
          {blockedInterpretations.map((bi) => (
            <div key={bi.interpretation} className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs">
              <div className="font-medium text-amber-800">
                <AlertTriangle className="inline h-3 w-3 mr-1" />
                {bi.interpretation}
              </div>
              <div className="text-slate-600 mt-0.5">{bi.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────

export default function PromptApprovalGate() {
  // Read the first profile from the registry for display (read-only).
  // The registry is currently empty — the empty state is rendered in that case.
  const profiles = PROMPT_PROFILE_REGISTRY.profiles ?? [];
  const profile = profiles.length > 0 ? profiles[0] : null;

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-slate-500" />
          <h1 className="text-xl font-semibold">Prompt Approval Gate</h1>
          <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 text-xs">
            read-only
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground mt-0.5">
          gov-005 Phase 2 · Spec: {specMeta.specId} v{specMeta.version} · Registry: {PROMPT_PROFILE_REGISTRY.meta.registryId} v{PROMPT_PROFILE_REGISTRY.meta.version}
        </div>
      </div>

      {/* Governance notice */}
      <GovernanceNoticeBanner />

      {/* Sections */}
      <Section title="Profile Overview" icon={Info}>
        <ProfileOverviewSection profile={profile} />
      </Section>

      <Section title="Governed Content" icon={Info}>
        <GovernedContentSection profile={profile} />
      </Section>

      <Section title="Approval Metadata" icon={Info}>
        <ApprovalMetadataSection profile={profile} />
      </Section>

      <Section title="Policy Constraints" icon={Lock}>
        <PolicyConstraintsSection />
      </Section>

      <Section title="Derived Gate States" icon={Info}>
        <DerivedGateStatesSection profile={profile} />
      </Section>

      <Section title="Blocked Actions" icon={ShieldOff}>
        <BlockedActionsSection />
      </Section>

      {/* Footer */}
      <div className="text-xs text-slate-400 border-t pt-3 space-y-0.5">
        <div>Project: {PROMPT_PROFILE_REGISTRY.meta.projectId} · Governed by: {PROMPT_PROFILE_REGISTRY.meta.governedBy}</div>
        <div>Policy: {policyMeta.policyId} v{policyMeta.version} · Spec: {specMeta.specId} v{specMeta.version}</div>
        <div className="text-amber-600 font-medium">This panel is read-only. Dispatch remains blocked pending gov-005 Phases 3–5.</div>
      </div>
    </div>
  );
}

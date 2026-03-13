import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Map } from "lucide-react";
import {
  SCORING_MODEL,
  STATUS_DEFINITIONS,
  PHASE_BASELINE,
  FEATURES,
} from "../roadmap/ROADMAP";

const STATUS_STYLES = {
  completed: "bg-green-100 text-green-800 border-green-200",
  active: "bg-blue-100 text-blue-800 border-blue-200",
  "build-ready": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "scoping-required": "bg-amber-100 text-amber-800 border-amber-200",
  planned: "bg-slate-100 text-slate-700 border-slate-200",
  dependent: "bg-purple-100 text-purple-800 border-purple-200",
  blocked: "bg-red-100 text-red-800 border-red-200",
  partial: "bg-orange-100 text-orange-800 border-orange-200",
  deferred: "bg-slate-100 text-slate-500 border-slate-200",
};

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || "bg-slate-100 text-slate-600 border-slate-200";
  return <Badge variant="outline" className={cls}>{status}</Badge>;
}

function SummaryCard({ label, count }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-2xl font-semibold">{count}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function FeatureRow({ feature }) {
  const [open, setOpen] = useState(false);

  const hasExtra =
    (feature.dependencies?.length || 0) > 0 ||
    (feature.blockers?.length || 0) > 0 ||
    Boolean(feature.immediateAction) ||
    Boolean(feature.note) ||
    Boolean(feature.northStarNote) ||
    Boolean(feature.scopingRequired);

  return (
    <Card className="border-slate-200">
      <CardContent className="p-4">
        <button
          type="button"
          onClick={() => hasExtra && setOpen((prev) => !prev)}
          className="w-full text-left"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-medium">{feature.title}</div>
                <StatusBadge status={feature.status} />
                <Badge variant="secondary">{feature.category}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">{feature.description}</div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {feature.displayScore != null && (
                <Badge variant="outline">{feature.displayScore}/25</Badge>
              )}
              {feature.stabilityAdjustedScore != null && (
                <Badge variant="outline">adj {feature.stabilityAdjustedScore}</Badge>
              )}
              {hasExtra ? (open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : null}
            </div>
          </div>
        </button>

        {open && hasExtra && (
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <div><span className="font-medium">id:</span> {feature.id}</div>
            {feature.immediateAction && (
              <div><span className="font-medium">Action:</span> {feature.immediateAction}</div>
            )}
            {feature.scopingRequired && (
              <div><span className="font-medium">Scoping required:</span> {feature.scopingRequired}</div>
            )}
            {feature.dependencies?.length > 0 && (
              <div><span className="font-medium">Dependencies:</span> {feature.dependencies.join(", ")}</div>
            )}
            {feature.blockers?.length > 0 && (
              <div><span className="font-medium">Blockers:</span> {feature.blockers.join(" · ")}</div>
            )}
            {(feature.note || feature.buildNote) && (
              <div>{feature.note || feature.buildNote}</div>
            )}
            {feature.northStarNote && (
              <div>⭐ {feature.northStarNote}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const PHASE_ORDER = [1, 2, 3, 4, 5, 6];

function PhaseSection({ phaseNum, phaseMeta, features }) {
  const sorted = [...features].sort((a, b) => (b.displayScore ?? 0) - (a.displayScore ?? 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Phase {phaseNum} · {phaseMeta.title}
        </CardTitle>
        <div className="text-sm text-muted-foreground">{phaseMeta.theme}</div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.length === 0 ? (
          <div className="text-sm text-muted-foreground">Ingen features i denne fasen.</div>
        ) : (
          sorted.map((feature) => <FeatureRow key={feature.id} feature={feature} />)
        )}
      </CardContent>
    </Card>
  );
}

export default function RoadmapAdminPanel() {
  const total = FEATURES.length;

  const counts = useMemo(() => {
    const count = (status) => FEATURES.filter((feature) => feature.status === status).length;
    return {
      completed: count("completed"),
      active: count("active"),
      buildReady: count("build-ready"),
      scoping: count("scoping-required"),
      blocked: count("blocked"),
    };
  }, []);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5" />
          Produkt-roadmap
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Read-only · Kilde: ROADMAP.jsx
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-5">
          <SummaryCard label="Totale features" count={total} />
          <SummaryCard label="Completed" count={counts.completed} />
          <SummaryCard label="Active" count={counts.active} />
          <SummaryCard label="Build-ready" count={counts.buildReady} />
          <SummaryCard label="Scoping-required" count={counts.scoping} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status-definisjoner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(STATUS_DEFINITIONS).map(([status, definition]) => (
              <div key={status} className="space-y-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={status} />
                </div>
                {Array.isArray(definition) ? (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {definition.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">{definition}</div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {PHASE_ORDER.map((phaseNum) => {
            const phaseMeta = PHASE_BASELINE[`phase${phaseNum}`];
            const phaseFeatures = FEATURES.filter((feature) => feature.phase === phaseNum);
            return (
              <PhaseSection
                key={phaseNum}
                phaseNum={phaseNum}
                phaseMeta={phaseMeta}
                features={phaseFeatures}
              />
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground">
          Scoring model: USER_VALUE ×{SCORING_MODEL.weights.USER_VALUE} · DATA_QUALITY ×{SCORING_MODEL.weights.DATA_QUALITY} ·
          ADMIN_UI ×{SCORING_MODEL.weights.ADMIN_UI_IMPORTANCE} · INSTALL_DRIVER ×{SCORING_MODEL.weights.INSTALL_DRIVER} ·
          IMPL_COST ×{SCORING_MODEL.weights.IMPLEMENTATION_COST}
        </div>
      </CardContent>
    </Card>
  );
}

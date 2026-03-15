import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROADMAP } from "@/components/roadmap/ROADMAP";
import { IDEA_INDEX } from "@/components/ideas/IDEA_INDEX";
import { IDEA_PRIORITY_AUDIT } from "@/components/audits/product/idea-priority-audit";
import { Lightbulb, ArrowRight } from "lucide-react";

const IDEA_TYPES = ["Alle", "capability", "architecture", "workflow", "integration", "governance", "platform", "analytics"];
const TYPE_LABEL = {
  Alle: "Alle", capability: "Capability", architecture: "Architecture",
  workflow: "Workflow", integration: "Integration", governance: "Governance",
  platform: "Platform", analytics: "Analytics",
};

const TIER_STYLES = {
  now:   "bg-green-100 text-green-800 border border-green-200",
  next:  "bg-blue-100 text-blue-800 border border-blue-200",
  soon:  "bg-amber-100 text-amber-800 border border-amber-200",
  later: "bg-slate-100 text-slate-600 border border-slate-200",
};

const TIER_LABEL = {
  now: "Now", next: "Next", soon: "Soon", later: "Later",
};

function TierPill({ tier }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${TIER_STYLES[tier] ?? "bg-slate-100 text-slate-500"}`}>
      {TIER_LABEL[tier] ?? tier}
    </span>
  );
}

// Build ideaType lookup from IDEA_INDEX
const IDEA_TYPE_MAP = Object.fromEntries(IDEA_INDEX.ideas.map((i) => [i.ideaId, i.ideaType]));

export default function ProductIntelligencePanel() {
  const [activeType, setActiveType] = useState("Alle");
  const totalIdeas = IDEA_INDEX.ideas.length;
  const { lanes, recommendedBuildSequence } = ROADMAP;

  const filterByType = (ideas) =>
    activeType === "Alle" ? ideas : ideas.filter((i) => IDEA_TYPE_MAP[i.ideaId] === activeType);

  const filteredNow = filterByType(lanes.now);
  const filteredSequence = filterByType(recommendedBuildSequence);

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Product Intelligence
          </h2>
          <p className="text-xs text-slate-500">
            Roadmap v{ROADMAP.version} · {totalIdeas} ideas · Audit: {IDEA_PRIORITY_AUDIT.auditId}
          </p>
        </div>
        <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-xs">Read-only</Badge>
      </div>

      {/* ideaType filter */}
      <div className="flex flex-wrap gap-1">
        {IDEA_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`text-xs px-2.5 py-1 rounded border font-medium transition-colors ${
              activeType === type
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800"
            }`}
          >
            {TYPE_LABEL[type]}
          </button>
        ))}
      </div>

      {/* Lane summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {["now", "next", "soon", "later"].map((tier) => (
          <div key={tier} className={`rounded border px-3 py-2 text-center ${TIER_STYLES[tier]}`}>
            <p className="text-lg font-bold">{lanes[tier].length}</p>
            <p className="text-xs font-medium">{TIER_LABEL[tier]}</p>
          </div>
        ))}
      </div>

      {/* Now lane */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${TIER_STYLES.now}`}>Now</span>
            Highest priority ideas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-1.5">
          {filteredNow.length === 0 ? (
            <p className="text-xs text-slate-400 py-1">Ingen ideer i denne kategorien ennå.</p>
          ) : filteredNow.map((idea) => (
            <div key={idea.ideaId} className="flex items-start justify-between gap-2 text-xs py-1 border-b border-slate-50 last:border-0">
              <div>
                <span className="font-medium text-slate-800">{idea.title}</span>
                <span className="ml-1.5 text-slate-400">{idea.category}</span>
              </div>
              <span className="shrink-0 font-mono text-green-700 font-semibold">+{idea.netScore}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommended build sequence */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-700">Recommended Build Sequence</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-1">
          {filteredSequence.length === 0 ? (
            <p className="text-xs text-slate-400 py-1">Ingen ideer i denne kategorien ennå.</p>
          ) : filteredSequence.map((item, idx) => (
            <div key={item.ideaId} className="flex items-center gap-2 text-xs py-0.5">
              <span className="text-slate-400 font-mono w-5 shrink-0 text-right">{idx + 1}.</span>
              <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
              <span className="text-slate-700 font-medium flex-1">{item.title}</span>
              <TierPill tier={item.priorityTier} />
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
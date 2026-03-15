import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROADMAP } from "@/components/roadmap/ROADMAP";
import { IDEA_INDEX } from "@/components/ideas/IDEA_INDEX";
import { IDEA_PRIORITY_AUDIT } from "@/components/audits/product/idea-priority-audit";
import { Lightbulb, ArrowRight } from "lucide-react";

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

export default function ProductIntelligencePanel() {
  const totalIdeas = IDEA_INDEX.ideas.length;
  const { lanes, recommendedBuildSequence } = ROADMAP;

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
      {lanes.now.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${TIER_STYLES.now}`}>Now</span>
              Highest priority ideas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-1.5">
            {lanes.now.map((idea) => (
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
      )}

      {/* Recommended build sequence */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-700">Recommended Build Sequence</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-1">
          {recommendedBuildSequence.map((item, idx) => (
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
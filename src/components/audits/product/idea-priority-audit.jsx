/*
IDEA PRIORITY AUDIT — GovernanceHub
Deterministic scoring of IDEA_INDEX entries.

Scoring model:
  valueScore   = userValue + installDriver + missionFit          (max 15)
  costPenalty  = implementationCost + technicalRisk + dependencyRisk  (max 15)
  netScore     = valueScore - costPenalty

Priority tiers:
  now   netScore >= 9
  next  netScore >= 5
  soon  netScore >= 1
  later netScore <  1
*/

import { IDEA_INDEX } from "@/components/ideas/IDEA_INDEX";

function scoreIdea(idea) {
  const valueScore = idea.value.userValue + idea.value.installDriver + idea.value.missionFit;
  const costPenalty = idea.feasibility.implementationCost + idea.feasibility.technicalRisk + idea.feasibility.dependencyRisk;
  const netScore = valueScore - costPenalty;

  let priorityTier;
  if (netScore >= 9)      priorityTier = "now";
  else if (netScore >= 5) priorityTier = "next";
  else if (netScore >= 1) priorityTier = "soon";
  else                    priorityTier = "later";

  return {
    ideaId: idea.ideaId,
    title: idea.title,
    category: idea.category,
    stage: idea.stage,
    strategicType: idea.strategicType,
    valueScore,
    costPenalty,
    netScore,
    priorityTier,
    notes: idea.notes,
  };
}

const scoredIdeas = IDEA_INDEX.ideas
  .map(scoreIdea)
  .sort((a, b) => b.netScore - a.netScore);

export const IDEA_PRIORITY_AUDIT = {
  auditId: "idea-priority-audit-2026-03-15",
  title: "GovernanceHub Idea Priority Audit",
  date: "2026-03-15",
  status: "active",
  scope: "All ideas in IDEA_INDEX v" + IDEA_INDEX.version,
  ideas: scoredIdeas,
};
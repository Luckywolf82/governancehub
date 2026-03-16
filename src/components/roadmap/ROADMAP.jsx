/*
ROADMAP — GovernanceHub
Derived from IDEA_PRIORITY_AUDIT scored data.

Lanes are built from priorityTier assignments.
recommendedBuildSequence reflects strategic ordering beyond raw score —
sequential dependencies and foundation-first logic are applied manually.
*/

import { IDEA_PRIORITY_AUDIT } from "@/components/audits/product/idea-priority-audit";

function laneFor(tier) {
  return IDEA_PRIORITY_AUDIT.ideas.filter((i) => i.priorityTier === tier);
}

// Recommended build sequence — foundation-first, respects dependencies
const RECOMMENDED_BUILD_SEQUENCE = [
  // ── Foundational governance and product tracks ─────────────────────────────
  "repo-onboarding-flow",
  "start-prompt-generator",
  "governance-starter-kit-export",
  "project-bootstrap-flow",
  "issue-task-channel-selector",
  "copilot-task-bridge",
  "repo-manifest-system",
  "repo-verification-bundles",
  "project-repo-linking-model",
  "audit-scope-taxonomy",
  "roadmap-generator",
  "project-intelligence-engine",
  "cross-repo-dashboard",
  // ── Governed execution pipeline (later phase) ──────────────────────────────
  // Sequence: Audit → ApprovedChangePlan → Deterministic Prompt
  //           → Dispatch Authorization → Execution Worker
  //           → PR Registration → Verification → Execution Log
  "dispatch-authorization-spec",
  "dispatch-review-panel",
  "execution-worker-spec",
  "execution-worker",
  "pr-registration-linkage",
  "verification-runner-refinement",
];

const allIdeas = IDEA_PRIORITY_AUDIT.ideas;

export const ROADMAP = {
  version: "1.1.0",
  updatedAt: "2026-03-16",
  derivedFrom: IDEA_PRIORITY_AUDIT.auditId,
  lanes: {
    now:   laneFor("now"),
    next:  laneFor("next"),
    soon:  laneFor("soon"),
    later: laneFor("later"),
  },
  recommendedBuildSequence: RECOMMENDED_BUILD_SEQUENCE.map((id) => {
    const idea = allIdeas.find((i) => i.ideaId === id);
    return idea
      ? { ideaId: idea.ideaId, title: idea.title, priorityTier: idea.priorityTier, netScore: idea.netScore }
      : { ideaId: id, title: id, priorityTier: "unknown", netScore: null };
  }),
};
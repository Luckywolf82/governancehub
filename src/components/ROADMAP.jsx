/*
PRODUCT INTELLIGENCE AUDIT — Starter Kit Adaptation
Adapted from TankRadar product intelligence audit observed in:
src/components/audits/product/product-intelligence-audit-2026-03-12.jsx

Purpose:
- Carry over the TankRadar-style product scoring model into GovernanceHub starter kit
- Preserve a ready-to-use product audit category
- Keep a roadmap-facing intelligence artifact in the project starter kit

Verification note:
- This file is a compatibility adaptation for starter-kit use.
- Structure and key scoring dimensions were verified from TankRadar GitHub sources on 2026-03-12.
*/

export const PRODUCT_INTELLIGENCE_AUDIT = {
  auditId: "product-intelligence-audit-2026-03-12",
  auditType: "product",
  date: "2026-03-12",
  entry: 99,
  status: "complete",

  purpose: [
    "Full idea-bank synchronization pattern",
    "Roadmap generation support",
    "Starter-kit compatible product scoring reference",
  ],

  scope: [
    "Product scoring model",
    "Top feature ranking logic",
    "Roadmap-facing prioritization",
    "Build-readiness framing",
  ],

  evidence: {
    verifiedFromTankRadar: [
      "src/components/audits/product/product-intelligence-audit-2026-03-12.jsx",
      "src/components/roadmap/ROADMAP.jsx",
      "src/pages/AdminDashboard.jsx",
    ],
    evidenceLevel: [
      "code-observed",
      "reasoned-inference",
      "starter-kit adaptation",
    ],
  },

  scoringFramework: {
    dimensions: {
      USER_VALUE: "Direct utility to the end user",
      INSTALL_DRIVER: "Would this make people install or keep the app?",
      MISSION_FIT: "How tightly the feature aligns with the core mission",
      DATA_READINESS: "Can current infrastructure support the feature",
      IMPL_COST: "Inverse complexity: 5 = easy, 1 = very hard",
    },
    maxScore: 25,
    buildReadinessThreshold: 18,
  },

  scoringTable: [
    {
      id: "national-fuel-barometer",
      title: "Nasjonal drivstoffbarometer",
      USER_VALUE: 5,
      INSTALL_DRIVER: 4,
      MISSION_FIT: 5,
      DATA_READINESS: 5,
      IMPL_COST: 5,
      total: 24,
      buildReadiness: "ready",
      reasoning: "High user relevance, strong mission fit, already demonstrated in TankRadar context.",
    },
    {
      id: "fuel-savings-tracker",
      title: "Savings tracker",
      USER_VALUE: 5,
      INSTALL_DRIVER: 5,
      MISSION_FIT: 4,
      DATA_READINESS: 3,
      IMPL_COST: 4,
      total: 21,
      buildReadiness: "ready",
      reasoning: "Strong retention/install driver and clear consumer-facing value.",
    },
    {
      id: "community-price-verification",
      title: "Community price verification",
      USER_VALUE: 3,
      INSTALL_DRIVER: 2,
      MISSION_FIT: 5,
      DATA_READINESS: 3,
      IMPL_COST: 3,
      total: 16,
      buildReadiness: "scope-first",
      reasoning: "Promising, but trust-model and confidence-scoring design should come first.",
    },
    {
      id: "price-war-alerts",
      title: "Bensinkrig-varsler",
      USER_VALUE: 5,
      INSTALL_DRIVER: 5,
      MISSION_FIT: 4,
      DATA_READINESS: 1,
      IMPL_COST: 2,
      total: 17,
      buildReadiness: "blocked",
      reasoning: "Huge upside, but poor coverage can create false negatives and weaken trust.",
    },
    {
      id: "data-licensing",
      title: "Data licensing/API layer",
      USER_VALUE: 2,
      INSTALL_DRIVER: 1,
      MISSION_FIT: 2,
      DATA_READINESS: 2,
      IMPL_COST: 1,
      total: 8,
      buildReadiness: "deferred",
      reasoning: "Strategically relevant later, but weak near-term fit for a starter-kit core.",
    },
  ],

  findings: {
    highestImmediateValue: "national-fuel-barometer",
    bestGrowthLever: "fuel-savings-tracker",
    bestDataQualityPlay: "community-price-verification",
    biggestNorthStarIdea: "price-war-alerts",
    weakestNearTermCandidate: "data-licensing",
  },

  top10StyleRoadmapView: [
    "1. National barometer",
    "2. Savings tracker",
    "3. Nearby cheapest view",
    "4. Price alerts",
    "5. Governance/admin integration",
    "6. Community price verification (scope first)",
    "7. Community station validation (scope first)",
    "8. Gamification 2.0",
    "9. Predictive fill timing",
    "10. Route-based cheapest alert",
  ],

  oneSafeNextStep:
    "Use ROADMAP.jsx as canonical source and keep product audits as read-only analysis that informs, but does not replace, roadmap governance.",
};

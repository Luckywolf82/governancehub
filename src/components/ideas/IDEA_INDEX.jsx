/*
IDEA_INDEX — GovernanceHub Product Intelligence
Central idea bank for capability-level prioritization.

Structure: each idea carries value/feasibility dimensions for deterministic scoring.
This file is read-only source-of-truth. Do not add CRUD here.
*/

export const IDEA_INDEX = {
  version: "1.0.0",
  updatedAt: "2026-03-15",
  scope: "GovernanceHub capability prioritization — governance tooling, repo intelligence, project management",
  ideas: [

    // ── Repo Onboarding ────────────────────────────────────────────────────────
    {
      ideaId: "repo-onboarding-flow",
      title: "Repo Onboarding Flow",
      description: "Guided step-by-step onboarding for registering a new repository into GovernanceHub, including capability detection and initial health check.",
      category: "repo-management",
      stage: "concept",
      strategicType: "foundation",
      ideaType: "capability",
      value: { userValue: 5, installDriver: 4, missionFit: 5 },
      feasibility: { implementationCost: 2, technicalRisk: 1, dependencyRisk: 1 },
      notes: "Critical foundation — blocks several downstream capabilities. Low tech risk. High onboarding value.",
    },

    // ── Start Prompt Generator ─────────────────────────────────────────────────
    {
      ideaId: "start-prompt-generator",
      title: "Start Prompt Generator",
      description: "Generate a structured AI context-primer for any registered repo: reads repo manifest, capabilities, audit index, and produces a ready-to-paste AI prompt.",
      category: "ai-tooling",
      stage: "concept",
      strategicType: "multiplier",
      ideaType: "capability",
      value: { userValue: 5, installDriver: 5, missionFit: 5 },
      feasibility: { implementationCost: 2, technicalRisk: 1, dependencyRisk: 2 },
      notes: "Enormous practical value. Directly reduces friction of working with AI agents on governed repos.",
    },

    // ── Governance Starter Kit Export ─────────────────────────────────────────
    {
      ideaId: "governance-starter-kit-export",
      title: "Governance Starter Kit Export",
      description: "One-click export of the canonical GovernanceHub governance files (AUDIT_INDEX, AI_STATE, LOCKED_FILES, PhaseExecutionLog, etc.) as a versioned starter kit for new projects.",
      category: "governance",
      stage: "concept",
      strategicType: "distribution",
      ideaType: "capability",
      value: { userValue: 4, installDriver: 5, missionFit: 5 },
      feasibility: { implementationCost: 2, technicalRisk: 1, dependencyRisk: 1 },
      notes: "High mission fit — GovernanceHub's primary output is a governance system. Exporting it is a natural distribution vector.",
    },

    // ── Project Bootstrap Flow ─────────────────────────────────────────────────
    {
      ideaId: "project-bootstrap-flow",
      title: "Project Bootstrap Flow",
      description: "Guided flow to initialize a new project entry in GovernanceHub: create project record, link repo, set initial audit scope, generate bootstrap PhaseExecutionLog entry.",
      category: "project-management",
      stage: "concept",
      strategicType: "foundation",
      ideaType: "capability",
      value: { userValue: 4, installDriver: 4, missionFit: 5 },
      feasibility: { implementationCost: 2, technicalRisk: 1, dependencyRisk: 2 },
      notes: "Reduces cold-start friction significantly. Would make GovernanceHub onboardable in under 5 minutes.",
    },

    // ── Issue / Task Channel Selector ─────────────────────────────────────────
    {
      ideaId: "issue-task-channel-selector",
      title: "Issue / Task Channel Selector",
      description: "Allow users to select per-audit where the action lands: GitHub issue, Base44 prompt, Copilot task, manual clipboard. Currently implied — make it explicit and configurable.",
      category: "workflow",
      stage: "concept",
      strategicType: "ux",
      ideaType: "workflow",
      value: { userValue: 4, installDriver: 3, missionFit: 4 },
      feasibility: { implementationCost: 2, technicalRisk: 1, dependencyRisk: 1 },
      notes: "Orchestrator already has channel-specific outputs. Making the intent explicit reduces operator confusion.",
    },

    // ── Copilot Task Bridge ────────────────────────────────────────────────────
    {
      ideaId: "copilot-task-bridge",
      title: "Copilot Task Bridge",
      description: "Structured integration between GovernanceHub audits and GitHub Copilot task format — auto-generate copilot-ready task prompts from audit output.",
      category: "ai-tooling",
      stage: "concept",
      strategicType: "multiplier",
      ideaType: "integration",
      value: { userValue: 5, installDriver: 4, missionFit: 4 },
      feasibility: { implementationCost: 2, technicalRisk: 1, dependencyRisk: 2 },
      notes: "Already partially exists in orchestrator. Formalizing it as a first-class channel would increase adoption.",
    },

    // ── Repo Manifest System ───────────────────────────────────────────────────
    {
      ideaId: "repo-manifest-system",
      title: "Repo Manifest System",
      description: "A machine-readable repo manifest file format (.governancehub.json) describing the repo structure, capabilities, governance files, and project links — living in each registered repo.",
      category: "repo-intelligence",
      stage: "concept",
      strategicType: "foundation",
      ideaType: "architecture",
      value: { userValue: 3, installDriver: 3, missionFit: 5 },
      feasibility: { implementationCost: 3, technicalRisk: 2, dependencyRisk: 2 },
      notes: "Unlocks many downstream capabilities. Technically moderate risk — needs versioning discipline.",
    },

    // ── Repo Verification Bundles ─────────────────────────────────────────────
    {
      ideaId: "repo-verification-bundles",
      title: "Repo Verification Bundles",
      description: "Pre-packaged verification checklists specific to repo type (Base44 app, Node service, Python library, etc.) — loaded when a repo is registered and run on demand.",
      category: "repo-intelligence",
      stage: "concept",
      strategicType: "depth",
      ideaType: "governance",
      value: { userValue: 4, installDriver: 3, missionFit: 5 },
      feasibility: { implementationCost: 3, technicalRisk: 2, dependencyRisk: 2 },
      notes: "Requires repo type taxonomy and some curated bundle content. High mission fit.",
    },

    // ── Project ↔ Repo Linking Model ──────────────────────────────────────────
    {
      ideaId: "project-repo-linking-model",
      title: "Project ↔ Repo Linking Model",
      description: "Formal data model linking GovernanceHub projects to one or more repositories. Currently ad-hoc — needs explicit schema and UI.",
      category: "data-model",
      stage: "concept",
      strategicType: "foundation",
      ideaType: "architecture",
      value: { userValue: 4, installDriver: 3, missionFit: 5 },
      feasibility: { implementationCost: 3, technicalRisk: 2, dependencyRisk: 2 },
      notes: "Pre-requisite for cross-repo dashboard and project health rollup.",
    },

    // ── Audit Scope Taxonomy ───────────────────────────────────────────────────
    {
      ideaId: "audit-scope-taxonomy",
      title: "Audit Scope Taxonomy",
      description: "Formal classification system for audit types, scopes, and evidence sources — making audit categories explicit and machine-readable rather than emergent.",
      category: "governance",
      stage: "concept",
      strategicType: "foundation",
      ideaType: "architecture",
      value: { userValue: 3, installDriver: 2, missionFit: 5 },
      feasibility: { implementationCost: 2, technicalRisk: 1, dependencyRisk: 1 },
      notes: "Low cost, high governance value. Enables better filtering, reporting, and automation rules.",
    },

    // ── Roadmap Generator ─────────────────────────────────────────────────────
    {
      ideaId: "roadmap-generator",
      title: "Roadmap Generator",
      description: "Generate a structured roadmap from scored IDEA_INDEX entries — what we are building now. Make it re-runnable and exportable.",
      category: "product-intelligence",
      stage: "in-progress",
      strategicType: "foundation",
      ideaType: "analytics",
      value: { userValue: 4, installDriver: 3, missionFit: 5 },
      feasibility: { implementationCost: 1, technicalRisk: 1, dependencyRisk: 1 },
      notes: "We are building this now. Stage reflects current implementation.",
    },

    // ── Project Intelligence Engine ────────────────────────────────────────────
    {
      ideaId: "project-intelligence-engine",
      title: "Project Intelligence Engine",
      description: "Per-project health scoring, audit completion tracking, risk surface detection, and recommended next actions — surfaced in the Projects dashboard.",
      category: "product-intelligence",
      stage: "concept",
      strategicType: "depth",
      ideaType: "platform",
      value: { userValue: 5, installDriver: 4, missionFit: 5 },
      feasibility: { implementationCost: 4, technicalRisk: 3, dependencyRisk: 3 },
      notes: "Ambitious. Requires solid data model and project-repo linking first.",
    },

    // ── Cross-Repo Dashboard ───────────────────────────────────────────────────
    {
      ideaId: "cross-repo-dashboard",
      title: "Cross-Repo Dashboard",
      description: "Unified view across all registered repos: open issues, audit status, last verified date, capability coverage — the 'control plane' for multi-repo governance.",
      category: "dashboard",
      stage: "concept",
      strategicType: "scale",
      ideaType: "platform",
      value: { userValue: 5, installDriver: 5, missionFit: 5 },
      feasibility: { implementationCost: 4, technicalRisk: 3, dependencyRisk: 4 },
      notes: "High-value north star. Requires project-repo linking and repo health score first.",
    },

    // ── Repo-Aware Audit Runner ────────────────────────────────────────────────
    {
      ideaId: "repo-aware-audit-runner",
      title: "Repo-Aware Audit Runner",
      description: "The audit runner should be able to target a specific registered repo and run checks against live repo content, not just in-memory governance files.",
      category: "governance",
      stage: "in-progress",
      strategicType: "depth",
      ideaType: "governance",
      value: { userValue: 5, installDriver: 4, missionFit: 5 },
      feasibility: { implementationCost: 3, technicalRisk: 2, dependencyRisk: 2 },
      notes: "Context metadata already implemented. Live repo check integration is next.",
    },

    // ── Audit Context Provenance ───────────────────────────────────────────────
    {
      ideaId: "audit-context-provenance",
      title: "Audit Context Provenance",
      description: "All audit runs and injected audits should carry explicit provenance: who ran it, which repo, which mode, what evidence sources were used.",
      category: "governance",
      stage: "in-progress",
      strategicType: "trustworthiness",
      ideaType: "governance",
      value: { userValue: 3, installDriver: 2, missionFit: 5 },
      feasibility: { implementationCost: 1, technicalRisk: 1, dependencyRisk: 1 },
      notes: "Mostly implemented. Display improvements in orchestrator are the remaining work.",
    },

    // ── Builder Target Profiles ────────────────────────────────────────────────
    {
      ideaId: "builder-target-profiles",
      title: "Builder Target Profiles",
      description: "Define explicit builder personas (solo dev, team lead, agency, open source maintainer) and tailor GovernanceHub defaults to each profile.",
      category: "product-intelligence",
      stage: "concept",
      strategicType: "positioning",
      ideaType: "integration",
      value: { userValue: 3, installDriver: 3, missionFit: 3 },
      feasibility: { implementationCost: 2, technicalRisk: 1, dependencyRisk: 1 },
      notes: "Useful for onboarding messaging and capability recommendation. Not urgent.",
    },

    // ── Repo Health Score ─────────────────────────────────────────────────────
    {
      ideaId: "repo-health-score",
      title: "Repo Health Score",
      description: "A single composite score per repo reflecting governance coverage, audit freshness, capability completeness, and open issue count.",
      category: "repo-intelligence",
      stage: "concept",
      strategicType: "depth",
      ideaType: "analytics",
      value: { userValue: 5, installDriver: 4, missionFit: 5 },
      feasibility: { implementationCost: 3, technicalRisk: 2, dependencyRisk: 3 },
      notes: "High-value signal. Requires project-repo linking and several upstream capabilities.",
    },

    // ── AI Governance Playbooks ────────────────────────────────────────────────
    {
      ideaId: "ai-governance-playbooks",
      title: "AI Governance Playbooks",
      description: "Curated, structured playbooks for common governance scenarios (e.g. 'adding a new feature', 'fixing an audit finding', 'onboarding a new repo') — consumable by AI agents or human operators.",
      category: "governance",
      stage: "concept",
      strategicType: "depth",
      ideaType: "workflow",
      value: { userValue: 4, installDriver: 3, missionFit: 5 },
      feasibility: { implementationCost: 3, technicalRisk: 1, dependencyRisk: 1 },
      notes: "Strong mission fit. Would complement AI_PROJECT_INSTRUCTIONS with scenario-specific guidance.",
    },

    // ── Audit Scope Model ─────────────────────────────────────────────────────
    {
      ideaId: "audit-scope-model",
      title: "Audit Scope Model",
      description: "Introduce explicit audit scopes (repo, multi-repo, project, global) so audits can run consistently across different contexts.",
      category: "governance",
      stage: "concept",
      strategicType: "foundation",
      ideaType: "governance",
      value: { userValue: 4, installDriver: 3, missionFit: 5 },
      feasibility: { implementationCost: 1, technicalRisk: 1, dependencyRisk: 1 },
      notes: "Required prerequisite for multi-repo audits and audit definition generator.",
    },

    // ── Multi-Repo Audit Runner ────────────────────────────────────────────────
    {
      ideaId: "multi-repo-audit-runner",
      title: "Multi-Repo Audit Runner",
      description: "Extend the audit runner so a single audit can run across multiple repositories to detect governance drift, architecture inconsistencies, and missing capabilities.",
      category: "governance",
      stage: "concept",
      strategicType: "governance-core",
      ideaType: "governance",
      value: { userValue: 5, installDriver: 4, missionFit: 5 },
      feasibility: { implementationCost: 2, technicalRisk: 2, dependencyRisk: 1 },
      notes: "Requires audit scope model and repo[] support in the audit runner.",
    },

    // ── Audit Definition Generator ────────────────────────────────────────────
    {
      ideaId: "audit-definition-generator",
      title: "Audit Definition Generator",
      description: "Allow users to generate new audit definitions using structured prompts (Copilot, GitHub issue, or Base44). Generated audits follow the governance audit schema and are stored as draft audits.",
      category: "ai-tooling",
      stage: "concept",
      strategicType: "platform-capability",
      ideaType: "integration",
      value: { userValue: 5, installDriver: 4, missionFit: 4 },
      feasibility: { implementationCost: 3, technicalRisk: 2, dependencyRisk: 2 },
      notes: "Outputs governance-compliant audit templates and supports export to Copilot, GitHub issues, or Base44.",
    },

  ],
};
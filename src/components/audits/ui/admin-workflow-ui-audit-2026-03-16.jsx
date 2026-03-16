// Admin Workflow and UI Clarity Audit — 2026-03-16
// ui-001
// Category: UI / Workflow
// Status: verified
// Evidence source: repo-derived
// Project: GovernanceHub (projectId: governancehub, projectSlug: governancehub)
//
// This audit was produced by direct file inspection.
// No UI changes were implemented. This is analysis only.

export const ADMIN_WORKFLOW_UI_AUDIT = {
  meta: {
    id: "ui-001",
    title: "Admin Workflow and UI Clarity Audit",
    category: "ui",
    type: "Workflow and UX Clarity Audit",
    status: "verified",
    date: "2026-03-16",
    projectId: "governancehub",
    projectSlug: "governancehub",
    preliminary: false,
    evidenceSource: "repo-derived",
  },

  // ── A. Files read ─────────────────────────────────────────────────────────────
  filesRead: [
    "src/pages/Admin.jsx",
    "src/pages/AdminDashboard.jsx",
    "src/App.jsx",
    "src/components/AppLayout.jsx",
    "src/components/ActiveRepoContext.jsx",
    "src/components/admin/AuditRunnerPanel.jsx",
    "src/components/admin/BuildIntegrityBanner.jsx",
    "src/components/admin/DispatchReviewPanel.jsx",
    "src/components/admin/ExecutionLogPanel.jsx",
    "src/components/admin/GovernanceOrchestratorPanel.jsx",
    "src/components/admin/GovernanceStarterKitPanel.jsx",
    "src/components/admin/INSTALL_READINESS_CHECK.jsx",
    "src/components/admin/ProductIntelligencePanel.jsx",
    "src/components/admin/ProjectBootstrapPanel.jsx",
    "src/components/admin/PromptApprovalGate.jsx",
    "src/components/admin/PromptPreviewPanel.jsx",
    "src/components/admin/RepoRawAccessPanel.jsx",
    "src/components/admin/RepoVerificationPanel.jsx",
    "src/components/admin/RepositoryManagerPanel.jsx",
    "src/components/admin/StartPromptGeneratorPanel.jsx",
    "src/components/admin/orchestratorEngine.jsx",
    "src/components/governance/AI_STATE.jsx",
    "src/components/governance/NextSafeStep.jsx",
    "src/components/governance/ExecutionWorker.jsx",
    "src/components/governance/Verification.jsx",
    "src/components/governance/ExecutionLog.jsx",
    "src/components/audits/AUDIT_INDEX.jsx",
    "src/components/audits/architecture/admin-roadmap-surface-placement-audit-2026-03-16.jsx",
    "src/components/audits/architecture/admin-ui-file-placement-canonical-audit-2026-03-15.jsx",
  ],

  finding: {
    summary:
      "Admin.jsx is the canonical active admin shell with a 4-tab layout (Govern, Setup, Build Prep, Strategy). The Govern tab is the default landing tab despite Setup being the prerequisite to all governed work. The Govern tab contains 8 stacked panels, 5 of which (DispatchReviewPanel, PromptPreviewPanel, ExecutionWorker, Verification, ExecutionLog) are read-only non-operational gov-006 pipeline surfaces with no current actionable value. The active repo selector is split between the global header and inline status banners on 3 of 4 tabs. There is no onboarding path, no primary next-action surface, and no progressive disclosure — the full Admin surface is presented at all times regardless of operator context. The page currently feels like a collection of control surfaces, not a guided workflow.",

    // ── B. Current workflow reconstruction ────────────────────────────────────
    workflowReconstruction: {
      description:
        "The actual sequence an operator must mentally reconstruct from the current UI, as it exists today.",
      steps: [
        "1. Operator lands on /Admin. Auth-gated. Default tab: Govern.",
        "2. Govern tab renders immediately: active repo indicator (amber warning if no repo set), AuditRunnerPanel, GovernanceOrchestratorPanel, ExecutionLogPanel, DispatchReviewPanel, PromptPreviewPanel, ExecutionWorker, Verification, ExecutionLog.",
        "3. Operator sees amber 'Ingen aktivt repo valgt' banner — must navigate to AppLayout global header to select a repo from a small dropdown.",
        "4. To register a repo for the first time, the operator must switch to the Setup tab, open RepositoryManagerPanel, fill out owner/repo fields, save.",
        "5. After repo registration, operator must return to the global header to select the newly enabled repo as the active context.",
        "6. Now the operator can return to Govern tab. AuditRunnerPanel's governance checks run against AI_STATE, NextSafeStep, LockedFiles, AI_PROJECT_INSTRUCTIONS.",
        "7. If checks pass: operator copies audit output, uses GovernanceOrchestratorPanel to select an audit, generate issue prep, execution log draft, or dispatch recommendation.",
        "8. ExecutionLogPanel shows PhaseExecutionLog entries with verification status — most recent first.",
        "9. Below ExecutionLogPanel: DispatchReviewPanel, PromptPreviewPanel, ExecutionWorker, Verification, ExecutionLog are all visible and require significant scrolling past, despite all being read-only and non-operational in the current governance phase.",
        "10. To generate a start prompt or governance starter kit, operator must switch to Build Prep tab.",
        "11. Strategy tab contains PromptApprovalGate (governance inspection), ProductIntelligencePanel (roadmap + ideas), doc links, and system info — a heterogeneous mix with no clear workflow purpose.",
        "12. There is no surface anywhere in Admin.jsx that shows the current NEXT_SAFE_STEP value prominently as a primary call to action.",
      ],
    },

    // ── C. Workflow clarity assessment ────────────────────────────────────────
    workflowClarityAssessment: {
      clear: [
        "AuditRunnerPanel → GovernanceOrchestratorPanel coupling is correct and the injection handoff (onUseInOrchestrator) works well.",
        "The active repo indicator banners (amber/green) in each tab correctly signal whether context is set.",
        "ExecutionLogPanel placement (after GovernanceOrchestratorPanel) is sequentially logical for post-execution review.",
        "Setup tab content (RepositoryManagerPanel + ProjectBootstrapPanel) is logically grouped.",
        "Build Prep tab content (StartPromptGeneratorPanel + GovernanceStarterKitPanel) is appropriately grouped.",
      ],
      unclear: [
        "First required action is invisible: landing on Govern tab when no repo exists gives an amber warning but no actionable guidance about what to do or where to go first.",
        "Tab ordering inverts the logical workflow: Govern (downstream) precedes Setup (prerequisite), then Build Prep (preparation), then Strategy (orientation). The correct progression is Setup → Build Prep → Govern → Strategy or similar.",
        "NEXT_SAFE_STEP (src/components/governance/NextSafeStep.jsx) exists as a data source but is never surfaced as a primary call to action in Admin.jsx — it is only used internally by AuditRunnerPanel for a governance check.",
        "The global repo selector in AppLayout is the only place to set active repo context, but the inline banners in Govern and Build Prep tabs point there with only a text hint ('Velg repo i toppmenyen'). A first-time operator may not immediately understand the header dropdown's role.",
        "PromptApprovalGate in Strategy tab reads as a governance compliance surface but is placed alongside product roadmap data and system info — three entirely different concerns sharing one tab with no clear unifying purpose.",
        "The relationship between AuditRunnerPanel, GovernanceOrchestratorPanel, and the downstream governance pipeline (DispatchReviewPanel through ExecutionLog) is not explained anywhere. An operator must infer that the bottom 5 panels represent a future execution pipeline that is not yet operational.",
      ],
    },

    // ── D. Structural UI problems ─────────────────────────────────────────────
    structuralUIProblems: [
      {
        id: "S1",
        problem: "Default tab is Govern, but Setup is the prerequisite",
        detail:
          "An operator who has not yet registered a repository lands directly on the Govern tab, which shows governance checks that cannot pass without a repo context. The Setup tab — where repos are registered — is the correct first action but is tab 2. This is a sequencing inversion. The default landing tab should be the first required step, not the downstream workflow.",
        severity: "high",
      },
      {
        id: "S2",
        problem: "5 non-operational gov-006 panels inflate Govern tab to 8 panels",
        detail:
          "DispatchReviewPanel, PromptPreviewPanel, ExecutionWorker, Verification, and ExecutionLog are all clearly labeled gov-006 Phase 5–11. All are read-only. None are connected to execution runtime. All produce 'execution not connected' states. They consume the majority of the Govern tab's scroll depth while providing zero actionable value in the current governance phase. They are governance scaffolding surfaces masquerading as active workflow components.",
        severity: "high",
      },
      {
        id: "S3",
        problem: "Active repo context is split across two surfaces",
        detail:
          "The global repo selector lives in AppLayout's sticky header (a small dropdown labeled 'Aktivt repo'). Inline amber/green repo indicator banners appear separately on Govern, Build Prep, and Strategy tabs. An operator unfamiliar with the system must discover that the header dropdown is the canonical place to set repo context — the inline banners say 'Velg repo i toppmenyen' but this is a text instruction, not a navigation affordance. Repo selection is a precondition for all downstream work, but it is presented as a subtle header utility rather than a required first step.",
        severity: "high",
      },
      {
        id: "S4",
        problem: "No primary next-action surface — NEXT_SAFE_STEP is invisible",
        detail:
          "NEXT_SAFE_STEP.jsx exists as a canonical data source for the current recommended next action. It is imported by AuditRunnerPanel only for internal governance checks. It is never surfaced as a primary CTA in Admin.jsx. The operator must either run the AuditRunnerPanel governance check or know to look at NEXT_SAFE_STEP.jsx directly. There is no 'recommended next step' panel or persistent CTA anywhere in the Admin UI.",
        severity: "high",
      },
      {
        id: "S5",
        problem: "Strategy tab has no coherent purpose",
        detail:
          "The Strategy tab contains: PromptApprovalGate (governance compliance), ProductIntelligencePanel (roadmap + ideas + ROADMAP data), documentation links, and system info. These are four orthogonal concern domains. PromptApprovalGate is a governance state inspection surface and has nothing to do with strategic product planning. Documentation links and system info are reference utilities. The tab's name suggests strategic planning but its content mix makes it impossible to form a clear mental model of what this tab is for.",
        severity: "medium",
      },
      {
        id: "S6",
        problem: "GovernanceOrchestratorPanel (86KB) is the largest file in admin, placed without a summary header",
        detail:
          "GovernanceOrchestratorPanel.jsx is 86KB — nearly three times the size of any other admin panel. It has no collapsed/expanded state in Admin.jsx; it renders fully at all times on the Govern tab. On first visit, an operator sees a large, fully-expanded orchestrator panel immediately after AuditRunnerPanel with no summary of what it does or when to use it. The inline tab description 'Kjør audit → Bruk i Orchestrator → Opprett issue → Verifiser' is the only workflow guide, and it appears above the panels rather than adjacent to them.",
        severity: "medium",
      },
      {
        id: "S7",
        problem: "No onboarding path for first-time operators",
        detail:
          "There is no new-user path, guided setup sequence, or readiness checklist visible on first load. A first-time admin who does not already know the governance workflow will see: BuildIntegrityBanner, 4 unmarked tabs, and (on the Govern tab) a large set of governance check panels that fail because no repo or governance data has been set up. There is nothing that says 'start here' or 'complete these steps before proceeding.'",
        severity: "high",
      },
      {
        id: "S8",
        problem: "BuildIntegrityBanner is always visible above all tabs",
        detail:
          "BuildIntegrityBanner is rendered above the tab bar on every tab, on every visit. It shows the build date marker and a reload button. This is a useful debug signal but adds visual weight to the top of every tab view. Its current placement makes it feel like a primary notice rather than a system status footnote.",
        severity: "low",
      },
    ],

    // ── E. Information hierarchy problems ─────────────────────────────────────
    informationHierarchyProblems: [
      {
        id: "H1",
        problem: "All panels use identical visual weight",
        detail:
          "Every panel uses the same Card + CardHeader + CardContent structure with the same border, padding, and text sizing. AuditRunnerPanel (primary workflow action), ExecutionLog (read-only non-operational scaffold), and system info all render at the same visual weight. There is no distinction between primary actions, secondary status surfaces, and reference information.",
      },
      {
        id: "H2",
        problem: "NEXT_SAFE_STEP is secondary everywhere but should be primary",
        detail:
          "The canonical recommended next action (NextSafeStep.jsx) is never shown at primary visual weight. It is only referenced inside AuditRunnerPanel as a governance check data source. The operator must run a full governance check pass to see the current recommended next step.",
      },
      {
        id: "H3",
        problem: "Read-only scaffolding panels have equal presence to actionable panels",
        detail:
          "DispatchReviewPanel, PromptPreviewPanel, ExecutionWorker, Verification, and ExecutionLog are all read-only, present 'execution not connected' states, and cannot be interacted with productively. They render at the same visual weight and depth as AuditRunnerPanel and GovernanceOrchestratorPanel, which are the actual actionable workflow tools.",
      },
      {
        id: "H4",
        problem: "Tab labels do not describe phase in the governance workflow",
        detail:
          "Tab names are 'Govern', 'Setup', 'Build Prep', 'Strategy'. These names do not carry sequencing information. 'Govern' suggests the most important/ongoing thing, but in the actual workflow it is the downstream step. 'Setup' is the first required step but its name carries no urgency or primacy signal.",
      },
      {
        id: "H5",
        problem: "Inline repo banners repeat the same status across three tabs",
        detail:
          "The active repo status indicator (green/amber pill) appears identically on Govern, Build Prep, and Strategy tabs. The operator sees the same status message three times across three tabs, each time with a slightly different downstream note ('audit og issue-targeting', 'prompt og starter kit', 'downstream-flyt'). This repetition adds density without new information.",
      },
    ],

    // ── F. Onboarding-to-governance gap analysis ──────────────────────────────
    onboardingToGovernanceGap: {
      summary:
        "There is no explicit onboarding-to-governance transition. The gap is total: onboarding is not separated from governance work at all — both exist inside the same Admin shell with no guided sequence, no completion indicator, and no readiness gate.",
      specificGaps: [
        "Gap 1 — No onboarding entry point: The Admin page has no 'first run' detection or onboarding state. A new operator who has never registered a repo, bootstrapped a project, or set up governance sees the full Admin surface immediately with no guidance about what to do first.",
        "Gap 2 — Repo registration is buried in Setup tab, tab 2: The first required action (register a repository) is not the first thing shown. The operator must discover that Setup is the starting point by reading tab labels.",
        "Gap 3 — No completion signal for onboarding: There is nothing in the Admin UI that signals when onboarding is complete. After registering a repo, bootstrapping a project, and installing governance, no status surface confirms 'you are ready for governed work.' The operator must infer readiness from the absence of warning states.",
        "Gap 4 — INSTALL_READINESS_CHECK exists but is buried inside GovernanceStarterKitPanel: The INSTALL_READINESS_CHECK component checks whether canonical governance files exist in the connected repo. This is exactly the readiness gate an operator needs after onboarding. But it is rendered inside GovernanceStarterKitPanel in Build Prep tab — not at the top of the workflow, not on the Govern tab, and not in a dedicated readiness section.",
        "Gap 5 — Governance check results do not translate to 'next action': AuditRunnerPanel runs governance checks and shows pass/warn/fail for several conditions. When checks fail, the panel reports what failed but does not tell the operator exactly what to do next in the Admin UI. The operator must mentally translate a 'fail' state into an action (e.g., 'PLACEHOLDER in AI_STATE' → go fix AI_STATE.jsx → but that requires a code change, not an Admin UI action).",
        "Gap 6 — No progressive gate before governance work begins: Governance work (running audits, using the orchestrator, creating issues) is available even when governance files are in placeholder state or no repo is selected. There is no blocker UI that prevents the operator from starting Govern-tab work before onboarding is complete.",
      ],
    },

    // ── G. Govern tab assessment ───────────────────────────────────────────────
    governTabAssessment: {
      verdict: "Creates overload. Currently not a guided workflow surface.",
      strengths: [
        "AuditRunnerPanel → GovernanceOrchestratorPanel injection handoff is well-designed and the coupling between these two panels is correct.",
        "ExecutionLogPanel placement after GovernanceOrchestratorPanel follows the correct audit → plan → log sequence.",
        "The active repo indicator at the top of the tab is a good pattern; it ensures repo context is visible.",
      ],
      problems: [
        "OVERLOAD: 8 stacked panels with no collapsed state, no progressive disclosure, and no visual hierarchy differentiation. An operator who wants to run an audit must scroll past all of these panels to return to the top.",
        "NON-OPERATIONAL WEIGHT: DispatchReviewPanel, PromptPreviewPanel, ExecutionWorker, Verification, ExecutionLog (gov-006 Phases 5–11) render at full card weight despite being non-operational read-only scaffolding. They create the impression of a complete execution pipeline when in reality the pipeline is not connected. The operator sees a lot of structure signaling 'this is ready' while all these surfaces actually say 'execution not connected.'",
        "SEQUENCE CONFUSION: The tab description reads 'Kjør audit → Bruk i Orchestrator → Opprett issue → Verifiser' — this is a sequential workflow hint but the panels below do not map cleanly to this description. The verification step ('Verifiser') is both ExecutionLogPanel's verification badges AND the downstream Verification component — two different things called by the same name in the same conceptual description.",
        "NO FRAMING SHELL: There is no top-level shell that explains the Govern tab's purpose, current governance state, or recommended action. The operator arrives at Govern and sees panels — not a status overview.",
        "TOO-VERBOSE AT LOW SIGNAL: The downstream governance pipeline panels (gov-006) each render multiple expanded sections showing precondition evaluations, dispatch condition checks, and evidence availability checks — all returning negative results ('execution not connected', 'not evaluable', 'missing'). A wall of negative-state checks adds scanning burden with zero actionable output.",
      ],
      recommendation:
        "Govern tab should be restructured to: (1) a top-level status/framing shell showing current AI_STATE, NEXT_SAFE_STEP, and active repo; (2) AuditRunnerPanel and GovernanceOrchestratorPanel as the primary workflow area; (3) ExecutionLogPanel as a secondary review surface; (4) the 5 gov-006 panels collapsed by default or deferred to a separate 'Pipeline (preview)' section that is clearly marked as non-operational.",
    },

    // ── H. Mobile/webview risk assessment ─────────────────────────────────────
    mobileWebviewRiskAssessment: {
      summary:
        "The current Admin UI is high-risk for mobile/webview deployment. The primary risks are vertical overload, too many simultaneous decisions, insufficient sticky context, and no progressive disclosure. These problems exist on desktop but become unworkable on mobile.",
      risks: [
        {
          id: "M1",
          risk: "Vertical overload — Govern tab",
          detail:
            "The Govern tab has 8 stacked full-width card panels, several of which are internally very long (AuditRunnerPanel renders a full governance check with expandable sections; GovernanceOrchestratorPanel is 86KB). On a 375px viewport, an operator would need to scroll through an estimated 8,000–12,000px of content to reach the bottom of the Govern tab. This is not a usable mobile experience.",
          severity: "critical",
        },
        {
          id: "M2",
          risk: "Tab bar width — 4 tabs with medium-length labels",
          detail:
            "The tab bar has 4 buttons: 'Govern', 'Setup', 'Build Prep', 'Strategy'. At 375px viewport, 'Build Prep' is likely to overflow or require font size reduction. The tab bar does not adapt to narrow viewports. No horizontal scroll or alternative navigation is provided.",
          severity: "high",
        },
        {
          id: "M3",
          risk: "Global repo selector in header is touch-hostile",
          detail:
            "The active repo selector is a small native <select> element inside the sticky header, sandwiched between the brand logo and the navigation links. On mobile, the header row at h-14 (56px) must accommodate: brand logo, repo label + select dropdown, and 4+ nav items. This will either overflow or require the nav items to collapse. The repo selector — a critical precondition action — would likely become inaccessible or very difficult to use in a webview.",
          severity: "critical",
        },
        {
          id: "M4",
          risk: "Too many simultaneous decisions on every tab",
          detail:
            "Each tab presents multiple panels simultaneously with no progressive reveal. Mobile UX requires one primary decision per screen or scroll zone. The current Admin pattern of showing all panels at once is desktop-native. On mobile, every tab would present the operator with 3–8 full-card panels in sequence, creating decision paralysis.",
          severity: "high",
        },
        {
          id: "M5",
          risk: "No sticky context — repo and step context disappears on scroll",
          detail:
            "The active repo indicator banner is near the top of several tabs. On mobile, the operator scrolls down into AuditRunnerPanel or GovernanceOrchestratorPanel and loses visibility of the active repo context entirely. There is no sticky context bar that persists as the operator scrolls. Without sticky context, operators in a webview environment may lose track of which repo they are operating in.",
          severity: "high",
        },
        {
          id: "M6",
          risk: "No progressive disclosure — full complexity on first view",
          detail:
            "The Admin page has no collapsible sections, no progressive onboarding, and no 'show more / show less' controls at the tab level. For mobile, the entire complexity of each tab is presented immediately. Webview contexts typically expect apps to reveal complexity progressively as the operator needs it.",
          severity: "high",
        },
        {
          id: "M7",
          risk: "Copy-to-clipboard actions are primary interactions",
          detail:
            "Multiple panels (AuditRunnerPanel, StartPromptGeneratorPanel, GovernanceStarterKitPanel, GovernanceOrchestratorPanel) are primarily copy-to-clipboard tools. On mobile, clipboard interaction is less predictable and harder to verify. The generated text outputs (prompts, issue prep, execution log drafts) are long and cannot be reviewed on a small screen. Copy-heavy workflows are poorly suited to webview contexts.",
          severity: "medium",
        },
        {
          id: "M8",
          risk: "Weak primary action path — no clear dominant CTA",
          detail:
            "On desktop, the cognitive load of many panels is manageable because the operator can scan the full page. On mobile, the absence of a dominant primary action (no persistent 'run audit' button, no 'next step' CTA) means the operator must scroll through multiple panels to identify what to do. In a webview context, this creates an experience where the operator feels lost on every visit.",
          severity: "high",
        },
      ],
    },

    // ── I. Canonical operator flow proposal ───────────────────────────────────
    canonicalOperatorFlow: {
      description:
        "This is a workflow/order model. It is not a visual redesign. It describes the correct logical sequence an Admin experience should guide operators through.",
      phases: [
        {
          phase: "0 — Entry: Readiness check",
          description:
            "On first Admin visit or when onboarding is incomplete, the operator sees a readiness checklist: (1) repository registered and active, (2) governance files present (INSTALL_READINESS_CHECK), (3) governance placeholders resolved (AuditRunnerPanel check pass). This is a gate, not just a status display. Once all three are green, the operator proceeds to the main Admin workflow.",
          currentGap:
            "This phase does not exist. There is no onboarding gate, no readiness checklist, and no progression signal.",
        },
        {
          phase: "1 — Setup: Repository and project",
          description:
            "Operator registers the target repository (RepositoryManagerPanel), selects it as the active repo, and bootstraps or links the project (ProjectBootstrapPanel). Completion: repo appears as active in the header and in-tab status banners turn green.",
          currentGap:
            "Setup tab is tab 2. RepositoryManagerPanel and ProjectBootstrapPanel exist but have no completion signal. The connection between 'repo registered here' and 'now select it in the header' is not explained.",
        },
        {
          phase: "2 — Build Prep: Governance foundation",
          description:
            "Operator installs governance starter kit to the connected repo (GovernanceStarterKitPanel + INSTALL_READINESS_CHECK), generates the initial start prompt for the AI agent (StartPromptGeneratorPanel). Completion: INSTALL_READINESS_CHECK shows all canonical files present.",
          currentGap:
            "Build Prep tab is tab 3. INSTALL_READINESS_CHECK is buried inside GovernanceStarterKitPanel without a dedicated readiness view. There is no explicit completion indicator that says 'governance foundation is installed.'",
        },
        {
          phase: "3 — Govern: Active development cycle",
          description:
            "Operator runs audit (AuditRunnerPanel), sends findings to orchestrator (GovernanceOrchestratorPanel → inject audit), generates issue prep or dispatch recommendation, creates GitHub issue. After implementation: verifies entry in ExecutionLogPanel. Repeats.",
          currentGap:
            "This phase works but is buried under 5 non-operational panels (gov-006) that are not yet part of the active development cycle. NEXT_SAFE_STEP is not surfaced as the entry point.",
        },
        {
          phase: "4 — Strategy: Review and orientation",
          description:
            "Operator reviews product roadmap and idea priorities (ProductIntelligencePanel), reviews prompt approval status (PromptApprovalGate), accesses documentation. This is reference and review work — not active workflow.",
          currentGap:
            "Strategy tab currently mixes three orthogonal concerns (governance compliance, product strategy, system info). It should be a clear reference/orientation surface.",
        },
      ],
      keyPrinciples: [
        "One primary action per tab — the tab's name should describe its primary purpose, not its domain.",
        "NEXT_SAFE_STEP should be the first visible element in the Govern tab, as a primary CTA.",
        "Active repo context must be persistent and visible — either sticky within the tab or reliably visible without scrolling.",
        "Non-operational scaffolding panels (gov-006 pipeline) should be collapsed by default with a clear label that they represent a future governance phase.",
        "Onboarding completion must be explicitly signaled before the Govern workflow is surfaced.",
      ],
    },

    // ── J. Safe restructuring plan ─────────────────────────────────────────────
    safeRestructuringPlan: {
      description:
        "The smallest safe next implementation step to improve clarity without redesigning the whole app.",
      recommendedFirstStep:
        "Add a collapsed-by-default section in the Govern tab for the 5 non-operational gov-006 panels (DispatchReviewPanel, PromptPreviewPanel, ExecutionWorker, Verification, ExecutionLog), labeled 'Execution pipeline (coming soon — non-operational)'. This single change removes the scroll-depth overload from the Govern tab without moving, deleting, or restructuring any panels. It immediately surfaces AuditRunnerPanel, GovernanceOrchestratorPanel, and ExecutionLogPanel as the Govern tab's primary workflow without any other changes. It is reversible. It requires only Admin.jsx changes.",
      secondStep:
        "Surface NEXT_SAFE_STEP as a small read-only status card at the top of the Govern tab, above the active repo indicator. This surfaces the canonical recommended next action that currently exists in governance data but is never shown to the operator.",
      thirdStep:
        "Reorder the tabs to Setup → Build Prep → Govern → Strategy and change the default tab from 'Govern' to 'Setup' when no active repo is set (or universally, since Setup is always the prerequisite). This is a 2-line change in Admin.jsx (TABS array reorder + initial state logic).",
      subsequentSteps: [
        "Add a readiness checklist to the top of the Setup tab that summarizes: repo registered, repo selected, governance files present (from INSTALL_READINESS_CHECK).",
        "Add explicit completion signal to Build Prep tab when INSTALL_READINESS_CHECK returns 'safe_to_install' or all files present.",
        "Separate Strategy tab into: (a) Product Intelligence + Roadmap (current ProductIntelligencePanel), and (b) Governance Status (PromptApprovalGate + audit index overview). These are two different operator orientations.",
      ],
    },

    // ── K. Explicit non-goals ─────────────────────────────────────────────────
    explicitNonGoals: [
      "Do NOT redesign the page architecture or introduce new routing.",
      "Do NOT modify any governance locked files (AI_PROJECT_INSTRUCTIONS.jsx, LockedFiles.jsx, PhaseExecutionLog.jsx, AUDIT_INDEX.jsx, AUDIT_SYSTEM_GUIDE.jsx) during any follow-up implementation.",
      "Do NOT refactor the component logic inside individual admin panels.",
      "Do NOT connect the gov-006 execution pipeline to real execution — that is a separate governance phase.",
      "Do NOT implement mobile-specific layouts yet — audit the risk, do not redesign for it.",
      "Do NOT move panels to different tabs without first confirming the tab restructuring plan is correct in a follow-up audit.",
      "Do NOT remove any panels — only collapse, reorder, or add framing context.",
      "Do NOT change how ActiveRepoContext works internally — the context model is correct; the presentation of repo selection is the problem.",
    ],

    // ── Structural problem summary ────────────────────────────────────────────
    problem:
      "Admin.jsx presents a full suite of governance control surfaces without a guided operator workflow. The default landing tab (Govern) requires repo setup that lives on tab 2 (Setup). The Govern tab has 8 stacked panels, 5 of which are non-operational read-only scaffolding that inflates scroll depth without providing actionable value. The canonical next recommended action (NEXT_SAFE_STEP) is never surfaced as a primary CTA. There is no onboarding gate, no readiness signal, and no progressive disclosure. The active repo selector is split between the global header and inline banners across three tabs. The page currently resembles a collection of powerful but loosely arranged control surfaces rather than a guided workflow.",

    impact:
      "Operators must mentally reconstruct the correct workflow from tab labels and panel descriptions on every visit. First-time operators have no entry point guidance. The Govern tab's non-operational panel weight creates scanning fatigue and false signals about pipeline readiness. Mobile/webview deployment of the current structure is impractical without significant changes.",

    affectedFiles: [
      "src/pages/Admin.jsx",
      "src/components/admin/AuditRunnerPanel.jsx",
      "src/components/admin/GovernanceOrchestratorPanel.jsx",
      "src/components/admin/ExecutionLogPanel.jsx",
      "src/components/admin/DispatchReviewPanel.jsx",
      "src/components/admin/PromptPreviewPanel.jsx",
      "src/components/governance/ExecutionWorker.jsx",
      "src/components/governance/Verification.jsx",
      "src/components/governance/ExecutionLog.jsx",
      "src/components/admin/ProductIntelligencePanel.jsx",
      "src/components/admin/PromptApprovalGate.jsx",
      "src/components/AppLayout.jsx",
    ],

    requiredChange:
      "This audit is analysis only. No implementation changes are part of this deliverable. Follow-up implementation should begin with the safeRestructuringPlan.recommendedFirstStep: wrap the 5 non-operational gov-006 panels in a collapsed-by-default section in Admin.jsx's Govern tab.",

    constraints: [
      "Do not implement UI changes as part of this audit.",
      "Do not modify locked governance files during audit.",
      "Do not redesign the architecture.",
      "Do not produce code as part of this deliverable.",
      "Follow-up implementation must proceed one safe step at a time, with each step verified in PhaseExecutionLog before the next step begins.",
    ],

    acceptanceCriteria: [
      "Audit data file exists at src/components/audits/ui/admin-workflow-ui-audit-2026-03-16.jsx.",
      "Audit is registered in AUDIT_INDEX as ui-001 with status verified and preliminary: false.",
      "Audit covers all 12 required sections from the problem statement.",
      "All findings are based on direct file inspection of the live repository, not memory or inference.",
      "One safe next step is identified and is implementable without redesigning the architecture.",
    ],
  },

  oneSafeNextStep:
    "Wrap the 5 non-operational gov-006 Govern-tab panels (DispatchReviewPanel, PromptPreviewPanel, ExecutionWorker, Verification, ExecutionLog) in a collapsed-by-default disclosure section in Admin.jsx labeled 'Execution pipeline (preview — non-operational)'. This is a 20-line change to Admin.jsx only, requires no component changes, is fully reversible, and immediately reduces Govern tab scroll-depth overload without any structural risk.",
};

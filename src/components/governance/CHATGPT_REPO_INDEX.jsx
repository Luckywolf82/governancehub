/**
 * CHATGPT_REPO_INDEX.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical repo index for ChatGPT verification.
 * This file is the single source of truth for the GovernanceHub repository
 * structure. It lives in the Base44 source tree and is published to GitHub
 * via normal Base44 Publish — no terminal or build steps required.
 *
 * Raw URL (live after publish):
 *   https://raw.githubusercontent.com/Luckywolf82/governancehub/main/src/components/governance/CHATGPT_REPO_INDEX.js
 *
 * Usage: Paste that raw URL into ChatGPT to begin repo verification.
 */

const RAW  = "https://raw.githubusercontent.com/Luckywolf82/governancehub/main";
const GH   = "https://github.com/Luckywolf82/governancehub/blob/main";

export const CHATGPT_REPO_INDEX = {
  generatedAt:       "2026-03-14",
  repository:        "Luckywolf82/governancehub",
  branch:            "main",
  canonicalArtifact: "CHATGPT_REPO_INDEX.js",
  canonicalRawUrl:   `${RAW}/src/components/governance/CHATGPT_REPO_INDEX.js`,
  canonicalGithubUrl:`${GH}/src/components/governance/CHATGPT_REPO_INDEX.js`,

  // ── Priority files (read these first) ──────────────────────────────────────
  priorityFiles: [
    { path: "src/components/governance/LockedFiles.jsx",            label: "Locked File Registry",    priority: "critical", lockedFile: true,  category: "governance", exists: true, rawUrl: `${RAW}/src/components/governance/LockedFiles.jsx`,            githubUrl: `${GH}/src/components/governance/LockedFiles.jsx` },
    { path: "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",label: "AI Project Instructions", priority: "critical", lockedFile: true,  category: "governance", exists: true, rawUrl: `${RAW}/src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx`, githubUrl: `${GH}/src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx` },
    { path: "src/components/governance/PhaseExecutionLog.jsx",      label: "Phase Execution Log",     priority: "critical", lockedFile: false, category: "governance", exists: true, rawUrl: `${RAW}/src/components/governance/PhaseExecutionLog.jsx`,      githubUrl: `${GH}/src/components/governance/PhaseExecutionLog.jsx` },
    { path: "src/components/governance/AI_STATE.jsx",               label: "AI State",                priority: "critical", lockedFile: false, category: "governance", exists: true, rawUrl: `${RAW}/src/components/governance/AI_STATE.jsx`,               githubUrl: `${GH}/src/components/governance/AI_STATE.jsx` },
    { path: "src/components/governance/NextSafeStep.jsx",           label: "Next Safe Step",          priority: "critical", lockedFile: false, category: "governance", exists: true, rawUrl: `${RAW}/src/components/governance/NextSafeStep.jsx`,           githubUrl: `${GH}/src/components/governance/NextSafeStep.jsx` },
    { path: "src/App.jsx",                                           label: "App Router",              priority: "critical", lockedFile: false, category: "bootstrap",  exists: true, rawUrl: `${RAW}/src/App.jsx`,                                           githubUrl: `${GH}/src/App.jsx` },
  ],

  // ── Locked files ───────────────────────────────────────────────────────────
  lockedFiles: [
    { path: "src/components/governance/LockedFiles.jsx",            label: "Locked File Registry",    rawUrl: `${RAW}/src/components/governance/LockedFiles.jsx` },
    { path: "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",label: "AI Project Instructions", rawUrl: `${RAW}/src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx` },
  ],

  // ── Governance files ───────────────────────────────────────────────────────
  governanceFiles: [
    { path: "src/components/governance/AI_STATE.jsx",              label: "AI State",            rawUrl: `${RAW}/src/components/governance/AI_STATE.jsx` },
    { path: "src/components/governance/NextSafeStep.jsx",          label: "Next Safe Step",      rawUrl: `${RAW}/src/components/governance/NextSafeStep.jsx` },
    { path: "src/components/governance/PhaseExecutionLog.jsx",     label: "Phase Execution Log", rawUrl: `${RAW}/src/components/governance/PhaseExecutionLog.jsx` },
    { path: "src/components/governance/LastVerifiedState.jsx",     label: "Last Verified State", rawUrl: `${RAW}/src/components/governance/LastVerifiedState.jsx` },
    { path: "src/components/governance/TaskGenerator.js",          label: "Task Generator",      rawUrl: `${RAW}/src/components/governance/TaskGenerator.js` },
  ],

  // ── Admin / layout files ───────────────────────────────────────────────────
  adminFiles: [
    { path: "src/pages/Admin.jsx",             label: "Admin Page",   rawUrl: `${RAW}/src/pages/Admin.jsx` },
    { path: "src/components/AppLayout.jsx",    label: "App Layout",   rawUrl: `${RAW}/src/components/AppLayout.jsx` },
  ],

  // ── Routing files ──────────────────────────────────────────────────────────
  routingFiles: [
    { path: "src/App.jsx",         label: "App Router",   rawUrl: `${RAW}/src/App.jsx` },
    { path: "src/pages.config.js", label: "Pages Config", rawUrl: `${RAW}/src/pages.config.js` },
  ],

  // ── Bootstrap files ────────────────────────────────────────────────────────
  bootstrapFiles: [
    { path: "src/main.jsx",   label: "Entry Point",  rawUrl: `${RAW}/src/main.jsx` },
    { path: "package.json",   label: "package.json", rawUrl: `${RAW}/package.json` },
    { path: "vite.config.js", label: "Vite Config",  rawUrl: `${RAW}/vite.config.js` },
  ],

  // ── Read-this-first ordered flows ─────────────────────────────────────────
  readThisFirst: {
    governanceVerification: [
      { step: 1, label: "Locked File Registry",    path: "src/components/governance/LockedFiles.jsx",            reason: "Always read first — defines what cannot change.", rawUrl: `${RAW}/src/components/governance/LockedFiles.jsx`,            githubUrl: `${GH}/src/components/governance/LockedFiles.jsx`,            exists: true },
      { step: 2, label: "AI Project Instructions", path: "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",reason: "Canonical governance rules for AI agents.",        rawUrl: `${RAW}/src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx`,githubUrl: `${GH}/src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx`,exists: true },
      { step: 3, label: "Phase Execution Log",     path: "src/components/governance/PhaseExecutionLog.jsx",      reason: "Full change history. Must read before proposing.",  rawUrl: `${RAW}/src/components/governance/PhaseExecutionLog.jsx`,      githubUrl: `${GH}/src/components/governance/PhaseExecutionLog.jsx`,      exists: true },
      { step: 4, label: "AI State",                path: "src/components/governance/AI_STATE.jsx",               reason: "Current project phase and verification status.",    rawUrl: `${RAW}/src/components/governance/AI_STATE.jsx`,               githubUrl: `${GH}/src/components/governance/AI_STATE.jsx`,               exists: true },
      { step: 5, label: "Next Safe Step",          path: "src/components/governance/NextSafeStep.jsx",           reason: "Approved next action. Do not bypass.",              rawUrl: `${RAW}/src/components/governance/NextSafeStep.jsx`,           githubUrl: `${GH}/src/components/governance/NextSafeStep.jsx`,           exists: true },
      { step: 6, label: "Audit Index",             path: "src/components/audits/AUDIT_INDEX.jsx",                reason: "All audit records.",                                rawUrl: `${RAW}/src/components/audits/AUDIT_INDEX.jsx`,                githubUrl: `${GH}/src/components/audits/AUDIT_INDEX.jsx`,                exists: true },
      { step: 7, label: "Audit System Guide",      path: "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx",         reason: "Audit naming standards and conventions.",           rawUrl: `${RAW}/src/components/audits/AUDIT_SYSTEM_GUIDE.jsx`,         githubUrl: `${GH}/src/components/audits/AUDIT_SYSTEM_GUIDE.jsx`,         exists: true },
      { step: 8, label: "Project Registry",        path: "src/components/projects/PROJECT_REGISTRY.jsx",         reason: "All active and planned projects.",                  rawUrl: `${RAW}/src/components/projects/PROJECT_REGISTRY.jsx`,         githubUrl: `${GH}/src/components/projects/PROJECT_REGISTRY.jsx`,         exists: true },
    ],
    routingVerification: [
      { step: 1, label: "App Router",   path: "src/App.jsx",                      reason: "All routes defined here.",                         rawUrl: `${RAW}/src/App.jsx`,                      githubUrl: `${GH}/src/App.jsx`,                      exists: true },
      { step: 2, label: "Pages Config", path: "src/pages.config.js",              reason: "Legacy page map — verify against App.jsx routes.", rawUrl: `${RAW}/src/pages.config.js`,              githubUrl: `${GH}/src/pages.config.js`,              exists: true },
      { step: 3, label: "App Layout",   path: "src/components/AppLayout.jsx",     reason: "Nav items — must match App.jsx route paths.",      rawUrl: `${RAW}/src/components/AppLayout.jsx`,     githubUrl: `${GH}/src/components/AppLayout.jsx`,     exists: true },
      { step: 4, label: "Home Page",    path: "src/pages/Home.jsx",               reason: "Verify default route target exists.",              rawUrl: `${RAW}/src/pages/Home.jsx`,               githubUrl: `${GH}/src/pages/Home.jsx`,               exists: true },
    ],
    adminVerification: [
      { step: 1, label: "Admin Page",        path: "src/pages/Admin.jsx",                           reason: "Primary admin entry point.",              rawUrl: `${RAW}/src/pages/Admin.jsx`,                           githubUrl: `${GH}/src/pages/Admin.jsx`,                           exists: true },
      { step: 2, label: "Repo Access Panel", path: "src/components/admin/RepoRawAccessPanel.jsx",   reason: "File index and raw URL browser.",          rawUrl: `${RAW}/src/components/admin/RepoRawAccessPanel.jsx`,   githubUrl: `${GH}/src/components/admin/RepoRawAccessPanel.jsx`,   exists: true },
      { step: 3, label: "App Layout",        path: "src/components/AppLayout.jsx",                  reason: "Verify admin nav item is present.",        rawUrl: `${RAW}/src/components/AppLayout.jsx`,                  githubUrl: `${GH}/src/components/AppLayout.jsx`,                  exists: true },
    ],
    projectStructureVerification: [
      { step: 1, label: "Project Registry", path: "src/components/projects/PROJECT_REGISTRY.jsx",   reason: "Source of truth for all projects.",        rawUrl: `${RAW}/src/components/projects/PROJECT_REGISTRY.jsx`,   githubUrl: `${GH}/src/components/projects/PROJECT_REGISTRY.jsx`,   exists: true },
      { step: 2, label: "Projects Page",    path: "src/pages/Projects.jsx",                          reason: "Verify it reads from PROJECT_REGISTRY.",   rawUrl: `${RAW}/src/pages/Projects.jsx`,                          githubUrl: `${GH}/src/pages/Projects.jsx`,                          exists: true },
      { step: 3, label: "Audit Index",      path: "src/components/audits/AUDIT_INDEX.jsx",            reason: "Source of truth for all audit records.",   rawUrl: `${RAW}/src/components/audits/AUDIT_INDEX.jsx`,            githubUrl: `${GH}/src/components/audits/AUDIT_INDEX.jsx`,            exists: true },
      { step: 4, label: "Audits Page",      path: "src/pages/Audits.jsx",                             reason: "Verify it reads from AUDIT_INDEX.",        rawUrl: `${RAW}/src/pages/Audits.jsx`,                             githubUrl: `${GH}/src/pages/Audits.jsx`,                             exists: true },
    ],
  },

  // ── Verification bundle meta ───────────────────────────────────────────────
  verificationBundleMeta: {
    totalFilesIndexed: 46,
    lockedFiles: ["src/components/governance/LockedFiles.jsx", "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx"],
    missingCriticalFiles: [],
  },
};

export default CHATGPT_REPO_INDEX;
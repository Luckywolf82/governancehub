import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink, Lock, Search, FileText, AlertTriangle, Layers, Package, Send } from "lucide-react";
import { useActiveRepo } from "@/components/ActiveRepoContext";
import { base44 } from "@/api/base44Client";

// ── Inline manifest data ──────────────────────────────────────────────────────
// Data sourced from REPO_FILE_MANIFEST.json and PRIORITY_REPO_FILES.json.
// Update by re-running tools/generateRepoManifest.js and replacing these constants.

const RAW_BASE = "https://raw.githubusercontent.com/Luckywolf82/governancehub/main";
const GH_BASE = "https://github.com/Luckywolf82/governancehub/blob/main";
const GH_REPO_URL = "https://github.com/Luckywolf82/governancehub";

// Base raw URL for starter-kit source files inside the GovernanceHub repo.
// These are the canonical installer templates — safe to copy to any target repo.
const SK_RAW_BASE = `${RAW_BASE}/starter-kit/src/components`;

// The repository this manifest was generated from.
// Used to determine whether the active repo matches the manifest source.
const MANIFEST_REPO = { owner: "Luckywolf82", repo: "governancehub" };

const MANIFEST = {
  _meta: { generatedAt: "2026-03-14", generatedBy: "manual-verified" },
  files: [
    { path: ".gitignore", fileName: ".gitignore", extension: "", folder: "root", rawUrl: `${RAW_BASE}/.gitignore`, githubUrl: `${GH_BASE}/.gitignore`, category: "config", exists: true },
    { path: "README.md", fileName: "README.md", extension: "md", folder: "root", rawUrl: `${RAW_BASE}/README.md`, githubUrl: `${GH_BASE}/README.md`, category: "docs", exists: true },
    { path: "COPILOT_ISSUES.md", fileName: "COPILOT_ISSUES.md", extension: "md", folder: "root", rawUrl: `${RAW_BASE}/COPILOT_ISSUES.md`, githubUrl: `${GH_BASE}/COPILOT_ISSUES.md`, category: "docs", exists: true },
    { path: "package.json", fileName: "package.json", extension: "json", folder: "root", rawUrl: `${RAW_BASE}/package.json`, githubUrl: `${GH_BASE}/package.json`, category: "config", exists: true },
    { path: "vite.config.js", fileName: "vite.config.js", extension: "js", folder: "root", rawUrl: `${RAW_BASE}/vite.config.js`, githubUrl: `${GH_BASE}/vite.config.js`, category: "config", exists: true },
    { path: "tailwind.config.js", fileName: "tailwind.config.js", extension: "js", folder: "root", rawUrl: `${RAW_BASE}/tailwind.config.js`, githubUrl: `${GH_BASE}/tailwind.config.js`, category: "config", exists: true },
    { path: "eslint.config.js", fileName: "eslint.config.js", extension: "js", folder: "root", rawUrl: `${RAW_BASE}/eslint.config.js`, githubUrl: `${GH_BASE}/eslint.config.js`, category: "config", exists: true },
    { path: "components.json", fileName: "components.json", extension: "json", folder: "root", rawUrl: `${RAW_BASE}/components.json`, githubUrl: `${GH_BASE}/components.json`, category: "config", exists: true },
    { path: "index.html", fileName: "index.html", extension: "html", folder: "root", rawUrl: `${RAW_BASE}/index.html`, githubUrl: `${GH_BASE}/index.html`, category: "assets", exists: true },
    { path: "jsconfig.json", fileName: "jsconfig.json", extension: "json", folder: "root", rawUrl: `${RAW_BASE}/jsconfig.json`, githubUrl: `${GH_BASE}/jsconfig.json`, category: "config", exists: true },
    { path: "postcss.config.js", fileName: "postcss.config.js", extension: "js", folder: "root", rawUrl: `${RAW_BASE}/postcss.config.js`, githubUrl: `${GH_BASE}/postcss.config.js`, category: "config", exists: true },
    { path: "functions/runBaselineAudit.ts", fileName: "runBaselineAudit.ts", extension: "ts", folder: "functions", rawUrl: `${RAW_BASE}/functions/runBaselineAudit.ts`, githubUrl: `${GH_BASE}/functions/runBaselineAudit.ts`, category: "utils", exists: true },
    { path: "tools/generate-raw-links.js", fileName: "generate-raw-links.js", extension: "js", folder: "tools", rawUrl: `${RAW_BASE}/tools/generate-raw-links.js`, githubUrl: `${GH_BASE}/tools/generate-raw-links.js`, category: "utils", exists: true },
    { path: "tools/generate-raw-links-from-folder.js", fileName: "generate-raw-links-from-folder.js", extension: "js", folder: "tools", rawUrl: `${RAW_BASE}/tools/generate-raw-links-from-folder.js`, githubUrl: `${GH_BASE}/tools/generate-raw-links-from-folder.js`, category: "utils", exists: true },
    { path: "src/App.jsx", fileName: "App.jsx", extension: "jsx", folder: "src", rawUrl: `${RAW_BASE}/src/App.jsx`, githubUrl: `${GH_BASE}/src/App.jsx`, category: "config", exists: true },
    { path: "src/main.jsx", fileName: "main.jsx", extension: "jsx", folder: "src", rawUrl: `${RAW_BASE}/src/main.jsx`, githubUrl: `${GH_BASE}/src/main.jsx`, category: "config", exists: true },
    { path: "src/index.css", fileName: "index.css", extension: "css", folder: "src", rawUrl: `${RAW_BASE}/src/index.css`, githubUrl: `${GH_BASE}/src/index.css`, category: "assets", exists: true },
    { path: "src/pages.config.js", fileName: "pages.config.js", extension: "js", folder: "src", rawUrl: `${RAW_BASE}/src/pages.config.js`, githubUrl: `${GH_BASE}/src/pages.config.js`, category: "config", exists: true },
    { path: "src/pages/Admin.jsx", fileName: "Admin.jsx", extension: "jsx", folder: "src/pages", rawUrl: `${RAW_BASE}/src/pages/Admin.jsx`, githubUrl: `${GH_BASE}/src/pages/Admin.jsx`, category: "admin", exists: true },
    { path: "src/pages/Audits.jsx", fileName: "Audits.jsx", extension: "jsx", folder: "src/pages", rawUrl: `${RAW_BASE}/src/pages/Audits.jsx`, githubUrl: `${GH_BASE}/src/pages/Audits.jsx`, category: "pages", exists: true },
    { path: "src/pages/Home.jsx", fileName: "Home.jsx", extension: "jsx", folder: "src/pages", rawUrl: `${RAW_BASE}/src/pages/Home.jsx`, githubUrl: `${GH_BASE}/src/pages/Home.jsx`, category: "pages", exists: true },
    { path: "src/pages/Projects.jsx", fileName: "Projects.jsx", extension: "jsx", folder: "src/pages", rawUrl: `${RAW_BASE}/src/pages/Projects.jsx`, githubUrl: `${GH_BASE}/src/pages/Projects.jsx`, category: "pages", exists: true },
    { path: "src/components/AppLayout.jsx", fileName: "AppLayout.jsx", extension: "jsx", folder: "src/components", rawUrl: `${RAW_BASE}/src/components/AppLayout.jsx`, githubUrl: `${GH_BASE}/src/components/AppLayout.jsx`, category: "components", exists: true },
    { path: "src/components/UserNotRegisteredError.jsx", fileName: "UserNotRegisteredError.jsx", extension: "jsx", folder: "src/components", rawUrl: `${RAW_BASE}/src/components/UserNotRegisteredError.jsx`, githubUrl: `${GH_BASE}/src/components/UserNotRegisteredError.jsx`, category: "components", exists: true },
    { path: "src/components/ROADMAP.jsx", fileName: "ROADMAP.jsx", extension: "jsx", folder: "src/components", rawUrl: `${RAW_BASE}/src/components/ROADMAP.jsx`, githubUrl: `${GH_BASE}/src/components/ROADMAP.jsx`, category: "docs", exists: true },
    { path: "src/components/README.jsx", fileName: "README.jsx", extension: "jsx", folder: "src/components", rawUrl: `${RAW_BASE}/src/components/README.jsx`, githubUrl: `${GH_BASE}/src/components/README.jsx`, category: "docs", exists: true },
    { path: "src/components/product-intelligence-audit-2026-03-12.jsx", fileName: "product-intelligence-audit-2026-03-12.jsx", extension: "jsx", folder: "src/components", rawUrl: `${RAW_BASE}/src/components/product-intelligence-audit-2026-03-12.jsx`, githubUrl: `${GH_BASE}/src/components/product-intelligence-audit-2026-03-12.jsx`, category: "audits", exists: true },
    { path: "src/components/product-utility-audit-2026-03-11.jsx", fileName: "product-utility-audit-2026-03-11.jsx", extension: "jsx", folder: "src/components", rawUrl: `${RAW_BASE}/src/components/product-utility-audit-2026-03-11.jsx`, githubUrl: `${GH_BASE}/src/components/product-utility-audit-2026-03-11.jsx`, category: "audits", exists: true },
    { path: "src/components/audits/AUDIT_INDEX.jsx", fileName: "AUDIT_INDEX.jsx", extension: "jsx", folder: "src/components/audits", rawUrl: `${RAW_BASE}/src/components/audits/AUDIT_INDEX.jsx`, githubUrl: `${GH_BASE}/src/components/audits/AUDIT_INDEX.jsx`, category: "audits", exists: true },
    { path: "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx", fileName: "AUDIT_SYSTEM_GUIDE.jsx", extension: "jsx", folder: "src/components/audits", rawUrl: `${RAW_BASE}/src/components/audits/AUDIT_SYSTEM_GUIDE.jsx`, githubUrl: `${GH_BASE}/src/components/audits/AUDIT_SYSTEM_GUIDE.jsx`, category: "audits", exists: true },
    { path: "src/components/audits/README.jsx", fileName: "README.jsx", extension: "jsx", folder: "src/components/audits", rawUrl: `${RAW_BASE}/src/components/audits/README.jsx`, githubUrl: `${GH_BASE}/src/components/audits/README.jsx`, category: "audits", exists: true },
    { path: "src/components/audits/architecture/admin-ui-file-placement-audit-2026-03-13.jsx", fileName: "admin-ui-file-placement-audit-2026-03-13.jsx", extension: "jsx", folder: "src/components/audits/architecture", rawUrl: `${RAW_BASE}/src/components/audits/architecture/admin-ui-file-placement-audit-2026-03-13.jsx`, githubUrl: `${GH_BASE}/src/components/audits/architecture/admin-ui-file-placement-audit-2026-03-13.jsx`, category: "audits", exists: true },
    { path: "src/components/audits/architecture/README.jsx", fileName: "README.jsx", extension: "jsx", folder: "src/components/audits/architecture", rawUrl: `${RAW_BASE}/src/components/audits/architecture/README.jsx`, githubUrl: `${GH_BASE}/src/components/audits/architecture/README.jsx`, category: "audits", exists: true },
    { path: "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx", fileName: "AI_PROJECT_INSTRUCTIONS.jsx", extension: "jsx", folder: "src/components/governance", rawUrl: `${RAW_BASE}/src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx`, githubUrl: `${GH_BASE}/src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx`, category: "governance", exists: true, locked: true },
    { path: "src/components/governance/AI_STATE.jsx", fileName: "AI_STATE.jsx", extension: "jsx", folder: "src/components/governance", rawUrl: `${RAW_BASE}/src/components/governance/AI_STATE.jsx`, githubUrl: `${GH_BASE}/src/components/governance/AI_STATE.jsx`, category: "governance", exists: true },
    { path: "src/components/governance/LastVerifiedState.jsx", fileName: "LastVerifiedState.jsx", extension: "jsx", folder: "src/components/governance", rawUrl: `${RAW_BASE}/src/components/governance/LastVerifiedState.jsx`, githubUrl: `${GH_BASE}/src/components/governance/LastVerifiedState.jsx`, category: "governance", exists: true },
    { path: "src/components/governance/LockedFiles.jsx", fileName: "LockedFiles.jsx", extension: "jsx", folder: "src/components/governance", rawUrl: `${RAW_BASE}/src/components/governance/LockedFiles.jsx`, githubUrl: `${GH_BASE}/src/components/governance/LockedFiles.jsx`, category: "governance", exists: true, locked: true },
    { path: "src/components/governance/NextSafeStep.jsx", fileName: "NextSafeStep.jsx", extension: "jsx", folder: "src/components/governance", rawUrl: `${RAW_BASE}/src/components/governance/NextSafeStep.jsx`, githubUrl: `${GH_BASE}/src/components/governance/NextSafeStep.jsx`, category: "governance", exists: true },
    { path: "src/components/governance/PhaseExecutionLog.jsx", fileName: "PhaseExecutionLog.jsx", extension: "jsx", folder: "src/components/governance", rawUrl: `${RAW_BASE}/src/components/governance/PhaseExecutionLog.jsx`, githubUrl: `${GH_BASE}/src/components/governance/PhaseExecutionLog.jsx`, category: "governance", exists: true },
    { path: "src/components/governance/TaskGenerator.js", fileName: "TaskGenerator.js", extension: "js", folder: "src/components/governance", rawUrl: `${RAW_BASE}/src/components/governance/TaskGenerator.js`, githubUrl: `${GH_BASE}/src/components/governance/TaskGenerator.js`, category: "governance", exists: true },
    { path: "src/components/github/RepoFileExplorer.jsx", fileName: "RepoFileExplorer.jsx", extension: "jsx", folder: "src/components/github", rawUrl: `${RAW_BASE}/src/components/github/RepoFileExplorer.jsx`, githubUrl: `${GH_BASE}/src/components/github/RepoFileExplorer.jsx`, category: "components", exists: true },
    { path: "src/components/projects/WORKSTREAM_REGISTRY.jsx", fileName: "WORKSTREAM_REGISTRY.jsx", extension: "jsx", folder: "src/components/projects", rawUrl: `${RAW_BASE}/src/components/projects/WORKSTREAM_REGISTRY.jsx`, githubUrl: `${GH_BASE}/src/components/projects/WORKSTREAM_REGISTRY.jsx`, category: "projects", exists: true },
  ],
};

const PRIORITY = {
  files: [
    { path: "src/components/governance/LockedFiles.jsx", label: "Locked File Registry", priority: "critical", whyItMatters: "Defines which files must never be silently modified.", rawUrl: `${RAW_BASE}/src/components/governance/LockedFiles.jsx`, githubUrl: `${GH_BASE}/src/components/governance/LockedFiles.jsx`, lockedFile: true, exists: true },
    { path: "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx", label: "AI Project Instructions", priority: "critical", whyItMatters: "Canonical governance rules for all AI agents.", rawUrl: `${RAW_BASE}/src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx`, githubUrl: `${GH_BASE}/src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx`, lockedFile: true, exists: true },
    { path: "src/components/governance/PhaseExecutionLog.jsx", label: "Phase Execution Log", priority: "critical", whyItMatters: "Full history of structural changes. Verify before proposing any new step.", rawUrl: `${RAW_BASE}/src/components/governance/PhaseExecutionLog.jsx`, githubUrl: `${GH_BASE}/src/components/governance/PhaseExecutionLog.jsx`, lockedFile: false, exists: true },
    { path: "src/components/governance/AI_STATE.jsx", label: "AI State", priority: "critical", whyItMatters: "Reflects current project phase, verification status, and active focus area.", rawUrl: `${RAW_BASE}/src/components/governance/AI_STATE.jsx`, githubUrl: `${GH_BASE}/src/components/governance/AI_STATE.jsx`, lockedFile: false, exists: true },
    { path: "src/components/governance/NextSafeStep.jsx", label: "Next Safe Step", priority: "critical", whyItMatters: "Defines the next approved action. Do not bypass.", rawUrl: `${RAW_BASE}/src/components/governance/NextSafeStep.jsx`, githubUrl: `${GH_BASE}/src/components/governance/NextSafeStep.jsx`, lockedFile: false, exists: true },
    { path: "src/App.jsx", label: "App Bootstrap / Router", priority: "critical", whyItMatters: "Main routing configuration. Verify routes match actual page files.", rawUrl: `${RAW_BASE}/src/App.jsx`, githubUrl: `${GH_BASE}/src/App.jsx`, lockedFile: false, exists: true },
    { path: "src/components/audits/AUDIT_INDEX.jsx", label: "Audit Index", priority: "high", whyItMatters: "Canonical registry of all audit records.", rawUrl: `${RAW_BASE}/src/components/audits/AUDIT_INDEX.jsx`, githubUrl: `${GH_BASE}/src/components/audits/AUDIT_INDEX.jsx`, lockedFile: false, exists: true },
    { path: "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx", label: "Audit System Guide", priority: "high", whyItMatters: "Standards and naming conventions for all audit artifacts.", rawUrl: `${RAW_BASE}/src/components/audits/AUDIT_SYSTEM_GUIDE.jsx`, githubUrl: `${GH_BASE}/src/components/audits/AUDIT_SYSTEM_GUIDE.jsx`, lockedFile: false, exists: true },
    { path: "src/components/projects/WORKSTREAM_REGISTRY.jsx", label: "Workstream Registry", priority: "high", whyItMatters: "Canonical registry of all GovernanceHub internal workstreams.", rawUrl: `${RAW_BASE}/src/components/projects/WORKSTREAM_REGISTRY.jsx`, githubUrl: `${GH_BASE}/src/components/projects/WORKSTREAM_REGISTRY.jsx`, lockedFile: false, exists: true },
    { path: "src/components/governance/LastVerifiedState.jsx", label: "Last Verified State", priority: "high", whyItMatters: "Records last known verified state. Use for drift detection.", rawUrl: `${RAW_BASE}/src/components/governance/LastVerifiedState.jsx`, githubUrl: `${GH_BASE}/src/components/governance/LastVerifiedState.jsx`, lockedFile: false, exists: true },
    { path: "src/pages/Admin.jsx", label: "Admin Page", priority: "high", whyItMatters: "Primary admin interface and routing anchor.", rawUrl: `${RAW_BASE}/src/pages/Admin.jsx`, githubUrl: `${GH_BASE}/src/pages/Admin.jsx`, lockedFile: false, exists: true },
    { path: "src/components/AppLayout.jsx", label: "App Layout", priority: "high", whyItMatters: "Global navigation shell. Verify nav items match actual routes.", rawUrl: `${RAW_BASE}/src/components/AppLayout.jsx`, githubUrl: `${GH_BASE}/src/components/AppLayout.jsx`, lockedFile: false, exists: true },
    { path: "functions/runBaselineAudit.ts", label: "Baseline Audit Function", priority: "normal", whyItMatters: "Backend function for running baseline audits.", rawUrl: `${RAW_BASE}/functions/runBaselineAudit.ts`, githubUrl: `${GH_BASE}/functions/runBaselineAudit.ts`, lockedFile: false, exists: true },
    { path: "src/pages.config.js", label: "Pages Config", priority: "normal", whyItMatters: "Legacy page config — verify against App.jsx routes.", rawUrl: `${RAW_BASE}/src/pages.config.js`, githubUrl: `${GH_BASE}/src/pages.config.js`, lockedFile: false, exists: true },
    { path: "src/components/governance/TaskGenerator.js", label: "Task Generator", priority: "normal", whyItMatters: "Utility for generating governance tasks.", rawUrl: `${RAW_BASE}/src/components/governance/TaskGenerator.js`, githubUrl: `${GH_BASE}/src/components/governance/TaskGenerator.js`, lockedFile: false, exists: true },
  ],
};

// ── Draft manifest generation ─────────────────────────────────────────────────
// Generates a repo-aware DRAFT manifest covering the starter-kit push scope only.
// Phase 1 push scope = repo-aware manifest + starter-kit-approved artifacts.
// Broad app scaffold files, governance-specific files, and audit/log files are
// NOT included in this phase.

const DRAFT_SCAFFOLD_PATHS = [
  // repo-aware manifest (generated JSON pushed to the target repo root)
  { path: "GOVERNANCE_MANIFEST.json",                                  group: "manifest",  category: "config"     },
  // README.md — create-or-update: new repo-aware template if missing, governance section added/updated if present
  { path: "README.md",                                                 group: "readme",    category: "docs"       },
  // starter-kit: governance module
  { path: "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",    group: "governance", category: "governance" },
  { path: "src/components/governance/AI_STATE.jsx",                   group: "governance", category: "governance" },
  { path: "src/components/governance/LockedFiles.jsx",                group: "governance", category: "governance" },
  { path: "src/components/governance/NextSafeStep.jsx",               group: "governance", category: "governance" },
  { path: "src/components/governance/PhaseExecutionLog.jsx",          group: "governance", category: "governance" },
  { path: "src/components/governance/STARTER_KIT_VERSION.jsx",        group: "governance", category: "governance" },
  { path: "src/components/governance/INSTALL_POLICY.jsx",             group: "governance", category: "governance" },
  // starter-kit: audits module
  { path: "src/components/audits/AUDIT_INDEX.jsx",                    group: "audits",     category: "audits"     },
  { path: "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx",             group: "audits",     category: "audits"     },
  // starter-kit: projects module
  { path: "src/components/projects/WORKSTREAM_REGISTRY.jsx",          group: "projects",   category: "projects"   },
];

function generateDraftManifest(owner, repo, branch, branchIsDefault) {
  const rawBaseUrl  = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
  const blobBaseUrl = `https://github.com/${owner}/${repo}/blob/${branch}`;

  const files = DRAFT_SCAFFOLD_PATHS.map(({ path, group, category }) => ({
    path,
    group,
    category,
    rawUrl:  `${rawBaseUrl}/${path}`,
    blobUrl: `${blobBaseUrl}/${path}`,
    action:  "createOrUpdate",
  }));

  // Group files by their group key
  const groupMap = files.reduce((acc, f) => {
    if (!acc[f.group]) acc[f.group] = [];
    acc[f.group].push(f);
    return acc;
  }, {});
  const fileGroups = Object.entries(groupMap).map(([group, groupFiles]) => ({ group, files: groupFiles }));

  return {
    owner,
    repo,
    branch,
    branchIsDefault,
    rawBaseUrl,
    blobBaseUrl,
    generatedAt: new Date().toISOString(),
    status: "draft",
    fileGroups,
    files,
  };
}

// ── Payload content sources ───────────────────────────────────────────────────
// Phase 1 push scope:
//   manifest     → repo-aware GOVERNANCE_MANIFEST.json generated programmatically
//   starter-kit  → fetched live from GovernanceHub starter-kit/ raw URLs
//
// Non-starter-kit scaffold files (package.json, src/App.jsx, etc.) and all
// GovernanceHub-specific files are NOT in this scope. They have no entry here.

const CONTENT_SOURCES = {
  "GOVERNANCE_MANIFEST.json": { type: "manifest" },
  "README.md":                { type: "readme"   },
  "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx":  { type: "starter-kit", rawUrl: `${SK_RAW_BASE}/governance/AI_PROJECT_INSTRUCTIONS.jsx`  },
  "src/components/governance/AI_STATE.jsx":                 { type: "starter-kit", rawUrl: `${SK_RAW_BASE}/governance/AI_STATE.jsx`                  },
  "src/components/governance/LockedFiles.jsx":              { type: "starter-kit", rawUrl: `${SK_RAW_BASE}/governance/LockedFiles.jsx`               },
  "src/components/governance/NextSafeStep.jsx":             { type: "starter-kit", rawUrl: `${SK_RAW_BASE}/governance/NextSafeStep.jsx`              },
  "src/components/governance/PhaseExecutionLog.jsx":        { type: "starter-kit", rawUrl: `${SK_RAW_BASE}/governance/PhaseExecutionLog.jsx`         },
  "src/components/governance/STARTER_KIT_VERSION.jsx":      { type: "starter-kit", rawUrl: `${SK_RAW_BASE}/governance/STARTER_KIT_VERSION.jsx`       },
  "src/components/governance/INSTALL_POLICY.jsx":           { type: "starter-kit", rawUrl: `${SK_RAW_BASE}/governance/INSTALL_POLICY.jsx`            },
  "src/components/audits/AUDIT_INDEX.jsx":                  { type: "starter-kit", rawUrl: `${SK_RAW_BASE}/audits/AUDIT_INDEX.jsx`                   },
  "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx":           { type: "starter-kit", rawUrl: `${SK_RAW_BASE}/audits/AUDIT_SYSTEM_GUIDE.jsx`            },
  "src/components/projects/WORKSTREAM_REGISTRY.jsx":        { type: "starter-kit", rawUrl: `${SK_RAW_BASE}/projects/WORKSTREAM_REGISTRY.jsx`         },
};

// Generates the repo-aware GOVERNANCE_MANIFEST.json content for the target repo.
// This manifest records what starter-kit files were installed and where.
function generateManifestContent(manifest) {
  const installable = manifest.files.filter((f) => f.path !== "GOVERNANCE_MANIFEST.json");
  return JSON.stringify(
    {
      _meta: {
        generatedBy: "GovernanceHub",
        generatedAt: manifest.generatedAt,
        starterKitVersion: "1.0.0",
        schemaVersion: "1",
      },
      owner:       manifest.owner,
      repo:        manifest.repo,
      branch:      manifest.branch,
      rawBaseUrl:  manifest.rawBaseUrl,
      blobBaseUrl: manifest.blobBaseUrl,
      fileGroups:  manifest.fileGroups
        .filter((g) => g.group !== "manifest")
        .map((g) => ({
          group: g.group,
          files: g.files.map((f) => ({ path: f.path, category: f.category })),
        })),
      files: installable.map((f) => ({
        path:     f.path,
        category: f.category,
        rawUrl:   f.rawUrl,
        blobUrl:  f.blobUrl,
      })),
    },
    null,
    2
  );
}

// ── README create-or-update helpers ──────────────────────────────────────────
// These are used during payload assembly to generate or merge README.md content
// for the target repo.  A bounded governance section is inserted/updated so that
// any pre-existing repo identity content is preserved.

const GOVERNANCE_SECTION_START = "<!-- GOVERNANCE:START -->";
const GOVERNANCE_SECTION_END   = "<!-- GOVERNANCE:END -->";

function buildGovernanceSection(owner, repo) {
  return [
    GOVERNANCE_SECTION_START,
    "## Governance",
    "",
    `This repository (\`${owner}/${repo}\`) uses the [GovernanceHub](${GH_REPO_URL}) starter kit for AI-assisted development governance.`,
    "",
    "### AI-assisted development governance",
    "- Structural changes are tracked in `src/components/governance/PhaseExecutionLog.jsx`",
    "- Locked files are defined in `src/components/governance/LockedFiles.jsx`",
    "- AI agents must follow `src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx`",
    "",
    "### Development loop",
    "1. Read `AI_PROJECT_INSTRUCTIONS.jsx` before any change",
    "2. Check `NextSafeStep.jsx` for the current approved action",
    "3. Log all structural changes in `PhaseExecutionLog.jsx`",
    "4. Verify changes against `LockedFiles.jsx`",
    "",
    "### Repository governance rules",
    "- Do not modify locked files without explicit approval",
    "- All AI-assisted changes must reference a governance phase",
    "- Audit artifacts live in `src/components/audits/`",
    GOVERNANCE_SECTION_END,
  ].join("\n");
}

function generateReadmeTemplate(owner, repo, branch) {
  return [
    `# ${repo}`,
    "",
    `> Repository: \`${owner}/${repo}\` · Branch: \`${branch}\``,
    "",
    "## Overview",
    "",
    "<!-- Add your project description here -->",
    "",
    buildGovernanceSection(owner, repo),
    "",
  ].join("\n");
}

// Inserts the governance section if absent, or replaces an existing one in-place,
// leaving all surrounding content untouched.
function mergeGovernanceSection(existingContent, owner, repo) {
  const govSection = buildGovernanceSection(owner, repo);
  const startIdx = existingContent.indexOf(GOVERNANCE_SECTION_START);
  const endIdx   = existingContent.indexOf(GOVERNANCE_SECTION_END);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    // Replace the existing governance section in-place, preserving everything else.
    return (
      existingContent.slice(0, startIdx) +
      govSection +
      existingContent.slice(endIdx + GOVERNANCE_SECTION_END.length)
    );
  }

  // No existing section — append at the end without touching existing content.
  return `${existingContent.trimEnd()}\n\n${govSection}\n`;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  governance:  "bg-purple-100 text-purple-800",
  audits:      "bg-amber-100 text-amber-800",
  projects:    "bg-blue-100 text-blue-800",
  pages:       "bg-sky-100 text-sky-800",
  components:  "bg-teal-100 text-teal-800",
  admin:       "bg-slate-100 text-slate-700",
  utils:       "bg-green-100 text-green-800",
  config:      "bg-orange-100 text-orange-800",
  docs:        "bg-pink-100 text-pink-800",
  assets:      "bg-gray-100 text-gray-700",
  other:       "bg-gray-100 text-gray-500",
};

const PRIORITY_COLORS = {
  critical: "bg-red-100 text-red-800",
  high:     "bg-amber-100 text-amber-800",
  normal:   "bg-slate-100 text-slate-600",
};

const SOURCE_META = {
  manifest:       { label: "manifest",    color: "bg-violet-100 text-violet-800",   title: "Repo-aware manifest generated for this repo" },
  "starter-kit":  { label: "starter-kit", color: "bg-emerald-100 text-emerald-800", title: "Content fetched from GovernanceHub starter-kit" },
  readme:         { label: "readme",      color: "bg-pink-100 text-pink-800",        title: "README create-or-update: new repo-aware template if missing, governance section inserted/updated if present" },
  excluded:       { label: "excluded",    color: "bg-red-100 text-red-700",          title: "Omitted — excluded from this push phase" },
  undefined:      { label: "unknown",     color: "bg-gray-100 text-gray-500",        title: "Source not defined" },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      title={`Copy ${label}`}
      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-100"
    >
      <Copy className="w-3 h-3" />
      {copied ? "Copied!" : label}
    </button>
  );
}

function OpenButton({ url, label }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open ${label}`}
      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-100"
    >
      <ExternalLink className="w-3 h-3" />
      {label}
    </a>
  );
}

function FileRow({ file }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        {file.locked && (
          <Lock className="w-3 h-3 shrink-0 text-red-500" title="Locked file — do not modify" />
        )}
        <span className="text-sm font-mono text-slate-700 truncate" title={file.path}>
          {file.path}
        </span>
        <Badge className={`${CATEGORY_COLORS[file.category] || CATEGORY_COLORS.other} text-xs shrink-0`}>
          {file.category}
        </Badge>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <CopyButton value={file.rawUrl} label="raw" />
        <CopyButton value={file.githubUrl} label="gh" />
        <OpenButton url={file.rawUrl} label="raw" />
        <OpenButton url={file.githubUrl} label="gh" />
      </div>
    </div>
  );
}

function PriorityRow({ file }) {
  return (
    <div className="py-2.5 border-b border-slate-100 last:border-0 space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        {file.lockedFile && <Lock className="w-3 h-3 text-red-500 shrink-0" />}
        <span className="text-sm font-semibold text-slate-800">{file.label}</span>
        <Badge className={`${PRIORITY_COLORS[file.priority]} text-xs`}>{file.priority}</Badge>
        {!file.exists && <Badge className="bg-red-100 text-red-700 text-xs">missing</Badge>}
      </div>
      <p className="text-xs text-slate-500">{file.whyItMatters}</p>
      <p className="text-xs font-mono text-slate-400 truncate">{file.path}</p>
      <div className="flex gap-1">
        <CopyButton value={file.rawUrl} label="raw URL" />
        <CopyButton value={file.githubUrl} label="GitHub URL" />
        <OpenButton url={file.rawUrl} label="open raw" />
        <OpenButton url={file.githubUrl} label="open GitHub" />
      </div>
    </div>
  );
}

// ── Draft / Preview / Push-ready sub-components ───────────────────────────────

function DraftManifestSection({ manifest }) {
  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Package className="w-4 h-4 text-amber-600" />
          <CardTitle className="text-base text-slate-800">
            Draft Manifest — {manifest.owner}/{manifest.repo}
          </CardTitle>
          <Badge className="bg-amber-100 text-amber-800 text-xs">Draft – not pushed</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Phase 1 push scope: repo-aware <strong>GOVERNANCE_MANIFEST.json</strong> + starter-kit-approved artifacts only.
          Broad app scaffold files, GovernanceHub-specific files, audits, and execution logs are <strong>not</strong> included.
        </p>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Manifest meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { label: "Owner",  value: manifest.owner  },
            { label: "Repo",   value: manifest.repo   },
            { label: "Branch", value: `${manifest.branch}${manifest.branchIsDefault ? " (default)" : " (fallback — verify)"}` },
            { label: "Status", value: "Draft – not pushed" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-amber-100 rounded px-2 py-1.5">
              <p className="text-slate-400 font-medium uppercase tracking-wide text-[10px]">{label}</p>
              <p className="text-slate-700 font-mono truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* URL bases */}
        <div className="space-y-1">
          {[
            { label: "rawBaseUrl",  value: manifest.rawBaseUrl  },
            { label: "blobBaseUrl", value: manifest.blobBaseUrl },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 w-24 shrink-0">{label}</span>
              <code className="bg-white border border-amber-100 rounded px-2 py-0.5 text-slate-600 font-mono flex-1 truncate">{value}</code>
            </div>
          ))}
        </div>

        {/* File groups */}
        <div className="space-y-2">
          {manifest.fileGroups.map(({ group, files }) => (
            <div key={group}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{group} ({files.length} files)</p>
              <div className="space-y-0.5">
                {files.map((f) => (
                  <div key={f.path} className="flex items-center justify-between text-xs py-0.5">
                    <span className="font-mono text-slate-600 truncate">{f.path}</span>
                    <Badge className={`${CATEGORY_COLORS[f.category] || CATEGORY_COLORS.other} text-[10px] ml-2 shrink-0`}>{f.category}</Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PushPreviewSection({ manifest }) {
  const manifestFiles    = manifest.files.filter((f) => f.group === "manifest");
  const starterKitFiles  = manifest.files.filter((f) => f.group !== "manifest");

  const FileSourceRow = ({ f }) => {
    const src  = CONTENT_SOURCES[f.path];
    const meta = SOURCE_META[src?.type] ?? SOURCE_META.undefined;
    return (
      <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-1.5 border-b border-slate-50 last:border-0 items-center text-xs">
        <span className="font-mono text-slate-700 truncate" title={f.path}>{f.path}</span>
        <Badge className={`${meta.color} text-[10px] whitespace-nowrap`} title={meta.title}>{meta.label}</Badge>
        <Badge className="bg-slate-100 text-slate-600 text-[10px] whitespace-nowrap">{f.action}</Badge>
      </div>
    );
  };

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <CardTitle className="text-base text-slate-800">Payload Source Preview</CardTitle>
          <Badge className="bg-blue-100 text-blue-800 text-xs">Preview only — no writes</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Phase 1 push scope only: repo-aware manifest + starter-kit artifacts.
          No broad scaffold, governance-specific, or audit/log files are included.
        </p>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Manifest group */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-700 mb-1">
            Repo-aware manifest
          </p>
          <div className="rounded border border-violet-100 bg-white overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-1.5 bg-violet-50 border-b border-violet-100 text-[10px] font-semibold text-violet-700 uppercase tracking-wide">
              <span>Path</span><span>Source</span><span>Action</span>
            </div>
            {manifestFiles.map((f) => <FileSourceRow key={f.path} f={f} />)}
          </div>
        </div>

        {/* Starter-kit group */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 mb-1">
            Starter-kit artifacts ({starterKitFiles.length} files)
          </p>
          <div className="rounded border border-emerald-100 bg-white overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-1.5 bg-emerald-50 border-b border-emerald-100 text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">
              <span>Path</span><span>Source</span><span>Action</span>
            </div>
            {starterKitFiles.map((f) => <FileSourceRow key={f.path} f={f} />)}
          </div>
        </div>

        <p className="text-[10px] text-slate-400">
          {manifest.files.length} file{manifest.files.length !== 1 ? "s" : ""} total · Branch: <strong>{manifest.branch}</strong>{manifest.branchIsDefault ? " (default)" : " (fallback — confirm before push)"} · Repo: <strong>{manifest.owner}/{manifest.repo}</strong>
        </p>
      </CardContent>
    </Card>
  );
}

function DirectPushSection({ manifest }) {
  const [phase, setPhase] = useState("idle"); // "idle" | "assembling" | "ready" | "pushing" | "done" | "error"
  const [assembled, setAssembled] = useState(null);   // { pushable: [...], excluded: [...] }
  const [pushResult, setPushResult] = useState(null);
  const [pushError, setPushError] = useState(null);

  const { owner, repo, branch, branchIsDefault } = manifest;
  const canProceed = Boolean(owner && repo && branch);

  const handleAssemble = async () => {
    setPhase("assembling");
    setPushError(null);
    setAssembled(null);

    const pushable = [];
    const excluded = [];

    for (const file of manifest.files) {
      const src = CONTENT_SOURCES[file.path];

      if (!src) {
        excluded.push({ path: file.path, reason: "No content source defined — not in starter-kit scope" });
        continue;
      }

      if (src.type === "manifest") {
        const content = generateManifestContent(manifest);
        pushable.push({ path: file.path, content, source: "manifest" });
        continue;
      }

      if (src.type === "starter-kit") {
        try {
          const res = await fetch(src.rawUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status} from GovernanceHub starter-kit URL`);
          const content = await res.text();
          pushable.push({ path: file.path, content, source: "starter-kit", rawUrl: src.rawUrl });
        } catch (err) {
          excluded.push({ path: file.path, reason: `Starter-kit fetch failed: ${err.message}` });
        }
        continue;
      }

      if (src.type === "readme") {
        try {
          const existingUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`;
          const res = await fetch(existingUrl);
          let content;
          if (!res.ok) {
            // Target repo has no README — generate a repo-aware template.
            content = generateReadmeTemplate(owner, repo, branch);
          } else {
            // Target repo already has a README — preserve all existing content
            // and only insert or update the bounded governance section.
            const existing = await res.text();
            content = mergeGovernanceSection(existing, owner, repo);
          }
          pushable.push({ path: file.path, content, source: "starter-kit" });
        } catch (err) {
          excluded.push({ path: file.path, reason: `README handling failed: ${err.message}` });
        }
        continue;
      }

      // Any other (unexpected) source type is excluded
      excluded.push({ path: file.path, reason: `Source type "${src.type}" is not permitted in phase 1 push` });
    }

    setAssembled({ pushable, excluded });
    setPhase("ready");
  };

  const handlePush = async () => {
    if (!assembled || assembled.pushable.length === 0) return;
    setPhase("pushing");
    setPushError(null);

    try {
      const result = await base44.functions.invoke("pushFilesToGithub", {
        owner,
        repo,
        branch,
        message: `GovernanceHub starter-kit install [${new Date().toISOString()}]`,
        files: assembled.pushable.map((f) => ({
          path: f.path,
          content: f.content,
          source: f.source,
        })),
      });
      setPushResult(result);
      setPhase("done");
    } catch (err) {
      setPushError(err?.message ?? "Push failed — see browser console for details.");
      setPhase("error");
    }
  };

  const reset = () => {
    setPhase("idle");
    setAssembled(null);
    setPushResult(null);
    setPushError(null);
  };

  return (
    <Card className="border-slate-300 bg-slate-50/40">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Send className="w-4 h-4 text-slate-600" />
          <CardTitle className="text-base text-slate-800">Install Starter Kit to GitHub</CardTitle>
          <Badge className="bg-slate-200 text-slate-700 text-xs">Explicit operator action only</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Fetch starter-kit files from GovernanceHub, generate the repo-aware manifest, then push to{" "}
          <strong>{owner}/{repo}</strong> on branch <strong>{branch}</strong>.
          Phase 1 scope only — no broad scaffold or governance-specific files.
          {!branchIsDefault && (
            <span className="text-amber-600"> ⚠ Branch is not the default — confirm before pushing.</span>
          )}
        </p>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Pre-flight checklist */}
        <div className="rounded border border-slate-200 bg-white px-3 py-2 space-y-1 text-xs">
          <p className="font-semibold text-slate-500 text-[10px] uppercase tracking-wide mb-1.5">Pre-flight conditions</p>
          {[
            { label: "owner resolved",    met: Boolean(owner),                                    value: owner  || "—" },
            { label: "repo resolved",     met: Boolean(repo),                                     value: repo   || "—" },
            { label: "branch resolved",   met: Boolean(branch),                                   value: branch || "—" },
            { label: "payload assembled", met: Boolean(assembled && assembled.pushable.length > 0), value: assembled ? `${assembled.pushable.length} file(s) ready` : "not yet assembled" },
          ].map(({ label, met, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`text-[10px] font-bold shrink-0 w-3 ${met ? "text-emerald-600" : "text-red-400"}`} aria-hidden="true">
                {met ? "✓" : "✗"}
              </span>
              <span className="text-slate-500 w-36 shrink-0">{label}</span>
              <span className={`font-mono ${met ? "text-slate-700" : "text-slate-400"}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Assemble */}
        {(phase === "idle" || phase === "assembling") && (
          <Button
            onClick={handleAssemble}
            disabled={!canProceed || phase === "assembling"}
            variant="outline"
            className="w-full text-slate-700 border-slate-300"
          >
            {phase === "assembling" ? "Assembling payload…" : "Step 1 — Assemble Payload"}
          </Button>
        )}

        {/* Assembled payload preview */}
        {assembled && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600">Assembled payload</p>

            {assembled.pushable.length > 0 && (
              <div className="rounded border border-emerald-200 bg-white overflow-hidden">
                <div className="px-3 py-1.5 bg-emerald-50 border-b border-emerald-100 text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">
                  ✓ Pushable ({assembled.pushable.length} file{assembled.pushable.length !== 1 ? "s" : ""})
                </div>
                {assembled.pushable.map((f) => (
                  <div key={f.path} className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-slate-50 last:border-0 text-xs">
                    <span className="font-mono text-slate-700 truncate">{f.path}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge className={`${SOURCE_META[f.source]?.color ?? SOURCE_META.undefined.color} text-[10px]`} title={SOURCE_META[f.source]?.title}>
                        {SOURCE_META[f.source]?.label ?? "unknown"}
                      </Badge>
                      {f.source === "starter-kit" && f.rawUrl && (
                        <a href={f.rawUrl} target="_blank" rel="noopener noreferrer" title="View GovernanceHub starter-kit source" className="text-slate-400 hover:text-slate-600">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {assembled.excluded.length > 0 && (
              <div className="rounded border border-red-100 bg-white overflow-hidden">
                <div className="px-3 py-1.5 bg-red-50 border-b border-red-100 text-[10px] font-semibold text-red-700 uppercase tracking-wide">
                  ⛔ Excluded — omitted from push ({assembled.excluded.length})
                </div>
                {assembled.excluded.map((f) => (
                  <div key={f.path} className="flex items-start gap-2 px-3 py-1.5 border-b border-slate-50 last:border-0 text-xs">
                    <span className="font-mono text-slate-600 shrink-0 max-w-[55%] truncate">{f.path}</span>
                    <span className="text-slate-400 text-[10px]">{f.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Push — only when assembled and pushable files exist */}
        {phase === "ready" && assembled && assembled.pushable.length > 0 && (
          <Button
            onClick={handlePush}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Install Starter Kit to GitHub ({assembled.pushable.length} file{assembled.pushable.length !== 1 ? "s" : ""})
          </Button>
        )}

        {phase === "ready" && assembled && assembled.pushable.length === 0 && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-800">
            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
            <span>No pushable files assembled — all files were excluded. Push is not available.</span>
          </div>
        )}

        {/* Pushing in progress */}
        {phase === "pushing" && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs text-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
            <span>Pushing to GitHub… do not close this panel.</span>
          </div>
        )}

        {/* Push result */}
        {phase === "done" && pushResult && (
          <div className="space-y-2">
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded px-3 py-2 text-xs text-green-800">
              <span className="w-2 h-2 rounded-full bg-green-400 mt-0.5 shrink-0" />
              <span>
                Push complete. <strong>{pushResult.pushed?.length ?? 0} file(s) pushed</strong>
                {pushResult.errors?.length > 0 && `, ${pushResult.errors.length} error(s)`}.
              </span>
            </div>
            {pushResult.errors?.length > 0 && (
              <div className="rounded border border-red-100 bg-white px-3 py-2 space-y-1 text-xs">
                <p className="font-semibold text-red-700">Push errors:</p>
                {pushResult.errors.map((e) => (
                  <p key={e.path} className="font-mono text-red-600">{e.path}: {e.error}</p>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={reset} className="text-xs text-slate-500">
              Reset
            </Button>
          </div>
        )}

        {/* Error state */}
        {phase === "error" && pushError && (
          <div className="space-y-2">
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-800">
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
              <span>Push failed: {pushError}</span>
            </div>
            <Button variant="outline" size="sm" onClick={reset} className="text-xs text-slate-500">
              Reset
            </Button>
          </div>
        )}

        {/* Safety notice — shown until push completes */}
        {phase !== "done" && (
          <p className="text-[10px] text-slate-400 text-center">
            ⚠ Phase 1 scope only: repo-aware manifest + starter-kit artifacts. No broad scaffold, governance-specific, or audit/log files.
            Starter-kit files are fetched live from GovernanceHub. No auto-push. Push executes only on explicit operator action above.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function RepoRawAccessPanel() {
  const { activeRepo } = useActiveRepo();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("all");
  const [tab, setTab] = useState("priority"); // "priority" | "all"

  const allFiles = MANIFEST?.files ?? [];
  const priorityFiles = PRIORITY?.files ?? [];

  // Derive filter options
  const categories = useMemo(() => {
    const cats = new Set(allFiles.map((f) => f.category));
    return ["all", ...Array.from(cats).sort()];
  }, [allFiles]);

  const folders = useMemo(() => {
    const fols = new Set(allFiles.map((f) => f.folder));
    return ["all", ...Array.from(fols).sort()];
  }, [allFiles]);

  const filteredFiles = useMemo(() => {
    return allFiles.filter((f) => {
      const q = query.toLowerCase();
      const matchesQuery = !q || f.path.toLowerCase().includes(q) || f.fileName.toLowerCase().includes(q);
      const matchesCat = categoryFilter === "all" || f.category === categoryFilter;
      const matchesFolder = folderFilter === "all" || f.folder === folderFilter;
      return matchesQuery && matchesCat && matchesFolder;
    });
  }, [allFiles, query, categoryFilter, folderFilter]);

  // Determine whether the active repo differs from the canonical manifest repo
  const isDifferentRepo = activeRepo && (
    activeRepo.owner?.toLowerCase() !== MANIFEST_REPO.owner.toLowerCase() ||
    activeRepo.repo?.toLowerCase()  !== MANIFEST_REPO.repo.toLowerCase()
  );

  // Build draft manifest only when a non-canonical repo is selected
  const draftManifest = useMemo(() => {
    if (!isDifferentRepo) return null;
    const owner  = activeRepo.owner  || activeRepo.fullName?.split("/")?.[0];
    const repo   = activeRepo.repo   || activeRepo.fullName?.split("/")?.[1];
    if (!owner || !repo) return null; // guard: can't build valid URLs without owner/repo
    const defaultBranch  = activeRepo.defaultBranch;
    const branch         = defaultBranch || activeRepo.branch || "main";
    const branchIsDefault = Boolean(defaultBranch);
    return generateDraftManifest(owner, repo, branch, branchIsDefault);
  }, [isDifferentRepo, activeRepo]);

  if (!MANIFEST || !MANIFEST.files) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-2">
          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-slate-500 font-medium">Manifest not found</p>
          <p className="text-xs text-slate-400">
            Run <code className="bg-slate-100 px-1 rounded">node tools/generateRepoManifest.js</code> to generate the manifest.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Repo identity banner ─────────────────────────────────────── */}
      {activeRepo &&
      activeRepo.owner?.toLowerCase() === MANIFEST_REPO.owner.toLowerCase() &&
      activeRepo.repo?.toLowerCase() === MANIFEST_REPO.repo.toLowerCase() ? (
        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded px-3 py-2 text-xs text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 mt-0.5 shrink-0" />
          <span><strong>Repo-kjent:</strong> Aktivt repo samsvarer med manifest-kilde ({activeRepo.fullName}). Filene nedenfor er verifisert mot denne kilden.</span>
        </div>
      ) : activeRepo ? (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
          <span><strong>Stale manifest-referanse:</strong> Aktivt repo er <strong>{activeRepo.fullName}</strong>, men dette panelet viser GovernanceHub-kanonisk manifest ({MANIFEST_REPO.owner}/{MANIFEST_REPO.repo}). Filene nedenfor gjelder ikke aktivt valgt repo.</span>
        </div>
      ) : (
        <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-600">
          <FileText className="w-3 h-3 mt-0.5 shrink-0" />
          <span><strong>Ingen aktivt repo.</strong> Viser kanonisk GovernanceHub-manifest ({MANIFEST_REPO.owner}/{MANIFEST_REPO.repo}). Velg aktivt repo i toppmenyen for repo-spesifikk visning.</span>
        </div>
      )}

      {/* ── SECTION A: GovernanceHub canonical reference ─────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <CardTitle className="text-base text-slate-800">Repository Raw Access</CardTitle>
                <Badge className="bg-purple-100 text-purple-700 text-xs">GovernanceHub canonical reference</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspecting: {MANIFEST_REPO.owner}/{MANIFEST_REPO.repo} · {allFiles.length} filer · Generert {MANIFEST._meta?.generatedAt}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3 border-b border-slate-200">
            {[
              { key: "priority", label: `Priority (${priorityFiles.length})` },
              { key: "all", label: `All Files (${allFiles.length})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                  tab === key
                    ? "border-slate-800 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {tab === "priority" ? (
            <div>
              {priorityFiles.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No priority files found.</p>
              ) : (
                priorityFiles.map((f) => <PriorityRow key={f.path} file={f} />)
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                  <Input
                    placeholder="Search by path or filename…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-7 h-8 text-xs"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-8 text-xs border border-slate-200 rounded-md px-2 text-slate-700 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>
                  ))}
                </select>
                <select
                  value={folderFilter}
                  onChange={(e) => setFolderFilter(e.target.value)}
                  className="h-8 text-xs border border-slate-200 rounded-md px-2 text-slate-700 bg-white max-w-48 truncate"
                >
                  {folders.map((f) => (
                    <option key={f} value={f}>{f === "all" ? "All folders" : f}</option>
                  ))}
                </select>
              </div>

              {filteredFiles.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No files match your filters.</p>
              ) : (
                <div>
                  <p className="text-xs text-slate-400 mb-2">{filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""}</p>
                  {filteredFiles.map((f) => <FileRow key={f.path} file={f} />)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── SECTIONS B / PREVIEW / PUSH-READY — only when a different repo is active ── */}
      {draftManifest && (
        <>
          {/* SECTION B: Generated draft manifest */}
          <DraftManifestSection manifest={draftManifest} />

          {/* PAYLOAD SOURCE PREVIEW */}
          <PushPreviewSection manifest={draftManifest} />

          {/* DIRECT PUSH */}
          <DirectPushSection manifest={draftManifest} />
        </>
      )}
    </div>
  );
}
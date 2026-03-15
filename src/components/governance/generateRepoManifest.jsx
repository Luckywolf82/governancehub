/**
 * generateRepoManifest.js
 * ========================
 * Generator utility for GovernanceHub repository raw access manifests.
 *
 * USAGE:
 *   node tools/generateRepoManifest.js
 *
 * OUTPUT:
 *   src/components/governance/REPO_FILE_MANIFEST.json
 *   src/components/governance/PRIORITY_REPO_FILES.json
 *   src/components/governance/repo-index/root-index.json
 *   src/components/governance/repo-index/governance-index.json
 *   src/components/governance/repo-index/audits-index.json
 *   src/components/governance/repo-index/pages-index.json
 *   src/components/governance/repo-index/components-index.json
 *   src/components/governance/repo-index/admin-index.json
 *
 * NOTE:
 *   This file was placed at src/components/governance/ because Base44 cannot
 *   write to tools/ directly. Copy to tools/ to execute:
 *     cp src/components/governance/generateRepoManifest.js tools/generateRepoManifest.js
 *     node tools/generateRepoManifest.js
 *
 * GOVERNANCE RULES:
 *   - Never output entries with exists: false unless explicitly confirmed missing
 *   - Never invent file paths
 *   - Never include node_modules, dist, build, .git internals
 *   - Always use stable alphabetical ordering by path
 *   - generatedAt must reflect actual run date
 */

const fs = require("fs");
const path = require("path");

// ── Config ────────────────────────────────────────────────────────────────────

const REPO_OWNER = "Luckywolf82";
const REPO_NAME = "governancehub";
const BRANCH = "main";
const REPO_ROOT = path.resolve(__dirname, ".."); // adjust if running from tools/

const RAW_BASE = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`;
const GITHUB_BASE = `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${BRANCH}`;

const OUTPUT_DIR = path.join(REPO_ROOT, "src/components/governance");
const INDEX_DIR = path.join(OUTPUT_DIR, "repo-index");

const EXCLUDE_PATTERNS = [
  "node_modules",
  "dist",
  "build",
  ".git",
  ".next",
  ".cache",
  "coverage",
];

const LOCKED_PATHS = new Set([
  "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx",
  "src/components/governance/LockedFiles.jsx",
]);

// ── Category mapping ──────────────────────────────────────────────────────────

function categorize(filePath) {
  if (filePath.includes("components/governance")) return "governance";
  if (filePath.includes("components/audits")) return "audits";
  if (filePath.includes("components/projects")) return "projects";
  if (filePath.includes("pages/")) return "pages";
  if (filePath.includes("pages/Admin") || filePath.includes("components/Admin")) return "admin";
  if (filePath.includes("components/")) return "components";
  if (filePath.includes("utils/") || filePath.includes("tools/") || filePath.includes("functions/")) return "utils";
  if (
    filePath.endsWith("package.json") ||
    filePath.endsWith("vite.config.js") ||
    filePath.endsWith("tailwind.config.js") ||
    filePath.endsWith("eslint.config.js") ||
    filePath.endsWith(".gitignore") ||
    filePath.endsWith("jsconfig.json") ||
    filePath.endsWith("components.json") ||
    filePath.endsWith("pages.config.js") ||
    filePath.endsWith("App.jsx") ||
    filePath.endsWith("main.jsx")
  ) return "config";
  if (filePath.endsWith(".md") || filePath.endsWith("README.jsx") || filePath.endsWith("ROADMAP.jsx")) return "docs";
  if (filePath.endsWith(".css") || filePath.endsWith(".html") || filePath.endsWith(".png") || filePath.endsWith(".svg")) return "assets";
  return "other";
}

// ── File walker ───────────────────────────────────────────────────────────────

function walk(dir, repoRoot) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (EXCLUDE_PATTERNS.some((p) => fullPath.includes(path.sep + p + path.sep) || fullPath.endsWith(path.sep + p))) {
      continue;
    }

    if (entry.isDirectory()) {
      results.push(...walk(fullPath, repoRoot));
    } else {
      const relPath = path.relative(repoRoot, fullPath).replace(/\\/g, "/");
      results.push(relPath);
    }
  }

  return results.sort();
}

// ── Entry builder ─────────────────────────────────────────────────────────────

function buildEntry(relPath) {
  const fileName = path.basename(relPath);
  const ext = path.extname(relPath).replace(".", "");
  const folder = path.dirname(relPath).replace(/\\/g, "/");

  return {
    path: relPath,
    fileName,
    extension: ext,
    folder,
    rawUrl: `${RAW_BASE}/${relPath}`,
    githubUrl: `${GITHUB_BASE}/${relPath}`,
    category: categorize(relPath),
    exists: true,
    ...(LOCKED_PATHS.has(relPath) ? { locked: true } : {}),
  };
}

// ── Generators ────────────────────────────────────────────────────────────────

function generateRepoFileManifest(filePaths) {
  return {
    _meta: {
      description: "Canonical file manifest for the GovernanceHub repository.",
      repo: `https://github.com/${REPO_OWNER}/${REPO_NAME}`,
      branch: BRANCH,
      rawBase: RAW_BASE,
      githubBase: GITHUB_BASE,
      generatedAt: new Date().toISOString().slice(0, 10),
      generatedBy: "generateRepoManifest.js",
    },
    files: filePaths.map(buildEntry),
  };
}

function generatePriorityRepoFiles(manifest) {
  const PRIORITY_PATHS = [
    { path: "src/components/governance/LockedFiles.jsx",          priority: "critical", label: "Locked File Registry",    why: "Defines which files must never be silently modified." },
    { path: "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx", priority: "critical", label: "AI Project Instructions", why: "Canonical governance rules for all AI agents." },
    { path: "src/components/governance/PhaseExecutionLog.jsx",    priority: "critical", label: "Phase Execution Log",      why: "Full history of structural changes." },
    { path: "src/components/governance/AI_STATE.jsx",             priority: "critical", label: "AI State",                 why: "Current project phase and active focus." },
    { path: "src/components/governance/NextSafeStep.jsx",         priority: "critical", label: "Next Safe Step",           why: "Approved next action — do not bypass." },
    { path: "src/App.jsx",                                         priority: "critical", label: "App Bootstrap / Router",   why: "Main routing configuration." },
    { path: "src/components/audits/AUDIT_INDEX.jsx",              priority: "high",     label: "Audit Index",              why: "Canonical registry of all audit records." },
    { path: "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx",       priority: "high",     label: "Audit System Guide",       why: "Standards for all audit artifacts." },
    { path: "src/components/projects/WORKSTREAM_REGISTRY.jsx",    priority: "high",     label: "Workstream Registry",      why: "Canonical registry of all internal workstreams." },
    { path: "src/components/governance/LastVerifiedState.jsx",    priority: "high",     label: "Last Verified State",      why: "Last known verified repository state." },
    { path: "src/pages/Admin.jsx",                                 priority: "high",     label: "Admin Page",               why: "Primary admin interface." },
    { path: "src/components/AppLayout.jsx",                        priority: "high",     label: "App Layout",               why: "Global navigation shell." },
    { path: "functions/runBaselineAudit.ts",                       priority: "normal",   label: "Baseline Audit Function",  why: "Backend audit runner." },
    { path: "src/pages.config.js",                                 priority: "normal",   label: "Pages Config",             why: "Legacy page config — verify against App.jsx." },
    { path: "src/components/governance/TaskGenerator.js",         priority: "normal",   label: "Task Generator",           why: "Utility for generating governance tasks." },
  ];

  const fileMap = new Map(manifest.files.map((f) => [f.path, f]));

  return {
    _meta: {
      description: "Priority file registry for GovernanceHub. Read these first.",
      generatedAt: new Date().toISOString().slice(0, 10),
    },
    files: PRIORITY_PATHS.map(({ path: p, priority, label, why }) => {
      const entry = fileMap.get(p);
      return {
        path: p,
        label,
        priority,
        whyItMatters: why,
        rawUrl: `${RAW_BASE}/${p}`,
        githubUrl: `${GITHUB_BASE}/${p}`,
        lockedFile: LOCKED_PATHS.has(p),
        exists: !!entry,
      };
    }),
  };
}

function generateFolderIndex(folder, allFiles, subfolderList) {
  const folderFiles = allFiles.filter(
    (f) => f.folder === folder || f.folder.startsWith(folder + "/")
  );
  return {
    folder,
    generatedAt: new Date().toISOString().slice(0, 10),
    fileCount: folderFiles.length,
    subfolders: subfolderList,
    files: folderFiles.map(({ path: p, fileName, rawUrl, githubUrl, category, exists }) => ({
      path: p, fileName, rawUrl, githubUrl, category, exists,
    })),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

function generateRepoRawAccessArtifacts() {
  console.log("Reading repository structure from:", REPO_ROOT);

  const allPaths = walk(REPO_ROOT, REPO_ROOT);
  console.log(`Found ${allPaths.length} files.`);

  const manifest = generateRepoFileManifest(allPaths);
  const priority = generatePriorityRepoFiles(manifest);

  const allEntries = manifest.files;

  const indexes = {
    "root-index.json": generateFolderIndex("", allEntries.filter((f) => !f.folder || f.folder === "."), [
      "src", "functions", "tools", ".github",
    ]),
    "governance-index.json": generateFolderIndex(
      "src/components/governance", allEntries, []
    ),
    "audits-index.json": generateFolderIndex(
      "src/components/audits", allEntries,
      ["architecture", "data", "governance", "performance", "product", "ui"]
    ),
    "pages-index.json": generateFolderIndex("src/pages", allEntries, []),
    "components-index.json": generateFolderIndex(
      "src/components", allEntries.filter((f) => f.folder === "src/components"),
      ["audits", "github", "governance", "projects", "ui"]
    ),
    "admin-index.json": {
      folder: "admin-related",
      generatedAt: new Date().toISOString().slice(0, 10),
      fileCount: 0,
      subfolders: [],
      files: allEntries.filter((f) => f.category === "admin"),
    },
  };
  indexes["admin-index.json"].fileCount = indexes["admin-index.json"].files.length;

  // Write outputs
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(INDEX_DIR, { recursive: true });

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "REPO_FILE_MANIFEST.json"),
    JSON.stringify(manifest, null, 2)
  );
  console.log("✓ REPO_FILE_MANIFEST.json");

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "PRIORITY_REPO_FILES.json"),
    JSON.stringify(priority, null, 2)
  );
  console.log("✓ PRIORITY_REPO_FILES.json");

  for (const [name, data] of Object.entries(indexes)) {
    fs.writeFileSync(path.join(INDEX_DIR, name), JSON.stringify(data, null, 2));
    console.log(`✓ repo-index/${name}`);
  }

  console.log("\nDone. All artifacts written to:", OUTPUT_DIR);
}

generateRepoRawAccessArtifacts();
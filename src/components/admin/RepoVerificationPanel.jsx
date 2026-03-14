import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Lock, CheckCircle2, XCircle, AlertTriangle, BookOpen, Link2 } from "lucide-react";

// ── Inline verification data ──────────────────────────────────────────────────
// Source: derived from REPO_FILE_MANIFEST + PRIORITY_REPO_FILES (2026-03-14)
// Re-derive by running: node tools/generateRepoManifest.js

const RAW_BASE = "https://raw.githubusercontent.com/Luckywolf82/governancehub/main";
const GH_BASE  = "https://github.com/Luckywolf82/governancehub/blob/main";

// ── Artifact registry ─────────────────────────────────────────────────────────
// These are the generated verification artifacts. exists=true once created in repo.
const ARTIFACTS = [
  { label: "File Manifest",         path: "src/components/governance/REPO_FILE_MANIFEST.json",       exists: false, note: "Full file index (46 files)" },
  { label: "Priority Registry",     path: "src/components/governance/PRIORITY_REPO_FILES.json",      exists: false, note: "15 priority files with labels" },
  { label: "Verification Bundle",   path: "src/components/governance/REPO_VERIFICATION_BUNDLE.json", exists: false, note: "Compact ChatGPT start pack" },
  { label: "Read This First",       path: "src/components/governance/READ_THIS_FIRST.json",           exists: false, note: "Ordered verification flows" },
  { label: "Raw Access Guide",      path: "src/components/governance/REPO_RAW_ACCESS_GUIDE.jsx",     exists: true,  note: "Usage guide for raw access" },
];

// ── Verification bundle (inline) ──────────────────────────────────────────────
const VERIFICATION_BUNDLE = {
  generatedAt: "2026-03-14",
  repository: "https://github.com/Luckywolf82/governancehub",
  branch: "main",
  totalFilesIndexed: 46,
  missingCriticalFiles: [],

  priorityFiles: [
    { path: "src/components/governance/LockedFiles.jsx",           label: "Locked File Registry",    rawUrl: `${RAW_BASE}/src/components/governance/LockedFiles.jsx`,           githubUrl: `${GH_BASE}/src/components/governance/LockedFiles.jsx`,           exists: true, category: "governance", priority: "critical", lockedFile: true },
    { path: "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx", label: "AI Project Instructions", rawUrl: `${RAW_BASE}/src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx`, githubUrl: `${GH_BASE}/src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx`, exists: true, category: "governance", priority: "critical", lockedFile: true },
    { path: "src/components/governance/PhaseExecutionLog.jsx",     label: "Phase Execution Log",     rawUrl: `${RAW_BASE}/src/components/governance/PhaseExecutionLog.jsx`,     githubUrl: `${GH_BASE}/src/components/governance/PhaseExecutionLog.jsx`,     exists: true, category: "governance", priority: "critical", lockedFile: false },
    { path: "src/components/governance/AI_STATE.jsx",              label: "AI State",                rawUrl: `${RAW_BASE}/src/components/governance/AI_STATE.jsx`,              githubUrl: `${GH_BASE}/src/components/governance/AI_STATE.jsx`,              exists: true, category: "governance", priority: "critical", lockedFile: false },
    { path: "src/components/governance/NextSafeStep.jsx",          label: "Next Safe Step",          rawUrl: `${RAW_BASE}/src/components/governance/NextSafeStep.jsx`,          githubUrl: `${GH_BASE}/src/components/governance/NextSafeStep.jsx`,          exists: true, category: "governance", priority: "critical", lockedFile: false },
    { path: "src/App.jsx",                                         label: "App Router",              rawUrl: `${RAW_BASE}/src/App.jsx`,                                         githubUrl: `${GH_BASE}/src/App.jsx`,                                         exists: true, category: "bootstrap", priority: "critical", lockedFile: false },
  ],

  lockedFiles: [
    { path: "src/components/governance/LockedFiles.jsx",           label: "Locked File Registry",    rawUrl: `${RAW_BASE}/src/components/governance/LockedFiles.jsx`,           githubUrl: `${GH_BASE}/src/components/governance/LockedFiles.jsx` },
    { path: "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx", label: "AI Project Instructions", rawUrl: `${RAW_BASE}/src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx`, githubUrl: `${GH_BASE}/src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx` },
  ],

  governanceFiles: [
    { path: "src/components/governance/AI_STATE.jsx",              label: "AI State",              rawUrl: `${RAW_BASE}/src/components/governance/AI_STATE.jsx` },
    { path: "src/components/governance/NextSafeStep.jsx",          label: "Next Safe Step",        rawUrl: `${RAW_BASE}/src/components/governance/NextSafeStep.jsx` },
    { path: "src/components/governance/PhaseExecutionLog.jsx",     label: "Phase Execution Log",   rawUrl: `${RAW_BASE}/src/components/governance/PhaseExecutionLog.jsx` },
    { path: "src/components/governance/LastVerifiedState.jsx",     label: "Last Verified State",   rawUrl: `${RAW_BASE}/src/components/governance/LastVerifiedState.jsx` },
    { path: "src/components/governance/TaskGenerator.js",          label: "Task Generator",        rawUrl: `${RAW_BASE}/src/components/governance/TaskGenerator.js` },
  ],

  adminFiles: [
    { path: "src/pages/Admin.jsx",               label: "Admin Page",      rawUrl: `${RAW_BASE}/src/pages/Admin.jsx` },
    { path: "src/components/AppLayout.jsx",      label: "App Layout",      rawUrl: `${RAW_BASE}/src/components/AppLayout.jsx` },
  ],

  routingFiles: [
    { path: "src/App.jsx",           label: "App Router",     rawUrl: `${RAW_BASE}/src/App.jsx` },
    { path: "src/pages.config.js",   label: "Pages Config",   rawUrl: `${RAW_BASE}/src/pages.config.js` },
  ],

  bootstrapFiles: [
    { path: "src/main.jsx",     label: "Entry Point",  rawUrl: `${RAW_BASE}/src/main.jsx` },
    { path: "package.json",     label: "package.json", rawUrl: `${RAW_BASE}/package.json` },
    { path: "vite.config.js",   label: "Vite Config",  rawUrl: `${RAW_BASE}/vite.config.js` },
  ],
};

// ── Read-this-first flows ─────────────────────────────────────────────────────
const READ_THIS_FIRST = {
  governanceVerification: [
    { step: 1, label: "Locked File Registry",    path: "src/components/governance/LockedFiles.jsx",           reason: "Always read first — defines what cannot change.", rawUrl: `${RAW_BASE}/src/components/governance/LockedFiles.jsx`,           githubUrl: `${GH_BASE}/src/components/governance/LockedFiles.jsx`,           exists: true },
    { step: 2, label: "AI Project Instructions", path: "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx", reason: "Canonical governance rules for AI agents.",       rawUrl: `${RAW_BASE}/src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx`, githubUrl: `${GH_BASE}/src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx`, exists: true },
    { step: 3, label: "Phase Execution Log",     path: "src/components/governance/PhaseExecutionLog.jsx",     reason: "Full change history. Must read before proposing.",  rawUrl: `${RAW_BASE}/src/components/governance/PhaseExecutionLog.jsx`,     githubUrl: `${GH_BASE}/src/components/governance/PhaseExecutionLog.jsx`,     exists: true },
    { step: 4, label: "AI State",                path: "src/components/governance/AI_STATE.jsx",              reason: "Current project phase and verification status.",    rawUrl: `${RAW_BASE}/src/components/governance/AI_STATE.jsx`,              githubUrl: `${GH_BASE}/src/components/governance/AI_STATE.jsx`,              exists: true },
    { step: 5, label: "Next Safe Step",          path: "src/components/governance/NextSafeStep.jsx",          reason: "Approved next action. Do not bypass.",             rawUrl: `${RAW_BASE}/src/components/governance/NextSafeStep.jsx`,          githubUrl: `${GH_BASE}/src/components/governance/NextSafeStep.jsx`,          exists: true },
    { step: 6, label: "Audit Index",             path: "src/components/audits/AUDIT_INDEX.jsx",               reason: "All audit records.",                               rawUrl: `${RAW_BASE}/src/components/audits/AUDIT_INDEX.jsx`,               githubUrl: `${GH_BASE}/src/components/audits/AUDIT_INDEX.jsx`,               exists: true },
    { step: 7, label: "Audit System Guide",      path: "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx",        reason: "Audit naming standards and conventions.",          rawUrl: `${RAW_BASE}/src/components/audits/AUDIT_SYSTEM_GUIDE.jsx`,        githubUrl: `${GH_BASE}/src/components/audits/AUDIT_SYSTEM_GUIDE.jsx`,        exists: true },
    { step: 8, label: "Project Registry",        path: "src/components/projects/PROJECT_REGISTRY.jsx",        reason: "All active and planned projects.",                 rawUrl: `${RAW_BASE}/src/components/projects/PROJECT_REGISTRY.jsx`,        githubUrl: `${GH_BASE}/src/components/projects/PROJECT_REGISTRY.jsx`,        exists: true },
  ],
  routingVerification: [
    { step: 1, label: "App Router",    path: "src/App.jsx",           reason: "All routes are defined here.",                        rawUrl: `${RAW_BASE}/src/App.jsx`,           githubUrl: `${GH_BASE}/src/App.jsx`,           exists: true },
    { step: 2, label: "Pages Config",  path: "src/pages.config.js",   reason: "Legacy page map — verify against App.jsx routes.",    rawUrl: `${RAW_BASE}/src/pages.config.js`,   githubUrl: `${GH_BASE}/src/pages.config.js`,   exists: true },
    { step: 3, label: "App Layout",    path: "src/components/AppLayout.jsx", reason: "Nav items — must match App.jsx route paths.", rawUrl: `${RAW_BASE}/src/components/AppLayout.jsx`, githubUrl: `${GH_BASE}/src/components/AppLayout.jsx`, exists: true },
    { step: 4, label: "Home Page",     path: "src/pages/Home.jsx",    reason: "Verify default route target exists.",                 rawUrl: `${RAW_BASE}/src/pages/Home.jsx`,    githubUrl: `${GH_BASE}/src/pages/Home.jsx`,    exists: true },
  ],
  adminVerification: [
    { step: 1, label: "Admin Page",        path: "src/pages/Admin.jsx",             reason: "Primary admin entry point.",                          rawUrl: `${RAW_BASE}/src/pages/Admin.jsx`,             githubUrl: `${GH_BASE}/src/pages/Admin.jsx`,             exists: true },
    { step: 2, label: "Repo Access Panel", path: "src/components/admin/RepoRawAccessPanel.jsx", reason: "File index and raw URL browser.", rawUrl: `${RAW_BASE}/src/components/admin/RepoRawAccessPanel.jsx`, githubUrl: `${GH_BASE}/src/components/admin/RepoRawAccessPanel.jsx`, exists: true },
    { step: 3, label: "App Layout",        path: "src/components/AppLayout.jsx",    reason: "Verify admin nav item is present.",                   rawUrl: `${RAW_BASE}/src/components/AppLayout.jsx`,    githubUrl: `${GH_BASE}/src/components/AppLayout.jsx`,    exists: true },
  ],
  projectStructureVerification: [
    { step: 1, label: "Project Registry",   path: "src/components/projects/PROJECT_REGISTRY.jsx", reason: "Source of truth for all projects.",       rawUrl: `${RAW_BASE}/src/components/projects/PROJECT_REGISTRY.jsx`, githubUrl: `${GH_BASE}/src/components/projects/PROJECT_REGISTRY.jsx`, exists: true },
    { step: 2, label: "Projects Page",      path: "src/pages/Projects.jsx",                        reason: "Verify it reads from PROJECT_REGISTRY.",  rawUrl: `${RAW_BASE}/src/pages/Projects.jsx`,                        githubUrl: `${GH_BASE}/src/pages/Projects.jsx`,                        exists: true },
    { step: 3, label: "Audit Index",        path: "src/components/audits/AUDIT_INDEX.jsx",         reason: "Source of truth for all audit records.",  rawUrl: `${RAW_BASE}/src/components/audits/AUDIT_INDEX.jsx`,         githubUrl: `${GH_BASE}/src/components/audits/AUDIT_INDEX.jsx`,         exists: true },
    { step: 4, label: "Audits Page",        path: "src/pages/Audits.jsx",                          reason: "Verify it reads from AUDIT_INDEX.",       rawUrl: `${RAW_BASE}/src/pages/Audits.jsx`,                          githubUrl: `${GH_BASE}/src/pages/Audits.jsx`,                          exists: true },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
    >
      <Copy className="w-3 h-3" />
      {copied ? "Copied!" : "copy"}
    </button>
  );
}

function OpenButton({ url }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
    >
      <ExternalLink className="w-3 h-3" /> open
    </a>
  );
}

const FLOW_LABELS = {
  governanceVerification:       "Governance",
  routingVerification:          "Routing",
  adminVerification:            "Admin",
  projectStructureVerification: "Project Structure",
};

// ── Main component ────────────────────────────────────────────────────────────

export default function RepoVerificationPanel() {
  const [activeFlow, setActiveFlow] = useState("governanceVerification");
  const [filterCritical, setFilterCritical] = useState(false);
  const [filterLocked, setFilterLocked] = useState(false);
  const [filterMissing, setFilterMissing] = useState(false);

  const bundle = VERIFICATION_BUNDLE;
  const missingCount = bundle.missingCriticalFiles.length;

  // Filtered bundle priority files
  const displayFiles = bundle.priorityFiles.filter((f) => {
    if (filterCritical && f.priority !== "critical") return false;
    if (filterLocked   && !f.lockedFile) return false;
    if (filterMissing  && f.exists !== false) return false;
    return true;
  });

  return (
    <div className="space-y-4">

      {/* ── Artifact Status ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-slate-800">Verification Artifacts</CardTitle>
          <p className="text-xs text-slate-400">
            Generated {bundle.generatedAt} · {bundle.totalFilesIndexed} files indexed ·{" "}
            {missingCount === 0
              ? <span className="text-green-600 font-medium">no critical files missing</span>
              : <span className="text-red-600 font-medium">{missingCount} critical file{missingCount !== 1 ? "s" : ""} missing</span>}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {ARTIFACTS.map((a) => (
              <div key={a.path} className={`flex items-start gap-2 rounded-lg border p-3 ${a.exists ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
                {a.exists
                  ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  : <XCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{a.label}</p>
                  <p className="text-xs text-slate-500">{a.note}</p>
                  {!a.exists && (
                    <p className="text-xs text-amber-600 mt-0.5">Not yet in repo · run generator</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!ARTIFACTS.every((a) => a.exists) && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600">
                Some artifacts are not yet committed to the repo.
                Run <code className="bg-slate-200 px-1 rounded">node tools/generateRepoManifest.js</code> locally, commit, and push to sync.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Verification Start Pack ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-slate-800">Verification Start Pack</CardTitle>
          <p className="text-xs text-slate-400">Priority files — read these to verify repo state</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              { key: "filterCritical", label: "Critical only",  active: filterCritical, set: setFilterCritical },
              { key: "filterLocked",   label: "Locked only",    active: filterLocked,   set: setFilterLocked },
              { key: "filterMissing",  label: "Missing only",   active: filterMissing,  set: setFilterMissing },
            ].map(({ key, label, active, set }) => (
              <button key={key} onClick={() => set((v) => !v)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  active ? "bg-slate-800 text-white border-slate-800" : "border-slate-300 text-slate-600 hover:border-slate-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {displayFiles.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No files match active filters.</p>
          ) : (
            <div>
              {displayFiles.map((f) => (
                <div key={f.path} className="py-2.5 border-b border-slate-100 last:border-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    {f.lockedFile && <Lock className="w-3 h-3 text-red-500 shrink-0" />}
                    <span className="text-sm font-medium text-slate-800">{f.label}</span>
                    <Badge className={`text-xs ${f.priority === "critical" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                      {f.priority}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800 text-xs">{f.category}</Badge>
                    {f.exists === false && <Badge className="bg-red-100 text-red-700 text-xs">missing</Badge>}
                  </div>
                  <p className="text-xs font-mono text-slate-400 truncate mb-1">{f.path}</p>
                  <div className="flex gap-1">
                    <CopyButton value={f.rawUrl} />
                    <OpenButton url={f.rawUrl} />
                    <CopyButton value={f.githubUrl} />
                    <OpenButton url={f.githubUrl} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Read-This-First Flows ── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-600" />
            <CardTitle className="text-base text-slate-800">Read-This-First Flows</CardTitle>
          </div>
          <p className="text-xs text-slate-400">Ordered verification sequences for different review types</p>
          <div className="flex flex-wrap gap-1 mt-2 border-b border-slate-200 pb-0">
            {Object.keys(READ_THIS_FIRST).map((key) => (
              <button key={key} onClick={() => setActiveFlow(key)}
                className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                  activeFlow === key
                    ? "border-slate-800 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {FLOW_LABELS[key]}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {READ_THIS_FIRST[activeFlow].map((item) => (
            <div key={item.path} className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
              <span className="shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center mt-0.5">
                {item.step}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-medium text-slate-800">{item.label}</span>
                  {!item.exists && <Badge className="bg-red-100 text-red-700 text-xs">missing</Badge>}
                </div>
                <p className="text-xs text-slate-500 mb-1">{item.reason}</p>
                <p className="text-xs font-mono text-slate-400 truncate mb-1">{item.path}</p>
                <div className="flex gap-1">
                  <CopyButton value={item.rawUrl} />
                  <OpenButton url={item.rawUrl} />
                  <CopyButton value={item.githubUrl} />
                  <OpenButton url={item.githubUrl} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
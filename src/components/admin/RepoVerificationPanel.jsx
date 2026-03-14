import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Lock, CheckCircle2, BookOpen, Link2, AlertTriangle, Github } from "lucide-react";
import { CHATGPT_REPO_INDEX } from "@/components/governance/CHATGPT_REPO_INDEX";
import { useActiveRepo } from "@/components/ActiveRepoContext";

// ── Canonical single artifact — lives as a committed source file ──────────────
// Published to GitHub via Base44 Publish. No terminal step required.
const CANONICAL = {
  label:     "CHATGPT_REPO_INDEX.js",
  path:      "src/components/governance/CHATGPT_REPO_INDEX.js",
  rawUrl:    CHATGPT_REPO_INDEX.canonicalRawUrl,
  githubUrl: CHATGPT_REPO_INDEX.canonicalGithubUrl,
  exists:    true,
  desc:      "Canonical repo index — manifest, priority files, verification flows, locked files.",
};

// ── Data sourced from canonical index file ────────────────────────────────────
const VERIFICATION_BUNDLE = {
  generatedAt:        CHATGPT_REPO_INDEX.generatedAt,
  totalFilesIndexed:  CHATGPT_REPO_INDEX.verificationBundleMeta.totalFilesIndexed,
  missingCriticalFiles: CHATGPT_REPO_INDEX.verificationBundleMeta.missingCriticalFiles,
  priorityFiles:      CHATGPT_REPO_INDEX.priorityFiles,
};

const READ_THIS_FIRST = CHATGPT_REPO_INDEX.readThisFirst;

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

function CopyAllButton({ urls, label }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(urls.join("\n")); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded border transition-colors ${
        copied ? "bg-green-100 text-green-700 border-green-300" : "border-slate-300 text-slate-600 hover:border-slate-500 hover:bg-slate-50"
      }`}
    >
      <Copy className="w-3 h-3" />
      {copied ? "Kopiert!" : label}
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
  const { activeRepo } = useActiveRepo();
  const [activeFlow, setActiveFlow] = useState("governanceVerification");
  const [filterCritical, setFilterCritical] = useState(false);
  const [filterLocked, setFilterLocked] = useState(false);
  const [filterMissing, setFilterMissing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  function copyWithFeedback(value, key) {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  }

  const bundle = VERIFICATION_BUNDLE;
  const missingCount = bundle.missingCriticalFiles.length;

  // Filtered bundle priority files
  const displayFiles = bundle.priorityFiles.filter((f) => {
    if (filterCritical && f.priority !== "critical") return false;
    if (filterLocked   && !f.lockedFile) return false;
    if (filterMissing  && f.exists !== false) return false;
    return true;
  });

  // All raw URLs grouped by category for "copy all" buttons
  const allCategoryUrls = {
    governance:  CHATGPT_REPO_INDEX.governanceFiles.map((f) => f.rawUrl),
    admin:       CHATGPT_REPO_INDEX.adminFiles.map((f) => f.rawUrl),
    routing:     CHATGPT_REPO_INDEX.routingFiles.map((f) => f.rawUrl),
    bootstrap:   CHATGPT_REPO_INDEX.bootstrapFiles.map((f) => f.rawUrl),
    priority:    bundle.priorityFiles.map((f) => f.rawUrl),
  };
  const allRawUrls = [
    ...new Set([
      ...allCategoryUrls.priority,
      ...allCategoryUrls.governance,
      ...allCategoryUrls.admin,
      ...allCategoryUrls.routing,
      ...allCategoryUrls.bootstrap,
    ])
  ];

  return (
    <div className="space-y-4">

      {activeRepo && (
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs text-blue-800">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
          <span><strong>Merk:</strong> Dette panelet viser kanonisk referanseinnhold for GovernanceHub, ikke aktivt valgt repo. Aktivt repo er valgt ({activeRepo.owner}/{activeRepo.repo}), men verifikasjonsstatus nedenfor er statisk GovernanceHub-referans.</span>
        </div>
      )}

      {/* ── ChatGPT Start Link ── */}
      <Card className="border-slate-800 bg-slate-900 text-white">
        <CardContent className="p-4 space-y-3">

          {/* Header */}
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-slate-300" />
            <span className="text-sm font-semibold text-white">ChatGPT Start Link</span>
          </div>
          <p className="text-xs text-slate-400">
            Canonical artifact: <span className="font-mono text-slate-200">{CANONICAL.label}</span>
            {" "}· Publish in Base44, then copy this raw URL into ChatGPT.
          </p>

          {/* Raw URL display */}
          <div className="bg-slate-800 rounded px-3 py-2 font-mono text-xs text-slate-200 break-all select-all">
            {CANONICAL.rawUrl}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => copyWithFeedback(CANONICAL.rawUrl, "raw")}
              className="flex items-center gap-1.5 bg-white text-slate-900 hover:bg-slate-100 text-sm font-semibold px-4 py-2 rounded transition-colors"
            >
              <Copy className="w-4 h-4" />
              {copiedKey === "raw" ? "Copied!" : "Copy Raw Index URL"}
            </button>
            <button
              onClick={() => copyWithFeedback(CANONICAL.githubUrl, "gh")}
              className="flex items-center gap-1.5 border border-slate-600 text-slate-300 hover:border-slate-400 text-xs font-medium px-3 py-2 rounded transition-colors"
            >
              <Copy className="w-3 h-3" />
              {copiedKey === "gh" ? "Copied!" : "Copy GitHub URL"}
            </button>
            <a href={CANONICAL.rawUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 border border-slate-600 text-slate-300 hover:border-slate-400 text-xs font-medium px-3 py-2 rounded transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Open Raw
            </a>
            <a href={CANONICAL.githubUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 border border-slate-600 text-slate-300 hover:border-slate-400 text-xs font-medium px-3 py-2 rounded transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Open GitHub
            </a>
          </div>

          {/* Publish note */}
          <div className="border-t border-slate-700 pt-2 text-xs text-slate-500">
            Raw links reflect the <strong className="text-slate-400">published GitHub state</strong>.
            After Base44 Publish, this file is live at the URL above.
            If the link returns 404, re-publish first.
          </div>
        </CardContent>
      </Card>

      {/* ── Index Status ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-slate-800">Canonical Index Status</CardTitle>
          <p className="text-xs text-slate-400">
            {bundle.generatedAt} · {bundle.totalFilesIndexed} files indexed (GovernanceHub canonical) ·{" "}
            {missingCount === 0
              ? <span className="text-green-600 font-medium">no critical files missing</span>
              : <span className="text-red-600 font-medium">{missingCount} critical file{missingCount !== 1 ? "s" : ""} missing</span>}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800">{CANONICAL.label}</p>
              <p className="text-xs text-slate-500 font-mono truncate">{CANONICAL.path}</p>
              <p className="text-xs text-green-700 mt-0.5">{CANONICAL.desc}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Copy All Raw URLs ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-slate-800">Kopier raw URLs</CardTitle>
          <p className="text-xs text-slate-400">Kopier alle raw-lenker for en kategori, eller alle på én gang</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <CopyAllButton urls={allCategoryUrls.priority}   label="Priority-filer" />
            <CopyAllButton urls={allCategoryUrls.governance} label="Governance" />
            <CopyAllButton urls={allCategoryUrls.admin}      label="Admin" />
            <CopyAllButton urls={allCategoryUrls.routing}    label="Routing" />
            <CopyAllButton urls={allCategoryUrls.bootstrap}  label="Bootstrap" />
          </div>
          <div className="mt-3">
            <CopyAllButton urls={allRawUrls} label={`Kopier alle (${allRawUrls.length} filer)`} />
          </div>
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
          <div className="mt-2">
            <CopyAllButton
              urls={READ_THIS_FIRST[activeFlow].map((i) => i.rawUrl)}
              label={`Kopier alle raw (${FLOW_LABELS[activeFlow]})`}
            />
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
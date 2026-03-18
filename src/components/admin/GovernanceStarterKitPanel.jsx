import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCheck, AlertTriangle, Github, Package, ChevronDown, ChevronUp, Loader2, Download, XCircle, ShieldCheck, Circle, FileCheck, FileQuestion } from "lucide-react";
import { useActiveRepo } from "@/components/ActiveRepoContext";
import { base44 } from "@/api/base44Client";
import InstallReadinessCheck from "@/components/admin/INSTALL_READINESS_CHECK";

// ── Shared vocabulary ──────────────────────────────────────────────────────────

const BUILD_INTENTS = [
  { value: "new-app",        label: "Ny app" },
  { value: "existing",       label: "Eksisterende prosjekt" },
  { value: "new-capability", label: "Ny capability" },
  { value: "scaffold",       label: "Struktur / scaffold" },
  { value: "governance",     label: "Governance-opprydding" },
];

// These are workflow steps, not file lists — kept as-is (not in manifest)
const FIRST_STEPS = {
  "new-app": [
    "1. Verify repo is registered in GovernanceHub Repository Manager",
    "2. Read existing folder structure before creating any files",
    "3. Initialize governance foundation: AI_STATE, LockedFiles, AI_PROJECT_INSTRUCTIONS",
    "4. Create initial PhaseExecutionLog bootstrap entry",
    "5. Seed AUDIT_INDEX with first audit scope",
    "6. Define IDEA_INDEX and run idea-priority-audit",
    "7. Build initial ROADMAP from scored idea data",
    "8. Set up admin orchestration surface (GovernanceOrchestratorPanel)",
  ],
  "existing": [
    "1. Read all governance files — verify current AI_STATE phase and status",
    "2. Check PhaseExecutionLog for last verified entry",
    "3. Review AUDIT_INDEX for open findings",
    "4. Check NextSafeStep — align work with recommended next action",
    "5. Run AuditRunner to get current state snapshot",
    "6. Proceed with one structural change at a time",
  ],
  "new-capability": [
    "1. Read existing capability structure and patterns",
    "2. Define scope in AUDIT_INDEX before implementation",
    "3. Implement minimally — one file at a time",
    "4. Verify implementation matches acceptance criteria",
    "5. Update PhaseExecutionLog with verified entry",
    "6. Update NextSafeStep to reflect next action",
  ],
  "scaffold": [
    "1. Read repo structure — understand what already exists",
    "2. Create governance folder structure first",
    "3. Initialize AI_STATE with project name and bootstrap phase",
    "4. Define LockedFiles registry",
    "5. Create AI_PROJECT_INSTRUCTIONS with governance rules",
    "6. Seed IDEA_INDEX and run scoring",
    "7. Build ROADMAP from scored data",
    "8. Create initial PhaseExecutionLog entry",
  ],
  "governance": [
    "1. Run AuditRunner — get current governance state snapshot",
    "2. Identify placeholder values — remove or replace",
    "3. Verify LockedFiles matches AI_PROJECT_INSTRUCTIONS",
    "4. Review AUDIT_INDEX for thin entries — enrich as needed",
    "5. Update PhaseExecutionLog with verified cleanup entry",
    "6. Set NextSafeStep to reflect post-cleanup state",
  ],
};

const GOVERNANCE_RULES = [
  "Read actual repository files before making or proposing changes. Do not guess file structure.",
  "Make minimal, additive changes only. Do not rewrite working code.",
  "Do not modify locked governance files (AI_STATE, LOCKED_FILES, PhaseExecutionLog, AI_PROJECT_INSTRUCTIONS) without explicit approval.",
  "Do not broaden scope beyond what is specified.",
  "Update PhaseExecutionLog only after verified changes — not as drafts.",
  "One structural change at a time.",
  "Verify the repository before and after structural work.",
];

const MANIFEST_URL =
  "https://raw.githubusercontent.com/Luckywolf82/governancehub/main/starter-kit/STARTER_KIT_MANIFEST.json";

const RAW_BASE = "https://raw.githubusercontent.com/Luckywolf82/governancehub/main/";

// ── Manifest hook ──────────────────────────────────────────────────────────────

function useManifest() {
  const [manifest, setManifest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(MANIFEST_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => { if (!cancelled) { setManifest(data); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  return { manifest, loading, error };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildRawUrl(manifest, filePath) {
  return `${RAW_BASE}${manifest.basePath}/${filePath}`;
}

function groupByModule(files) {
  return files.reduce((acc, f) => {
    (acc[f.module] ??= []).push(f);
    return acc;
  }, {});
}

function uniqueFolders(manifest) {
  const modules = [...new Set((manifest.files ?? []).map((f) => f.module))];
  return modules.map((m) => `src/components/${m}/`);
}

// ── Install prompt builder ─────────────────────────────────────────────────────

function buildInstallPrompt({ repo, manifest }) {
  const branch = repo.defaultBranch ?? "main";
  const date = new Date().toISOString().slice(0, 10);
  const folders = uniqueFolders(manifest);
  const fileLines = (manifest.files ?? []).map(
    (f) => `  - ${f.path}  →  src/components/${f.path}\n    Raw: ${buildRawUrl(manifest, f.path)}`
  );

  return [
    `# GovernanceHub Starter Kit — Install Prompt`,
    ``,
    `**Target repo:** \`${repo.owner}/${repo.repo}\` (branch: \`${branch}\`)`,
    `**Manifest version:** ${manifest.version} (${manifest.releaseDate})`,
    `**Total files:** ${manifest.files?.length ?? 0}`,
    ``,
    `---`,
    ``,
    `## Instructions`,
    ``,
    `1. **Read the target repository structure first.**`,
    `   List all files currently under \`src/components/\` before making any changes.`,
    ``,
    `2. **Create missing folders** under \`src/components/\` if they do not already exist:`,
    ...folders.map((f) => `   - \`${f}\``),
    ``,
    `3. **Copy each file** from the starter kit into the matching relative target path:`,
    ...fileLines,
    ``,
    `4. **Preserve existing files** — only replace files that contain placeholder values`,
    `   (e.g. \`null\`, \`"TODO"\`, \`"PLACEHOLDER"\`, or empty export stubs).`,
    `   Do not overwrite files that contain real project-specific content.`,
    ``,
    `5. **Verify installed files** after copying:`,
    `   - Confirm each required manifest file exists at its exact target path`,
    `   - Verify file names and casing match exactly (case-sensitive)`,
    `   - Verify copied files are not placeholder stubs (no \`null\`, \`"TODO"\`, or empty export bodies)`,
    `   - Verify locked files (AI_STATE, LockedFiles, PhaseExecutionLog, AI_PROJECT_INSTRUCTIONS) were not unintentionally overwritten`,
    ``,
    `6. **Only after installation is fully confirmed**, append a new entry to \`PhaseExecutionLog\``,
    `   matching this exact schema:`,
    ``,
    `\`\`\`js`,
    `{`,
    `  id: <next integer after last entry>,`,
    `  date: "${date}",`,
    `  taskRequested: "Install GovernanceHub Starter Kit",`,
    `  filesCreated: [ /* list manifest target files that were newly created */ ],`,
    `  filesModified: [ /* list manifest target files that were updated or merged */ ],`,
    `  diffSummary: "Installed GovernanceHub Starter Kit v${manifest.version} from starter manifest.",`,
    `  commitRef: null, // set to actual commit SHA if known`,
    `  githubVisibility: "verified", // only after file existence is confirmed in target repo`,
    `  lockedFileVerification: "confirmed unchanged" // or describe what happened if locked files were touched`,
    `}`,
    `\`\`\``,
    ``,
    `---`,
    ``,
    `## Governance rules (always apply)`,
    ...GOVERNANCE_RULES.map((r) => `- ${r}`),
    ``,
    `---`,
    `*Generated by GovernanceHub Starter Kit — ${date}*`,
  ].join("\n");
}

// ── CopyBtn ────────────────────────────────────────────────────────────────────

function CopyBtn({ value, label = "Kopier" }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      disabled={!value}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        copied ? "bg-green-100 text-green-700 border-green-300" : "border-slate-300 text-slate-600 hover:border-slate-500 hover:bg-slate-50"
      }`}
    >
      {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Kopiert!" : label}
    </button>
  );
}

// ── Section block ──────────────────────────────────────────────────────────────

function SectionCard({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <Card>
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen((v) => !v)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-slate-700">{title}</CardTitle>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </CardHeader>
      {open && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

// ── Install Preview hook ──────────────────────────────────────────────────────

function useInstallPreview(activeRepo, manifest) {
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!activeRepo || !manifest) {
      setPreview(null);
      return;
    }

    let cancelled = false;

    async function computePreview() {
      setPreviewLoading(true);
      const files = manifest.files ?? [];

      // Canonical governance files (from readiness check) for already_exists classification
      const canonicalPaths = [
        "src/components/governance/AI_STATE.jsx",
        "src/components/governance/PhaseExecutionLog.jsx",
        "src/components/governance/LockedFiles.jsx",
        "src/components/projects/WORKSTREAM_REGISTRY.jsx",
      ];

      // Check each manifest file's target existence
      const results = await Promise.all(
        files.map(async (f) => {
          const targetPath = `src/components/${f.path}`;
          try {
            const res = await base44.functions.invoke("getGithubRepoContents", {
              owner: activeRepo.owner,
              repo: activeRepo.repo,
              path: targetPath,
            });
            // File exists
            const isCanonical = canonicalPaths.includes(targetPath);
            return {
              path: f.path,
              targetPath,
              exists: res.data?.success === true,
              isCanonical,
              error: null,
            };
          } catch (e) {
            return {
              path: f.path,
              targetPath,
              exists: null,
              isCanonical: canonicalPaths.includes(targetPath),
              error: e.message ?? "request failed",
            };
          }
        })
      );

      if (cancelled) return;

      // Classify into groups
      const will_create = results.filter((r) => r.exists === false);
      const already_exists = results.filter((r) => r.exists === true && r.isCanonical);
      const requires_manual_review = results.filter(
        (r) => r.error !== null || (r.exists === true && !r.isCanonical)
      );

      setPreview({
        will_create,
        already_exists,
        requires_manual_review,
        total: files.length,
      });
      setPreviewLoading(false);
    }

    computePreview();
    return () => { cancelled = true; };
  }, [activeRepo, manifest]);

  return { preview, previewLoading };
}

export default function GovernanceStarterKitPanel() {
  const { activeRepo } = useActiveRepo();
  const [buildIntent, setBuildIntent] = useState("scaffold");
  const [notes, setNotes] = useState("");
  const [installReadiness, setInstallReadiness] = useState("idle");
  const { manifest, loading: manifestLoading, error: manifestError } = useManifest();
  const { preview, previewLoading } = useInstallPreview(activeRepo, manifest);

  const steps = FIRST_STEPS[buildIntent] ?? FIRST_STEPS["scaffold"];

  const grouped = useMemo(
    () => (manifest ? groupByModule(manifest.files ?? []) : {}),
    [manifest]
  );

  const folders = useMemo(
    () => (manifest ? uniqueFolders(manifest) : []),
    [manifest]
  );

  const installPrompt = useMemo(() => {
    if (!activeRepo || !manifest) return null;
    return buildInstallPrompt({ repo: activeRepo, manifest });
  }, [activeRepo, manifest]);

  // Legacy full-text export (markdown summary without file content)
  const exportText = useMemo(() => {
    if (!activeRepo || !manifest) return null;
    const intentLabel = BUILD_INTENTS.find((b) => b.value === buildIntent)?.label ?? buildIntent;
    const date = new Date().toISOString().slice(0, 10);
    return [
      `# GovernanceHub Starter Kit`,
      ``,
      `**Repository:** \`${activeRepo.owner}/${activeRepo.repo}\` (${activeRepo.provider ?? "github"}, branch: \`${activeRepo.defaultBranch ?? "main"}\`)`,
      `**Intent:** ${intentLabel}`,
      `**Manifest version:** ${manifest.version} (${manifest.releaseDate})`,
      `**Files:** ${manifest.files?.length ?? 0}`,
      notes?.trim() ? `**Mål:** ${notes.trim()}` : null,
      ``,
      `---`,
      ``,
      `## Mappestruktur fra manifest`,
      ...folders.map((f) => `- \`${f}\``),
      ``,
      `---`,
      ``,
      `## Starter kit-filer (${manifest.files?.length ?? 0} filer)`,
      ...Object.entries(grouped).flatMap(([mod, files]) => [
        ``,
        `### ${mod}`,
        ...files.map((f) => `- \`src/components/${f.path}\`\n  Raw: ${buildRawUrl(manifest, f.path)}`),
      ]),
      ``,
      `---`,
      ``,
      `## Anbefalte første steg`,
      ...steps,
      ``,
      `---`,
      ``,
      `## Governance-regler`,
      ...GOVERNANCE_RULES.map((r) => `- ${r}`),
      ``,
      `---`,
      `*Generert av GovernanceHub Starter Kit Generator — ${date}*`,
    ].filter((l) => l !== null).join("\n");
  }, [activeRepo, manifest, buildIntent, notes, folders, grouped, steps]);

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            Governance Starter Kit
          </h2>
          <p className="text-xs text-slate-500">Manifest-drevet — velg repo og kopier install-prompt. Ingen prosjekt-bootstrap kreves.</p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs">Direkte installasjon</Badge>
      </div>

      {/* Manifest status */}
      {manifestLoading && (
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          Laster manifest…
        </div>
      )}
      {manifestError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-700">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          Kunne ikke laste manifest: {manifestError}
        </div>
      )}
      {manifest && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-600">
          <span><span className="font-medium text-slate-700">Manifest:</span> v{manifest.version}</span>
          <span className="text-slate-400">·</span>
          <span>{manifest.releaseDate}</span>
          <span className="text-slate-400">·</span>
          <span>{manifest.files?.length ?? 0} filer</span>
          <span className="text-slate-400">·</span>
          <span className="font-mono text-slate-500">{manifest.basePath}</span>
        </div>
      )}

      {/* Repo context */}
      {activeRepo ? (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded px-3 py-2 text-xs text-emerald-800">
          <Github className="w-3.5 h-3.5 shrink-0" />
          <span><span className="font-medium">Repo:</span> <span className="font-mono">{activeRepo.owner}/{activeRepo.repo}</span></span>
          <span className="text-emerald-400">·</span>
          <span>{activeRepo.defaultBranch ?? "main"}</span>
        </div>
      ) : (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Velg aktivt repo i toppmenyen for å generere starter kit.</span>
        </div>
      )}

      {/* Form */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Byggeintensjon</label>
            <select
              value={buildIntent}
              onChange={(e) => setBuildIntent(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400"
            >
              {BUILD_INTENTS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Prosjektmål / notater <span className="font-normal text-slate-400">(valgfritt)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Beskriv kort prosjektet eller hva du vil oppnå..."
              className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Blocked state */}
      {(!activeRepo || !manifest) && !manifestLoading && (
        <div className="rounded border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-400 text-center">
          {!manifest ? "Manifest ikke tilgjengelig." : "Velg et aktivt repo for å generere eksport."}
        </div>
      )}

      {/* Output sections — only when both repo and manifest are ready */}
      {activeRepo && manifest && (
        <>
          {/* ── Install Readiness Check ── */}
          <InstallReadinessCheck onReadinessChange={setInstallReadiness} />

          {/* ── Install Status Banner ── */}
          {(() => {
            const statusMap = {
              safe_to_install: {
                bg: "bg-emerald-100 border-emerald-300",
                text: "text-emerald-800",
                icon: <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />,
                label: "Klar for installasjon",
                message: "Ingen eksisterende governance funnet — trygt å installere starter kit.",
              },
              existing_governance_detected: {
                bg: "bg-red-100 border-red-300",
                text: "text-red-800",
                icon: <XCircle className="w-4 h-4 text-red-600 shrink-0" />,
                label: "Installasjon blokkert",
                message: "Eksisterende governance funnet — installer ikke blindt. Gjør audit/merge først.",
              },
              partial_governance_detected: {
                bg: "bg-amber-100 border-amber-300",
                text: "text-amber-800",
                icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
                label: "Audit/merge påkrevd",
                message: "Delvis governance funnet — audit/merge kreves før installasjon.",
              },
              verification_failed: {
                bg: "bg-red-100 border-red-300",
                text: "text-red-800",
                icon: <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />,
                label: "Verifisering feilet",
                message: "Repo-verifisering feilet — bekreft tilgang før installasjon.",
              },
              repo_not_connected: {
                bg: "bg-slate-100 border-slate-300",
                text: "text-slate-700",
                icon: <AlertTriangle className="w-4 h-4 text-slate-600 shrink-0" />,
                label: "Repo kreves",
                message: "Velg et aktivt repo og kjør readiness-sjekk før installasjon.",
              },
              idle: {
                bg: "bg-slate-100 border-slate-300",
                text: "text-slate-600",
                icon: <Circle className="w-4 h-4 text-slate-400 shrink-0" />,
                label: "Sjekk gjenstår",
                message: "Kjør readiness-sjekk ovenfor for å godkjenne installasjon.",
              },
              checking: {
                bg: "bg-blue-100 border-blue-300",
                text: "text-blue-800",
                icon: <Loader2 className="w-4 h-4 text-blue-600 shrink-0 animate-spin" />,
                label: "Sjekker…",
                message: "Sjekker repo for eksisterende governance-filer…",
              },
            };
            const status = statusMap[installReadiness] || statusMap.idle;

            return (
              <div className={`border rounded px-4 py-3 flex items-start gap-3 ${status.bg}`}>
                {status.icon}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${status.text}`}>{status.label}</p>
                  <p className={`text-xs mt-0.5 ${status.text} opacity-90`}>{status.message}</p>
                </div>
              </div>
            );
          })()}

          {/* ── Install Preview (dry-run) ── */}
          {previewLoading && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded px-4 py-3 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              Analyserer installasjonsforutsetninger…
            </div>
          )}
          {!previewLoading && preview && (
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-700 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-slate-600" />
                  Installasjon Preview (dry-run)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {/* Summary row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="font-medium text-emerald-700">{preview.will_create.length}</span>
                    <span className="text-slate-500">vil bli opprettet</span>
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1.5">
                    <span className="font-medium text-red-700">{preview.already_exists.length}</span>
                    <span className="text-slate-500">eksisterer allerede</span>
                  </span>
                  {preview.requires_manual_review.length > 0 && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="flex items-center gap-1.5">
                        <span className="font-medium text-amber-700">{preview.requires_manual_review.length}</span>
                        <span className="text-slate-500">krever gjennomgang</span>
                      </span>
                    </>
                  )}
                </div>

                {/* Expandable sections */}
                {preview.will_create.length > 0 && (
                  <details className="pt-1 border-t border-slate-100">
                    <summary className="cursor-pointer text-xs font-medium text-emerald-700 hover:text-emerald-800">
                      ▶ Vil bli opprettet ({preview.will_create.length})
                    </summary>
                    <ul className="space-y-1 mt-2 pl-2">
                      {preview.will_create.map((f) => (
                        <li key={f.path} className="text-xs font-mono text-slate-600">src/components/{f.path}</li>
                      ))}
                    </ul>
                  </details>
                )}

                {preview.already_exists.length > 0 && (
                  <details className="pt-1 border-t border-slate-100">
                    <summary className="cursor-pointer text-xs font-medium text-red-700 hover:text-red-800">
                      ▶ Eksisterer allerede ({preview.already_exists.length})
                    </summary>
                    <ul className="space-y-1 mt-2 pl-2">
                      {preview.already_exists.map((f) => (
                        <li key={f.path} className="text-xs font-mono text-slate-600">src/components/{f.path}</li>
                      ))}
                    </ul>
                  </details>
                )}

                {preview.requires_manual_review.length > 0 && (
                  <details className="pt-1 border-t border-slate-100">
                    <summary className="cursor-pointer text-xs font-medium text-amber-700 hover:text-amber-800">
                      ▶ Krever gjennomgang ({preview.requires_manual_review.length})
                    </summary>
                    <ul className="space-y-1 mt-2 pl-2">
                      {preview.requires_manual_review.map((f) => (
                        <li key={f.path} className="flex items-center gap-1.5">
                          <FileQuestion className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="font-mono text-slate-600">src/components/{f.path}</span>
                          {f.error && <span className="text-xs text-amber-600">({f.error})</span>}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Install prompt — always available; readiness is advisory only ── */}
          {(() => {
            const isSafe = installReadiness === "safe_to_install";
            const isChecked = installReadiness !== "idle" && installReadiness !== "checking" && installReadiness !== "repo_not_connected";

            // Per-state advisory copy (shown as info, not blocking)
            const advisories = {
              existing_governance_detected: "Eksisterende governance oppdaget — vurder audit/merge før du overskriver.",
              partial_governance_detected:  "Delvis governance oppdaget — se over hvilke filer som allerede finnes.",
              verification_failed:          "Verifisering feilet — bekreft repo-tilgang om mulig.",
            };
            const advisoryText = advisories[installReadiness];

            return (
              <Card className={`${isSafe ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className={`text-sm flex items-center gap-1.5 ${isSafe ? "text-emerald-800" : "text-slate-700"}`}>
                      <Download className="w-4 h-4" />
                      Kopier install-prompt
                    </CardTitle>
                    <CopyBtn
                      value={installPrompt}
                      label="Kopier install-prompt"
                    />
                  </div>
                  {isSafe && (
                    <p className="text-xs text-emerald-700 mt-1">
                      Starter kit er klar for installasjon i <span className="font-mono font-medium">{activeRepo.owner}/{activeRepo.repo}</span>.
                    </p>
                  )}
                  {!isChecked && (
                    <p className="text-xs text-slate-500 mt-1">
                      Install-prompten er klar. Kjør readiness-sjekken ovenfor for å se status — dette er veiledende, ikke et krav.
                    </p>
                  )}
                  {isChecked && advisoryText && (
                    <p className="text-xs text-amber-700 mt-1 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                      <span><span className="font-medium">Merknad:</span> {advisoryText}</span>
                    </p>
                  )}
                </CardHeader>
              </Card>
            );
          })()}

          {/* Folders from manifest */}
          <SectionCard title={`Mappestruktur (${folders.length} mapper)`}>
            <ul className="space-y-1">
              {folders.map((f) => (
                <li key={f} className="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-100 rounded px-2 py-1">{f}</li>
              ))}
            </ul>
          </SectionCard>

          {/* Files grouped by module — from manifest */}
          {Object.entries(grouped).map(([mod, files]) => (
            <SectionCard key={mod} title={`${mod} (${files.length} filer)`}>
              <ul className="space-y-2">
                {files.map((f) => (
                  <li key={f.path} className="text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-slate-800">src/components/{f.path}</span>
                      {f.required && <Badge variant="outline" className="text-[10px] shrink-0">required</Badge>}
                    </div>
                    <a
                      href={buildRawUrl(manifest, f.path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-slate-400 hover:text-slate-600 mt-0.5 ml-1 truncate"
                    >
                      {buildRawUrl(manifest, f.path)}
                    </a>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ))}

          {/* First steps (workflow, not file-driven) */}
          <SectionCard title="Anbefalte første steg">
            <ol className="space-y-1">
              {steps.map((s, i) => (
                <li key={i} className="text-xs text-slate-700">{s}</li>
              ))}
            </ol>
          </SectionCard>

          {/* Governance rules */}
          <SectionCard title="Governance-regler">
            <ul className="space-y-1">
              {GOVERNANCE_RULES.map((r, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Full export */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm text-slate-700">Komplett eksport</CardTitle>
                <div className="flex gap-2">
                  <CopyBtn value={exportText} label="Kopier full pakke" />
                  <CopyBtn
                    value={JSON.stringify({
                      repo: `${activeRepo.owner}/${activeRepo.repo}`,
                      intent: buildIntent,
                      notes,
                      manifestVersion: manifest.version,
                      basePath: manifest.basePath,
                      files: (manifest.files ?? []).map((f) => ({
                        path: `src/components/${f.path}`,
                        rawUrl: buildRawUrl(manifest, f.path),
                        module: f.module,
                        required: f.required,
                      })),
                    }, null, 2)}
                    label="Kopier JSON"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <pre className="text-xs font-mono bg-slate-50 border border-slate-100 rounded p-3 whitespace-pre-wrap text-slate-700 max-h-72 overflow-y-auto leading-relaxed">
                {exportText}
              </pre>
            </CardContent>
          </Card>
        </>
      )}

    </div>
  );
}
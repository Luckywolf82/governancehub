import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCheck, AlertTriangle, Github, Package, ChevronDown, ChevronUp } from "lucide-react";
import { useActiveRepo } from "@/components/ActiveRepoContext";

// ── Shared vocabulary (aligned with StartPromptGeneratorPanel) ─────────────────

const BUILD_INTENTS = [
  { value: "new-app",        label: "Ny app" },
  { value: "existing",       label: "Eksisterende prosjekt" },
  { value: "new-capability", label: "Ny capability" },
  { value: "scaffold",       label: "Struktur / scaffold" },
  { value: "governance",     label: "Governance-opprydding" },
];

// ── Starter kit data ───────────────────────────────────────────────────────────

const FOLDER_STRUCTURE = {
  "new-app": [
    "src/pages/",
    "src/components/",
    "src/components/governance/",
    "src/components/audits/",
    "src/components/admin/",
    "src/components/projects/",
    "src/components/roadmap/",
    "src/components/ideas/",
    "entities/",
    "functions/",
  ],
  "existing": [
    "src/components/governance/",
    "src/components/audits/",
    "src/components/admin/",
    "src/components/roadmap/",
    "src/components/ideas/",
  ],
  "new-capability": [
    "src/components/<capability-name>/",
    "src/components/audits/",
    "src/components/governance/",
  ],
  "scaffold": [
    "src/components/governance/",
    "src/components/audits/",
    "src/components/admin/",
    "src/components/roadmap/",
    "src/components/ideas/",
    "src/components/projects/",
  ],
  "governance": [
    "src/components/governance/",
    "src/components/audits/",
  ],
};

const GOVERNANCE_FILES = {
  "new-app": [
    { path: "src/components/governance/AI_STATE.jsx",               desc: "Current project state — phase, status, lastVerified" },
    { path: "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx", desc: "Governance rules and agent operating instructions" },
    { path: "src/components/governance/LockedFiles.jsx",             desc: "Locked file registry with per-file modification rules" },
    { path: "src/components/governance/PhaseExecutionLog.jsx",       desc: "Verified change history — append-only" },
    { path: "src/components/governance/NextSafeStep.jsx",            desc: "Current recommended next action" },
    { path: "src/components/audits/AUDIT_INDEX.jsx",                 desc: "Central audit registry" },
    { path: "src/components/audits/AUDIT_SYSTEM_GUIDE.jsx",          desc: "Audit lifecycle and evidence rules" },
    { path: "src/components/roadmap/ROADMAP.jsx",                    desc: "Derived roadmap from scored ideas" },
    { path: "src/components/ideas/IDEA_INDEX.jsx",                   desc: "Idea bank for capability prioritization" },
  ],
  "existing": [
    { path: "src/components/governance/AI_STATE.jsx",               desc: "Verify and update project state" },
    { path: "src/components/governance/PhaseExecutionLog.jsx",       desc: "Append new verified entry after changes" },
    { path: "src/components/governance/NextSafeStep.jsx",            desc: "Update to reflect current recommended step" },
    { path: "src/components/audits/AUDIT_INDEX.jsx",                 desc: "Enrich or add audit entries as needed" },
  ],
  "new-capability": [
    { path: "src/components/audits/AUDIT_INDEX.jsx",                 desc: "Add audit entry for new capability scope" },
    { path: "src/components/governance/PhaseExecutionLog.jsx",       desc: "Append entry after capability is verified" },
    { path: "src/components/governance/AI_STATE.jsx",                desc: "Update phase/status after implementation" },
  ],
  "scaffold": [
    { path: "src/components/governance/AI_STATE.jsx",               desc: "Initialize with project name and phase" },
    { path: "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx", desc: "Set governance operating rules" },
    { path: "src/components/governance/LockedFiles.jsx",             desc: "Define locked files before work begins" },
    { path: "src/components/governance/PhaseExecutionLog.jsx",       desc: "Create initial bootstrap entry" },
    { path: "src/components/governance/NextSafeStep.jsx",            desc: "Define first safe step" },
    { path: "src/components/audits/AUDIT_INDEX.jsx",                 desc: "Seed with initial audit scope" },
    { path: "src/components/roadmap/ROADMAP.jsx",                    desc: "Build initial roadmap from idea index" },
    { path: "src/components/ideas/IDEA_INDEX.jsx",                   desc: "Seed with initial idea bank" },
  ],
  "governance": [
    { path: "src/components/governance/AI_STATE.jsx",               desc: "Verify all values — remove placeholders" },
    { path: "src/components/governance/LockedFiles.jsx",             desc: "Verify locked file list is complete and consistent" },
    { path: "src/components/governance/AI_PROJECT_INSTRUCTIONS.jsx", desc: "Verify instructions match LockedFiles registry" },
    { path: "src/components/governance/PhaseExecutionLog.jsx",       desc: "Verify last entry reflects actual state" },
    { path: "src/components/audits/AUDIT_INDEX.jsx",                 desc: "Verify all entries are complete — no placeholder fields" },
  ],
};

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

// ── Kit builder ────────────────────────────────────────────────────────────────

function buildStarterKit({ repo, buildIntent, notes }) {
  const intentLabel = BUILD_INTENTS.find((b) => b.value === buildIntent)?.label ?? buildIntent;
  const folders = FOLDER_STRUCTURE[buildIntent] ?? FOLDER_STRUCTURE["scaffold"];
  const govFiles = GOVERNANCE_FILES[buildIntent] ?? GOVERNANCE_FILES["scaffold"];
  const steps = FIRST_STEPS[buildIntent] ?? FIRST_STEPS["scaffold"];
  const date = new Date().toISOString().slice(0, 10);

  const lines = [
    `# GovernanceHub Starter Kit`,
    ``,
    `**Repository:** \`${repo.owner}/${repo.repo}\` (${repo.provider ?? "github"}, branch: \`${repo.defaultBranch ?? "main"}\`)`,
    `**Intent:** ${intentLabel}`,
    `**Generated:** ${date}`,
    notes?.trim() ? `**Mål:** ${notes.trim()}` : null,
    ``,
    `---`,
    ``,
    `## Anbefalt mappestruktur`,
    ...folders.map((f) => `- \`${f}\``),
    ``,
    `---`,
    ``,
    `## Governance-filer som bør finnes`,
    ...govFiles.map((f) => `- \`${f.path}\`\n  → ${f.desc}`),
    ``,
    `---`,
    ``,
    `## Anbefalte første steg`,
    ...steps.map((s) => s),
    ``,
    `---`,
    ``,
    `## Governance-regler (følges alltid)`,
    ...GOVERNANCE_RULES.map((r) => `- ${r}`),
    ``,
    `---`,
    ``,
    `## Repo-capabilities`,
    ...Object.entries(repo.capabilitiesJson ?? {}).map(([cap, enabled]) => `- ${enabled ? "✓" : "✗"} \`${cap}\``),
    ``,
    `---`,
    `*Generert av GovernanceHub Starter Kit Generator — ${date}*`,
  ].filter((l) => l !== null).join("\n");

  return { text: lines, folders, govFiles, steps };
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

export default function GovernanceStarterKitPanel() {
  const { activeRepo } = useActiveRepo();
  const [buildIntent, setBuildIntent] = useState("scaffold");
  const [notes, setNotes] = useState("");

  const kit = useMemo(() => {
    if (!activeRepo) return null;
    return buildStarterKit({ repo: activeRepo, buildIntent, notes });
  }, [activeRepo, buildIntent, notes]);

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            Governance Starter Kit
          </h2>
          <p className="text-xs text-slate-500">Generer eksporterbar governance-pakke for valgt repository</p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs">Generering kun</Badge>
      </div>

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

      {/* No-repo blocked state */}
      {!activeRepo && (
        <div className="rounded border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-400 text-center">
          Eksport og forhåndsvisning er ikke tilgjengelig — velg et aktivt repo først.
        </div>
      )}

      {/* Output sections */}
      {kit && (
        <>
          <SectionCard title="Anbefalt mappestruktur">
            <ul className="space-y-1">
              {kit.folders.map((f) => (
                <li key={f} className="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-100 rounded px-2 py-1">{f}</li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Governance-filer som bør finnes">
            <ul className="space-y-2">
              {kit.govFiles.map((f) => (
                <li key={f.path} className="text-xs">
                  <span className="font-mono text-slate-800">{f.path}</span>
                  <span className="block text-slate-500 mt-0.5 ml-1">→ {f.desc}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Anbefalte første steg">
            <ol className="space-y-1">
              {kit.steps.map((s, i) => (
                <li key={i} className="text-xs text-slate-700">{s}</li>
              ))}
            </ol>
          </SectionCard>

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
                  <CopyBtn value={kit.text} label="Kopier full pakke" />
                  <CopyBtn value={JSON.stringify({ repo: `${activeRepo.owner}/${activeRepo.repo}`, intent: buildIntent, notes, folders: kit.folders, governanceFiles: kit.govFiles.map(f => f.path), firstSteps: kit.steps }, null, 2)} label="Kopier JSON" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <pre className="text-xs font-mono bg-slate-50 border border-slate-100 rounded p-3 whitespace-pre-wrap text-slate-700 max-h-72 overflow-y-auto leading-relaxed">
                {kit.text}
              </pre>
            </CardContent>
          </Card>
        </>
      )}

    </div>
  );
}
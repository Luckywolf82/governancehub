import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCheck, AlertTriangle, Github, Rocket, Info, CheckCircle2, Loader2 } from "lucide-react";
import { useActiveRepo } from "@/components/ActiveRepoContext";
import { useQueryClient } from "@tanstack/react-query";

// ── Vocabulary (aligned with StartPromptGeneratorPanel / GovernanceStarterKitPanel) ──

const BUILD_INTENTS = [
  { value: "new-app",        label: "Ny app" },
  { value: "existing",       label: "Eksisterende prosjekt" },
  { value: "new-capability", label: "Ny capability" },
  { value: "scaffold",       label: "Struktur / scaffold" },
  { value: "governance",     label: "Governance-opprydding" },
];

const BOOTSTRAP_MODES = [
  { value: "create", label: "Opprett nytt prosjekt" },
  { value: "link",   label: "Koble til eksisterende prosjekt" },
];

// ── Slug helper ────────────────────────────────────────────────────────────────

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Bootstrap steps per intent ─────────────────────────────────────────────────

const NEXT_STEPS = {
  "new-app": [
    "Register project in PROJECT_REGISTRY with generated id and metadata",
    "Verify repo is registered in Repository Manager and isEnabled=true",
    "Initialize governance foundation: AI_STATE, LockedFiles, AI_PROJECT_INSTRUCTIONS",
    "Create initial PhaseExecutionLog bootstrap entry",
    "Seed AUDIT_INDEX with first audit scope",
    "Define IDEA_INDEX and run idea-priority-audit",
    "Set NextSafeStep to reflect first implementation target",
  ],
  "existing": [
    "Locate matching entry in PROJECT_REGISTRY and verify metadata is current",
    "Link repo fullName reference to project entry",
    "Read AI_STATE — verify phase and status match actual project state",
    "Review PhaseExecutionLog for last verified entry",
    "Run AuditRunner to get current governance snapshot",
    "Update NextSafeStep based on audit findings",
  ],
  "new-capability": [
    "Register capability as a new project entry or sub-scope in PROJECT_REGISTRY",
    "Add audit entry in AUDIT_INDEX scoped to this capability",
    "Implement minimally — one file at a time",
    "Verify against acceptance criteria before marking done",
    "Append verified entry to PhaseExecutionLog",
    "Update NextSafeStep",
  ],
  "scaffold": [
    "Register project in PROJECT_REGISTRY with status: planned",
    "Create governance folder structure",
    "Initialize AI_STATE with project name and bootstrap phase",
    "Define LockedFiles registry",
    "Create AI_PROJECT_INSTRUCTIONS with governance rules",
    "Seed IDEA_INDEX and run scoring",
    "Build initial ROADMAP from scored data",
  ],
  "governance": [
    "Locate or create project entry in PROJECT_REGISTRY",
    "Run AuditRunner — get current governance snapshot",
    "Identify and remove placeholder values in governance files",
    "Verify LockedFiles matches AI_PROJECT_INSTRUCTIONS",
    "Update PhaseExecutionLog with verified cleanup entry",
    "Set NextSafeStep to reflect post-cleanup state",
  ],
};

// ── Bootstrap package builder ──────────────────────────────────────────────────

function buildBootstrapPackage({ repo, bootstrapMode, buildIntent, projectName, notes }) {
  const intentLabel = BUILD_INTENTS.find((b) => b.value === buildIntent)?.label ?? buildIntent;
  const modeLabel   = BOOTSTRAP_MODES.find((m) => m.value === bootstrapMode)?.label ?? bootstrapMode;
  const slug        = projectName?.trim() ? toSlug(projectName.trim()) : toSlug(`${repo.repo}-${buildIntent}`);
  const nextId      = `proj-${Date.now().toString().slice(-6)}`;
  const steps       = NEXT_STEPS[buildIntent] ?? NEXT_STEPS["scaffold"];
  const date        = new Date().toISOString().slice(0, 10);

  const registryEntry = bootstrapMode === "create" ? {
    id:          nextId,
    name:        projectName?.trim() || `${repo.repo} — ${intentLabel}`,
    description: notes?.trim() || `Bootstrapped from ${repo.owner}/${repo.repo} (${intentLabel})`,
    status:      "planned",
    phase:       "Bootstrap",
    owner:       repo.owner,
    repoFullName: repo.fullName ?? `${repo.owner}/${repo.repo}`,
    intent:      buildIntent,
    createdDate: date,
  } : null;

  const textLines = [
    `# GovernanceHub Project Bootstrap`,
    ``,
    `**Modus:** ${modeLabel}`,
    `**Repository:** \`${repo.owner}/${repo.repo}\` (branch: \`${repo.defaultBranch ?? "main"}\`)`,
    `**Byggeintensjon:** ${intentLabel}`,
    `**Dato:** ${date}`,
    notes?.trim() ? `**Notater:** ${notes.trim()}` : null,
    ``,
    `---`,
    ``,
    `## Bootstrap-sammendrag`,
    bootstrapMode === "create" ? [
      `- **Prosjektnavn:** ${registryEntry.name}`,
      `- **Foreslått slug:** \`${slug}\``,
      `- **Foreslått ID:** \`${nextId}\``,
      `- **Status:** planned`,
      `- **Fase:** Bootstrap`,
      `- **Repo-referanse:** \`${registryEntry.repoFullName}\``,
    ].join("\n") : [
      `- Koble aktivt repo \`${repo.owner}/${repo.repo}\` til eksisterende prosjektoppføring`,
      `- Oppdater prosjektmetadata med \`repoFullName: "${repo.fullName ?? `${repo.owner}/${repo.repo}`}"\``,
      `- Verifiser at prosjektstatus og fase er korrekt`,
    ].join("\n"),
    ``,
    `---`,
    ``,
    `## Anbefalte neste steg`,
    ...steps.map((s) => `- ${s}`),
    ``,
    `---`,
    ``,
    `## Governance-regler (følges alltid)`,
    `- Les faktiske repository-filer før du gjør eller foreslår endringer.`,
    `- Gjør minimale, additive endringer. Ikke omskriv fungerende kode.`,
    `- Ikke modifiser låste governance-filer uten eksplisitt godkjenning.`,
    `- Én strukturell endring om gangen.`,
    `- Verifiser repo før og etter strukturelle endringer.`,
    ``,
    `---`,
    `⚠️  BOOTSTRAP-UTKAST — Ikke persistert. Legg til oppføringen manuelt i PROJECT_REGISTRY.jsx for å registrere prosjektet.`,
    ``,
    `*Generert av GovernanceHub Project Bootstrap — ${date}*`,
  ].filter((l) => l !== null).join("\n");

  const jsonPackage = {
    bootstrapMode,
    buildIntent,
    repo: repo.fullName ?? `${repo.owner}/${repo.repo}`,
    branch: repo.defaultBranch ?? "main",
    ...(bootstrapMode === "create" ? { proposedEntry: registryEntry } : {
      linkInstruction: {
        repoFullName: repo.fullName ?? `${repo.owner}/${repo.repo}`,
        action: "add repoFullName field to matching PROJECT_REGISTRY entry",
      }
    }),
    nextSteps: steps,
    generatedDate: date,
    persistenceStatus: "draft — not persisted",
  };

  return { text: textLines, jsonPackage, registryEntry, slug, nextId };
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

// ── Main component ─────────────────────────────────────────────────────────────

export default function ProjectBootstrapPanel() {
  const { activeRepo } = useActiveRepo();
  const queryClient   = useQueryClient();
  const [bootstrapMode, setBootstrapMode] = useState("create");
  const [buildIntent, setBuildIntent]     = useState("new-app");
  const [projectName, setProjectName]     = useState("");
  const [notes, setNotes]                 = useState("");
  const [saving, setSaving]               = useState(false);
  const [savedProject, setSavedProject]   = useState(null);

  const pkg = useMemo(() => {
    if (!activeRepo) return null;
    if (bootstrapMode === "create" && !projectName.trim()) return null;
    return buildBootstrapPackage({ repo: activeRepo, bootstrapMode, buildIntent, projectName, notes });
  }, [activeRepo, bootstrapMode, buildIntent, projectName, notes]);

  const needsName = bootstrapMode === "create";
  const canGenerate = activeRepo && (bootstrapMode === "link" || projectName.trim());

  async function handleCreate() {
    if (!activeRepo || !projectName.trim()) return;
    setSaving(true);
    const record = await base44.entities.Project.create({
      name:         projectName.trim(),
      projectSlug:  toSlug(projectName.trim()),
      description:  notes.trim() || `Bootstrapped from ${activeRepo.owner}/${activeRepo.repo}`,
      status:       "planned",
      phase:        "Bootstrap",
      owner:        activeRepo.owner,
      repoFullName: activeRepo.fullName ?? `${activeRepo.owner}/${activeRepo.repo}`,
      buildIntent,
      notes:        notes.trim() || null,
    });
    setSavedProject(record);
    setSaving(false);
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Rocket className="w-4 h-4 text-violet-600" />
            Project Bootstrap
          </h2>
          <p className="text-xs text-slate-500">Generer bootstrap-pakke for nytt eller eksisterende prosjekt</p>
        </div>
        <Badge className={`text-xs border ${bootstrapMode === "create" ? "bg-violet-100 text-violet-700 border-violet-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
          {bootstrapMode === "create" ? "Kan persisteres" : "Forhåndsvisning kun"}
        </Badge>
      </div>

      {/* Repo context */}
      {activeRepo ? (
        <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded px-3 py-2 text-xs text-violet-800">
          <Github className="w-3.5 h-3.5 shrink-0" />
          <span><span className="font-medium">Repo:</span> <span className="font-mono">{activeRepo.owner}/{activeRepo.repo}</span></span>
          <span className="text-violet-400">·</span>
          <span>{activeRepo.defaultBranch ?? "main"}</span>
        </div>
      ) : (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Velg aktivt repo i toppmenyen for å generere bootstrap-pakke.</span>
        </div>
      )}

      {/* Persistence notice — context-aware */}
      {bootstrapMode === "create" ? (
        <div className="flex items-start gap-2 bg-violet-50 border border-violet-200 rounded px-3 py-2 text-xs text-violet-700">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            <span className="font-medium">Opprett-modus.</span>{" "}
            Fyller du inn navn og klikker «Opprett prosjekt» lagres prosjektet direkte i Project-databasen og vises på Projects-siden.
          </span>
        </div>
      ) : (
        <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-500">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
          <span>
            <span className="font-medium text-slate-600">Kobling — forhåndsvisning kun.</span>{" "}
            Å koble til eksisterende prosjekt krever at du velger et prosjekt fra listen. Dette støttes ikke i v1 — pakken er et utkast til manuell bruk.
          </span>
        </div>
      )}

      {/* Form */}
      <Card>
        <CardContent className="pt-4 space-y-3">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Bootstrap-modus</label>
              <select
                value={bootstrapMode}
                onChange={(e) => setBootstrapMode(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400"
              >
                {BOOTSTRAP_MODES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

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
          </div>

          {needsName && (
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Prosjektnavn <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="f.eks. TankRadar, Compliance Dashboard..."
                className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400"
              />
              {projectName.trim() && (
                <p className="text-xs text-slate-400 mt-1">Slug: <span className="font-mono">{toSlug(projectName.trim())}</span></p>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Notater <span className="font-normal text-slate-400">(valgfritt)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Kort beskrivelse av prosjektet eller formålet..."
              className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400 resize-none"
            />
          </div>

          {needsName && !projectName.trim() && activeRepo && (
            <p className="text-xs text-amber-600">Fyll inn prosjektnavn for å generere bootstrap-pakke.</p>
          )}

          {/* Create button — only in create mode */}
          {bootstrapMode === "create" && activeRepo && projectName.trim() && !savedProject && (
            <button
              onClick={handleCreate}
              disabled={saving}
              className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
              {saving ? "Oppretter..." : "Opprett prosjekt"}
            </button>
          )}

          {/* Success state */}
          {savedProject && (
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded px-3 py-2 text-xs text-green-800">
              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-600" />
              <span>
                <span className="font-medium">Prosjekt opprettet.</span>{" "}
                <span className="font-mono">{savedProject.name}</span> er nå lagret og vises på Projects-siden.
              </span>
            </div>
          )}

        </CardContent>
      </Card>

      {/* No-repo blocked state */}
      {!activeRepo && (
        <div className="rounded border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-400 text-center">
          Bootstrap-forhåndsvisning er ikke tilgjengelig — velg et aktivt repo først.
        </div>
      )}

      {/* Output */}
      {pkg && (
        <>
          {/* Summary */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm text-slate-700">Bootstrap-sammendrag</CardTitle>
                <div className="flex gap-2">
                  <CopyBtn value={pkg.text} label="Kopier sammendrag" />
                  <CopyBtn value={JSON.stringify(pkg.jsonPackage, null, 2)} label="Kopier JSON" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">

              {/* Proposed registry entry */}
              {pkg.registryEntry && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-600">Foreslått PROJECT_REGISTRY-oppføring:</p>
                  <pre className="text-xs font-mono bg-slate-50 border border-slate-100 rounded p-3 whitespace-pre-wrap text-slate-700 leading-relaxed">
{`{
  id:          "${pkg.registryEntry.id}",
  name:        "${pkg.registryEntry.name}",
  description: "${pkg.registryEntry.description}",
  status:      "planned",
  phase:       "Bootstrap",
  owner:       "${pkg.registryEntry.owner}",
  repoFullName: "${pkg.registryEntry.repoFullName}",
}`}
                  </pre>
                  <CopyBtn
                    label="Kopier oppføring"
                    value={`  {\n    id: "${pkg.registryEntry.id}",\n    name: "${pkg.registryEntry.name}",\n    description: "${pkg.registryEntry.description}",\n    status: "planned",\n    phase: "Bootstrap",\n    owner: "${pkg.registryEntry.owner}",\n    repoFullName: "${pkg.registryEntry.repoFullName}",\n  },`}
                  />
                </div>
              )}

              {/* Next steps */}
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">Anbefalte neste steg:</p>
                <ol className="space-y-1">
                  {(NEXT_STEPS[buildIntent] ?? []).map((s, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <span className="text-violet-400 shrink-0 mt-0.5">{i + 1}.</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>

            </CardContent>
          </Card>

          {/* Full text preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-700">Komplett bootstrap-tekst</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <pre className="text-xs font-mono bg-slate-50 border border-slate-100 rounded p-3 whitespace-pre-wrap text-slate-700 max-h-72 overflow-y-auto leading-relaxed">
                {pkg.text}
              </pre>
            </CardContent>
          </Card>
        </>
      )}

    </div>
  );
}
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCheck, AlertTriangle, Zap, Github } from "lucide-react";
import { useActiveRepo } from "@/components/ActiveRepoContext";

// ── Options ────────────────────────────────────────────────────────────────────

const BUILD_INTENTS = [
  { value: "new-app",        label: "Ny app" },
  { value: "existing",       label: "Eksisterende prosjekt" },
  { value: "new-capability", label: "Ny capability" },
  { value: "scaffold",       label: "Struktur / scaffold" },
  { value: "governance",     label: "Governance-opprydding" },
];

const OUTPUT_TARGETS = [
  { value: "base44",    label: "Base44" },
  { value: "copilot",   label: "Copilot" },
  { value: "issue",     label: "GitHub Issue" },
  { value: "clipboard", label: "Kopierbar prompt" },
];

// ── Prompt builder ─────────────────────────────────────────────────────────────

function buildPrompt({ repo, buildIntent, outputTarget, freeText }) {
  const intentLabel = BUILD_INTENTS.find((b) => b.value === buildIntent)?.label ?? buildIntent;
  const targetLabel = OUTPUT_TARGETS.find((t) => t.value === outputTarget)?.label ?? outputTarget;

  const targetInstruction = {
    base44:    "Output skal brukes som en Base44-instruksjon. Hold deg til app-strukturen i Base44 (pages/, components/, entities/, functions/). Bruk find_replace for eksisterende filer. Ikke gjett på filstruktur — les faktiske filer først.",
    copilot:   "Output skal brukes som en GitHub Copilot-oppgave. Skriv en tydelig, avgrenset task med akseptansekriterier og berørte filer. Ikke anta filstruktur — les faktiske repo-filer fra GitHub-kilden før endringer foreslås.",
    issue:     "Output skal brukes som et GitHub Issue. Bruk standard issue-format med Problem, Løsning, Akseptansekriterier og Berørte filer. Ikke ta for gitt at noe er klart for implementering uten bekreftelse.",
    clipboard: "Output er en frittstående kopierbar prompt. Gjør den selvforklarende og tydelig avgrenset i scope.",
  }[outputTarget] ?? "Tilpass output til målformatet.";

  const intentContext = {
    "new-app":        "Du hjelper med å starte en helt ny app i dette repoet. Start med å forstå eksisterende mappestruktur og konfigurasjon.",
    "existing":       "Du jobber videre på et eksisterende prosjekt. Les faktiske filer før du foreslår endringer — ikke gjett på hva som finnes.",
    "new-capability": "Du legger til en ny capability/funksjon i et eksisterende prosjekt. Respekter eksisterende mønstre og filstruktur.",
    "scaffold":       "Du setter opp struktur eller scaffold for et nytt lag i prosjektet. Hold deg til minsteprinsipper — legg til kun det som er nødvendig.",
    "governance":     "Du gjennomfører en governance-opprydding. Les og verifiser faktiske filer. Ikke gjør endringer basert på antagelser. Følg locked-file policy.",
  }[buildIntent] ?? "Arbeidstype: " + intentLabel;

  const lines = [
    `# GovernanceHub Start Prompt`,
    ``,
    `## Kontekst`,
    `- **Repository:** \`${repo.owner}/${repo.repo}\` (branch: \`${repo.defaultBranch ?? "main"}\`)`,
    `- **Byggeintensjon:** ${intentLabel}`,
    `- **Output-mål:** ${targetLabel}`,
    freeText?.trim() ? `- **Mål:** ${freeText.trim()}` : null,
    ``,
    `## Arbeidsinstruksjon`,
    intentContext,
    ``,
    targetInstruction,
    ``,
    `## Governance-regler (følges alltid)`,
    `- Les faktiske repository-filer før du gjør eller foreslår endringer. Ikke gjett på filstruktur.`,
    `- Gjør minimale, additive endringer. Unngå å omskrive fungerende kode.`,
    `- Ikke modifiser låste governance-filer (AI_STATE, LOCKED_FILES, PhaseExecutionLog, AI_PROJECT_INSTRUCTIONS) uten eksplisitt godkjenning.`,
    `- Ikke bredde scope utover det som er spesifisert.`,
    `- Oppdater PhaseExecutionLog etter verifiserte endringer — ikke som utkast.`,
    `- Én strukturell endring om gangen.`,
    ``,
    `## Capabilities for dette repoet`,
    ...Object.entries(repo.capabilitiesJson ?? {})
      .map(([cap, enabled]) => `- ${enabled ? "✓" : "✗"} \`${cap}\``),
    ``,
    `---`,
    `*Generert av GovernanceHub Start Prompt Generator — ${new Date().toISOString().slice(0, 10)}*`,
  ].filter((l) => l !== null).join("\n");

  return lines;
}

// ── CopyBtn ────────────────────────────────────────────────────────────────────

function CopyBtn({ value }) {
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
      {copied ? "Kopiert!" : "Kopier prompt"}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function StartPromptGeneratorPanel() {
  const { activeRepo } = useActiveRepo();
  const [buildIntent, setBuildIntent] = useState("new-capability");
  const [outputTarget, setOutputTarget] = useState("base44");
  const [freeText, setFreeText] = useState("");

  const generatedPrompt = useMemo(() => {
    if (!activeRepo) return null;
    return buildPrompt({ repo: activeRepo, buildIntent, outputTarget, freeText });
  }, [activeRepo, buildIntent, outputTarget, freeText]);

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            Start Prompt Generator
          </h2>
          <p className="text-xs text-slate-500">Generer en governance-bevisst startprompt for valgt repository</p>
        </div>
        <Badge className="bg-blue-100 text-blue-700 border border-blue-200 text-xs">Generering kun</Badge>
      </div>

      {/* Repo context */}
      {activeRepo ? (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs text-blue-800">
          <Github className="w-3.5 h-3.5 shrink-0" />
          <span><span className="font-medium">Repo:</span> <span className="font-mono">{activeRepo.owner}/{activeRepo.repo}</span></span>
          <span className="text-blue-500">·</span>
          <span className="text-blue-600">{activeRepo.defaultBranch ?? "main"}</span>
        </div>
      ) : (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Velg aktivt repo i toppmenyen for å generere startprompt.</span>
        </div>
      )}

      {/* Form */}
      <Card>
        <CardContent className="pt-4 space-y-3">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="text-xs font-medium text-slate-600 block mb-1">Output-mål</label>
              <select
                value={outputTarget}
                onChange={(e) => setOutputTarget(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400"
              >
                {OUTPUT_TARGETS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Hva vil du bygge eller oppnå? <span className="font-normal text-slate-400">(valgfritt)</span>
            </label>
            <textarea
              rows={2}
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="Beskriv kort hva du ønsker å gjøre..."
              className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400 resize-none"
            />
          </div>

        </CardContent>
      </Card>

      {/* Output */}
      {generatedPrompt ? (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm text-slate-700">Generert startprompt</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  Klar for: <span className="font-medium text-slate-600">{OUTPUT_TARGETS.find(t => t.value === outputTarget)?.label}</span>
                </span>
                <CopyBtn value={generatedPrompt} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <pre className="text-xs font-mono bg-slate-50 border border-slate-100 rounded p-3 whitespace-pre-wrap text-slate-700 max-h-80 overflow-y-auto leading-relaxed">
              {generatedPrompt}
            </pre>
          </CardContent>
        </Card>
      ) : !activeRepo ? null : null}

    </div>
  );
}
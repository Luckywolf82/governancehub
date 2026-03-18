import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, FileText, Activity, Lock } from "lucide-react";
import RepoRawAccessPanel from "@/components/admin/RepoRawAccessPanel";
import RepoVerificationPanel from "@/components/admin/RepoVerificationPanel";
import GovernanceOrchestratorPanel from "@/components/admin/GovernanceOrchestratorPanel";
import AuditRunnerPanel from "@/components/admin/AuditRunnerPanel";
import ExecutionLogPanel from "@/components/admin/ExecutionLogPanel";
import RepositoryManagerPanel from "@/components/admin/RepositoryManagerPanel";
import ProductIntelligencePanel from "@/components/admin/ProductIntelligencePanel";
import StartPromptGeneratorPanel from "@/components/admin/StartPromptGeneratorPanel";
import GovernanceStarterKitPanel from "@/components/admin/GovernanceStarterKitPanel";
import ProjectBootstrapPanel from "@/components/admin/ProjectBootstrapPanel";
import GitHubRepoDiscoveryPanel from "@/components/admin/GitHubRepoDiscoveryPanel";
import { useActiveRepo } from "@/components/ActiveRepoContext";
import BuildIntegrityBanner from "@/components/admin/BuildIntegrityBanner";
import PromptApprovalGate from "@/components/admin/PromptApprovalGate";
import DispatchReviewPanel from "@/components/admin/DispatchReviewPanel";
import PromptPreviewPanel from "@/components/admin/PromptPreviewPanel";
import ExecutionWorker from "@/components/governance/ExecutionWorker";
import Verification from "@/components/governance/Verification";
import ExecutionLog from "@/components/governance/ExecutionLog";
import { NEXT_SAFE_STEP } from "@/components/governance/NextSafeStep";

const TABS = ["Onboarding", "Govern", "Strategy"];

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Onboarding");
  const [injectedAudit, setInjectedAudit] = useState(null);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 768);
  const { activeRepo } = useActiveRepo();

  useEffect(() => {
    base44.auth.me().then(setUser).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Lock className="w-12 h-12 text-slate-400" />
        <h2 className="text-xl font-semibold text-slate-700">Tilgang nektet</h2>
        <p className="text-slate-500">Denne siden krever admin-tilgang.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-4 sm:px-6 sm:py-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-slate-700 dark:text-slate-300 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Admin-panel</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">GovernanceHub administrasjon</p>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 flex items-center gap-2 shrink-0">
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate max-w-[120px]">{user.full_name}</span>
            <Badge className="bg-slate-900 dark:bg-slate-700 text-white text-xs">{user.role}</Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1.5 items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-4 py-2 text-xs">
          <span>
            <span className="text-slate-400 dark:text-slate-500 font-medium mr-1">Repo:</span>
            <span className="text-slate-700 dark:text-slate-300">{activeRepo?.fullName ?? "Ingen repo valgt"}</span>
          </span>
          <span>
            <span className="text-slate-400 dark:text-slate-500 font-medium mr-1">Audit:</span>
            <span className="text-slate-700 dark:text-slate-300">{injectedAudit ? (injectedAudit.title ?? injectedAudit.id ?? "Ukjent") : "Ingen audit valgt"}</span>
          </span>
          <span>
            <span className="text-slate-400 dark:text-slate-500 font-medium mr-1">Plan:</span>
            <span className="text-slate-700 dark:text-slate-300">Ingen plan aktiv</span>
          </span>
        </div>

        {/* Workflow hint — read-only guidance layer, not a pipeline state engine */}
        <div className="border border-slate-200 dark:border-slate-700 rounded px-4 py-3 bg-white dark:bg-slate-900 space-y-1.5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Workflow hint</p>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            Audit <span className="text-slate-400 dark:text-slate-500">→</span> Orchestrate <span className="text-slate-400 dark:text-slate-500">→</span> Execute <span className="text-slate-400 dark:text-slate-500">→</span> Verify <span className="text-slate-400 dark:text-slate-500">→</span> Log
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Start med audit og jobb videre stegvis. Denne visningen er veiledende.</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Nåværende fokus:</span>{" "}
            {injectedAudit ? "Audit valgt" : "Start med audit"}
          </p>
        </div>

        <BuildIntegrityBanner />

        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 sm:px-5 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap flex-shrink-0 transition-colors ${
                tab === t
                  ? "border-slate-800 dark:border-slate-300 text-slate-900 dark:text-slate-100"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Govern" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">Govern</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Kjør audit, send til Orchestrator, opprett issue og verifiser</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded px-3 py-1.5 block sm:inline-block">Kjør audit → Bruk i Orchestrator → Opprett issue → Verifiser</p>
            </div>
            {/* Govern workflow framing shell — compact operator-orientation card */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Govern · arbeidsflyt</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Aktivt styringssyklus. Bruk panelene nedenfor for å kjøre audit, forberede neste styrte steg og gjennomgå implementasjon.</p>
              <div className="space-y-1.5 pt-0.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${activeRepo ? "bg-emerald-400" : "bg-amber-400"}`} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Aktivt repo</span>
                  <span className={`min-w-0 break-all ${activeRepo ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
                    {activeRepo ? `Valgt · ${activeRepo.fullName}` : "Ikke valgt · velg repo i toppmenyen"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 dark:text-slate-500 font-medium shrink-0 w-4">1.</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Kjør audit</span>
                  <span className="ml-1 text-slate-400 dark:text-slate-500">· Bruk Audit Runner nedenfor</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 dark:text-slate-500 font-medium shrink-0 w-4">2.</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Gjennomgå i Orchestrator</span>
                  <span className="ml-1 text-slate-400 dark:text-slate-500">· Send auditresultat for å forberede neste styrte steg</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 dark:text-slate-500 font-medium shrink-0 w-4">3.</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Forbered neste steg</span>
                  <span className="ml-1 text-slate-400 dark:text-slate-500">· Opprett issue eller dokumenter neste styrte steg manuelt</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 dark:text-slate-500 font-medium shrink-0 w-4">4.</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Gjennomgå eksekusjonslogg</span>
                  <span className="ml-1 text-slate-400 dark:text-slate-500">· Se loggoppføringer etter implementasjon</span>
                </div>
                <div className="flex items-start gap-2 text-xs pt-0.5">
                  <span className="w-2 h-2 rounded-full shrink-0 bg-slate-300 dark:bg-slate-600 mt-0.5" />
                  <span className="text-slate-400 dark:text-slate-500">Downstream execution pipeline er tilgjengelig nedenfor og er ikke operativ.</span>
                </div>
              </div>
            </div>

            <div className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-4 py-3 space-y-1">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Canonical next safe step</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{NEXT_SAFE_STEP.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{NEXT_SAFE_STEP.reason}</p>
            </div>
            <AuditRunnerPanel onUseInOrchestrator={(obj) => { setInjectedAudit(obj); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <GovernanceOrchestratorPanel injectedAudit={injectedAudit} onClearInjected={() => setInjectedAudit(null)} />
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <ExecutionLogPanel />
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <button
                type="button"
                onClick={() => setPipelineOpen((v) => !v)}
                className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors w-full text-left"
              >
                <span className={`inline-block transition-transform duration-150 ${pipelineOpen ? "rotate-90" : ""}`}>▶</span>
                Execution pipeline (preview — non-operational)
                <span className="ml-1 text-slate-400 dark:text-slate-500 font-normal">· gov-006 · collapsed by default</span>
              </button>
              {pipelineOpen && (
                <div className="space-y-4 mt-4">
                  <DispatchReviewPanel />
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <PromptPreviewPanel />
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <ExecutionWorker />
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <Verification />
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <ExecutionLog />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "Onboarding" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">Onboarding</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Koble GitHub, registrer repo og installer governance starter kit</p>
            </div>

            {/* Onboarding flow — compact operator-orientation card */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Onboarding · steg</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Følg stegene nedenfor for å komme i gang med GovernanceHub.</p>
              <div className="space-y-1.5 pt-0.5">
                {/* Step 1: connect GitHub */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 dark:text-slate-500 font-medium shrink-0 w-4">1.</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Koble GitHub</span>
                  <span className="ml-1 text-slate-400 dark:text-slate-500">· Discover-panelet nedenfor viser tilkoblingsstatus</span>
                </div>
                {/* Step 2: discover and register repo */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 dark:text-slate-500 font-medium shrink-0 w-4">2.</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Oppdag og registrer repo</span>
                  <span className="ml-1 text-slate-400 dark:text-slate-500">· Bruk GitHub Repository Discovery og Repository Manager</span>
                </div>
                {/* Step 3: install starter kit */}
                <div className="flex items-center gap-2 text-xs">
                  <span className={`text-slate-400 dark:text-slate-500 font-medium shrink-0 w-4`}>3.</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Installer governance starter kit</span>
                  <span className={`ml-1 ${activeRepo ? "text-slate-400 dark:text-slate-500" : "text-amber-600 dark:text-amber-400"}`}>
                    {activeRepo ? "· Tilgjengelig nedenfor" : "· Velg aktivt repo i toppmenyen først"}
                  </span>
                </div>
                {/* Step 4: ready */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 dark:text-slate-500 font-medium shrink-0 w-4">4.</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Klar til bruk</span>
                  <span className="ml-1 text-slate-400 dark:text-slate-500">· Gå til Govern-fanen for å starte audit og styring</span>
                </div>
              </div>
            </div>

            {/* Step 1–2: GitHub connection and repo registration */}
            <GitHubRepoDiscoveryPanel />
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <RepositoryManagerPanel />
            </div>

            {/* Step 3: Install governance starter kit */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-1 font-semibold uppercase tracking-wide">Steg 3 · Installer governance starter kit</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                Installer governance starter kit direkte fra aktivt repo — ingen prosjekt-bootstrap, audit eller planoppretting kreves.
                Bootstrap-konfigurasjon genereres automatisk med standardverdier.
              </p>
              <GovernanceStarterKitPanel />
            </div>

            {/* Advanced tools — collapsed by default */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <button
                type="button"
                aria-expanded={advancedOpen}
                onClick={() => setAdvancedOpen((v) => !v)}
                className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors w-full text-left"
              >
                <span className={`inline-block transition-transform duration-150 ${advancedOpen ? "rotate-90" : ""}`}>▶</span>
                Avanserte verktøy
                <span className="ml-1 text-slate-400 dark:text-slate-500 font-normal">· prosjekt-bootstrap, rå filtilgang, verifikasjon</span>
              </button>
              {advancedOpen && (
                <div className="space-y-4 mt-4">
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-1 font-semibold uppercase tracking-wide">Prosjekt-bootstrap</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Opprett eller koble eksisterende prosjekt for avansert governance-flyt (valgfritt).</p>
                    <ProjectBootstrapPanel />
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <RepoRawAccessPanel />
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <RepoVerificationPanel />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "Strategy" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">Strategy</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Roadmap, prioritering, referansepanel og prompt-generatorer</p>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 italic">Bruk Product Intelligence for prioritering. Prompt-generatorer er tilgjengelige her. Approval-panelene er støtte for governance og publisering.</p>

            {/* Strategy overview — compact operator-orientation card */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Strategy · referanse</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Referanse- og planleggingsflater. Bruk denne fanen til orientering og gjennomgang, ikke som primær aktiv arbeidsflyt.</p>
              <div className="space-y-1.5 pt-0.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${activeRepo ? "bg-emerald-400" : "bg-amber-400"}`} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Aktivt repo</span>
                  <span className={`min-w-0 break-all ${activeRepo ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
                    {activeRepo ? `Valgt · ${activeRepo.fullName}` : "Ikke valgt · velg repo i toppmenyen"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0 bg-slate-300 dark:bg-slate-600" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Prompt-generatorer</span>
                  <span className="ml-1 text-slate-400 dark:text-slate-500">· Start Prompt Generator nedenfor</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0 bg-slate-300 dark:bg-slate-600" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Roadmap og produktkontekst</span>
                  <span className="ml-1 text-slate-400 dark:text-slate-500">· Product Intelligence-panelet nedenfor</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0 bg-slate-300 dark:bg-slate-600" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Governance-referanse og gjennomgang</span>
                  <span className="ml-1 text-slate-400 dark:text-slate-500">· Prompt approval-status nedenfor</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0 bg-slate-300 dark:bg-slate-600" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Dokumentasjon og systemkontekst</span>
                  <span className="ml-1 text-slate-400 dark:text-slate-500">· Referanselenker nedenfor</span>
                </div>
                <div className="flex items-start gap-2 text-xs pt-0.5">
                  <span className="w-2 h-2 rounded-full shrink-0 bg-slate-300 dark:bg-slate-600 mt-0.5" />
                  <span className="text-slate-400 dark:text-slate-500">Grupperingen her er blandet og kan omorganiseres i et fremtidigt steg.</span>
                </div>
              </div>
            </div>

            <ProductIntelligencePanel
              onUseInOrchestrator={(obj) => {
                setInjectedAudit(obj);
                setTab("Govern");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              activeRepo={activeRepo}
            />

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wide">Generatorer</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Bruk disse for å forberede AI-arbeid og governance-struktur før implementering.</p>
              <StartPromptGeneratorPanel />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <button
                type="button"
                aria-expanded={approvalOpen}
                onClick={() => setApprovalOpen((v) => !v)}
                className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors w-full text-left"
              >
                <span className={`inline-block transition-transform duration-150 ${approvalOpen ? "rotate-90" : ""}`}>▶</span>
                Prompt Approval Status
              </button>
              {approvalOpen && (
                <div className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <PromptApprovalGate />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: <FileText className="w-5 h-5 text-blue-600" />, title: "Dokumentasjon", desc: "Governance-dokumenter og guider", href: "/docs" },
                  { icon: <Activity className="w-5 h-5 text-green-600" />, title: "Governance", desc: "Oversikt over governance-prosesser", href: "/governance" },
                ].map(({ icon, title, desc, href }) => (
                  <a key={title} href={href}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className="mt-0.5">{icon}</div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{title}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Systeminformasjon</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                    <span>Plattform</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">Base44</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                    <span>Appnavn</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">GovernanceHub</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                    <span>Bruker</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 break-all">{user.email}</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                    <span>Dato</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{new Date().toLocaleDateString("nb-NO")}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

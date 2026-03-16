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
import { useActiveRepo } from "@/components/ActiveRepoContext";
import BuildIntegrityBanner from "@/components/admin/BuildIntegrityBanner";
import PromptApprovalGate from "@/components/admin/PromptApprovalGate";
import DispatchReviewPanel from "@/components/admin/DispatchReviewPanel";
import PromptPreviewPanel from "@/components/admin/PromptPreviewPanel";
import ExecutionWorker from "@/components/governance/ExecutionWorker";
import Verification from "@/components/governance/Verification";
import ExecutionLog from "@/components/governance/ExecutionLog";
import { NEXT_SAFE_STEP } from "@/components/governance/NextSafeStep";

const TABS = ["Setup", "Build Prep", "Govern", "Strategy"];

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Setup");
  const [injectedAudit, setInjectedAudit] = useState(null);
  const [pipelineOpen, setPipelineOpen] = useState(false);
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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-slate-700" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin-panel</h1>
              <p className="text-sm text-slate-500">GovernanceHub administrasjon</p>
            </div>
          </div>
          <div className="text-sm text-slate-600 bg-white border border-slate-200 rounded px-3 py-1.5 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{user.full_name}</span>
            <Badge className="bg-slate-900 text-white text-xs">{user.role}</Badge>
          </div>
        </div>

        <BuildIntegrityBanner />

        <div className="flex border-b border-slate-200">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? "border-slate-800 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Govern" && (
          <div className="space-y-6">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Govern</p>
              <p className="text-sm text-slate-500 mb-1">Kjør audit, send til Orchestrator, opprett issue og verifiser</p>
              <p className="text-xs text-slate-400 bg-slate-100 rounded px-3 py-1.5 inline-block">Kjør audit → Bruk i Orchestrator → Opprett issue → Verifiser</p>
            </div>
            {/* Govern workflow framing shell — compact operator-orientation card */}
            <div className="border border-slate-200 rounded-md bg-white px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Govern workflow</p>
              <p className="text-xs text-slate-400">Active governed development cycle. Use the panels below to run audits, prepare next governed steps, and review implementation progress.</p>
              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium shrink-0 w-4">1.</span>
                  <span className="text-slate-700 font-medium">Run audit</span>
                  <span className="ml-1 text-slate-400">· Use Audit Runner below</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium shrink-0 w-4">2.</span>
                  <span className="text-slate-700 font-medium">Review in orchestrator</span>
                  <span className="ml-1 text-slate-400">· Send audit result to Governance Orchestrator to prepare next governed step</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium shrink-0 w-4">3.</span>
                  <span className="text-slate-700 font-medium">Prepare next action</span>
                  <span className="ml-1 text-slate-400">· Create issue or document the next governed step manually</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium shrink-0 w-4">4.</span>
                  <span className="text-slate-700 font-medium">Review execution log</span>
                  <span className="ml-1 text-slate-400">· Review log entries after implementation</span>
                </div>
                <div className="flex items-start gap-2 text-xs pt-0.5">
                  <span className="w-2 h-2 rounded-full shrink-0 bg-slate-300 mt-0.5" />
                  <span className="text-slate-400">Downstream execution pipeline preview is available below and remains non-operational.</span>
                </div>
              </div>
            </div>

            <div className="border border-slate-300 bg-white rounded-md px-4 py-3 space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Canonical next safe step</p>
              <p className="text-sm font-semibold text-slate-800">{NEXT_SAFE_STEP.title}</p>
              <p className="text-xs text-slate-500">{NEXT_SAFE_STEP.reason}</p>
            </div>
            {activeRepo ? (
              <div className="flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-200 rounded px-3 py-1.5 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="font-medium text-emerald-800">Aktivt repo: {activeRepo.fullName}</span>
                <span className="text-emerald-600">· Brukes for repo-aware audit og issue-targeting</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 rounded px-3 py-1.5 w-fit">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span className="font-medium text-amber-800">Ingen aktivt repo valgt</span>
                <span className="text-amber-600">· Velg repo i toppmenyen før repo-aware audit eller issue-oppretting</span>
              </div>
            )}
            <AuditRunnerPanel onUseInOrchestrator={(obj) => { setInjectedAudit(obj); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            <div className="border-t border-slate-200 pt-4">
              <GovernanceOrchestratorPanel injectedAudit={injectedAudit} onClearInjected={() => setInjectedAudit(null)} />
            </div>
            <div className="border-t border-slate-200 pt-4">
              <ExecutionLogPanel />
            </div>
            <div className="border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setPipelineOpen((v) => !v)}
                className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors w-full text-left"
              >
                <span className={`inline-block transition-transform duration-150 ${pipelineOpen ? "rotate-90" : ""}`}>▶</span>
                Execution pipeline (preview — non-operational)
                <span className="ml-1 text-slate-400 font-normal">· gov-006 · collapsed by default</span>
              </button>
              {pipelineOpen && (
                <div className="space-y-4 mt-4">
                  <DispatchReviewPanel />
                  <div className="border-t border-slate-200 pt-4">
                    <PromptPreviewPanel />
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <ExecutionWorker />
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <Verification />
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <ExecutionLog />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "Setup" && (
          <div className="space-y-6">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Setup</p>
              <p className="text-sm text-slate-500">Registrer repo og opprett eller koble prosjekt</p>
            </div>

            {/* Setup Readiness — compact operator-orientation card */}
            <div className="border border-slate-200 rounded-md bg-white px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Setup readiness</p>
              <p className="text-xs text-slate-400">Quick prerequisite overview before continuing to Build Prep and Govern.</p>
              <div className="space-y-1.5 pt-0.5">
                {/* Row 1: active repo — truly deterministic */}
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${activeRepo ? "bg-emerald-400" : "bg-amber-400"}`} />
                  <span className="text-slate-700 font-medium">Active repo</span>
                  <span className={`ml-1 ${activeRepo ? "text-emerald-700" : "text-amber-700"}`}>
                    {activeRepo ? `Selected · ${activeRepo.fullName}` : "Not selected · select a repo from the top menu"}
                  </span>
                </div>
                {/* Row 2: repository registration panel — informational */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0 bg-slate-300" />
                  <span className="text-slate-700 font-medium">Repository registration</span>
                  <span className="ml-1 text-slate-400">Managed below in Setup</span>
                </div>
                {/* Row 3: project bootstrap — informational */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0 bg-slate-300" />
                  <span className="text-slate-700 font-medium">Project bootstrap</span>
                  <span className="ml-1 text-slate-400">Available below in Setup</span>
                </div>
                {/* Row 4: governance installation — informational */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0 bg-slate-300" />
                  <span className="text-slate-700 font-medium">Governance installation</span>
                  <span className="ml-1 text-slate-400">Continues in Build Prep</span>
                </div>
              </div>
            </div>

            <RepositoryManagerPanel />
            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-400 mb-3">Neste steg etter repo-oppsett: bootstrap eller koble prosjekt</p>
              <ProjectBootstrapPanel />
            </div>
            <div className="border-t border-slate-200 pt-4">
              <RepoRawAccessPanel />
            </div>
            <RepoVerificationPanel />
          </div>
        )}

        {tab === "Build Prep" && (
          <div className="space-y-6">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Build Prep</p>
              <p className="text-sm text-slate-500">Generer prompt og governance-startpakke før bygging</p>
            </div>

            {/* Build Prep Readiness — compact operator-orientation card */}
            <div className="border border-slate-200 rounded-md bg-white px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Build Prep readiness</p>
              <p className="text-xs text-slate-400">Quick overview before generating prompts or installing governance starter-kit materials.</p>
              <div className="space-y-1.5 pt-0.5">
                {/* Row 1: active repo — truly deterministic */}
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${activeRepo ? "bg-emerald-400" : "bg-amber-400"}`} />
                  <span className="text-slate-700 font-medium">Active repo</span>
                  <span className={`ml-1 ${activeRepo ? "text-emerald-700" : "text-amber-700"}`}>
                    {activeRepo ? `Selected · ${activeRepo.fullName}` : "Not selected · select a repo from the top menu"}
                  </span>
                </div>
                {/* Row 2: start prompt generation — informational */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0 bg-slate-300" />
                  <span className="text-slate-700 font-medium">Start prompt generation</span>
                  <span className="ml-1 text-slate-400">Available below</span>
                </div>
                {/* Row 3: governance starter kit — informational */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0 bg-slate-300" />
                  <span className="text-slate-700 font-medium">Governance starter kit</span>
                  <span className="ml-1 text-slate-400">Managed below</span>
                </div>
                {/* Row 4: govern workflow — informational */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0 bg-slate-300" />
                  <span className="text-slate-700 font-medium">Govern workflow</span>
                  <span className="ml-1 text-slate-400">Continues in Govern after Build Prep</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-semibold mb-1">Generatorer</p>
              <p className="text-xs text-slate-400 mb-3">Bruk disse for å forberede AI-arbeid og governance-struktur før implementering.</p>
              {activeRepo ? (
                <div className="flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-200 rounded px-3 py-1.5 w-fit mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="font-medium text-emerald-800">Aktivt repo: {activeRepo.fullName}</span>
                  <span className="text-emerald-600">· Brukes for prompt og starter kit</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 rounded px-3 py-1.5 w-fit mb-4">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="font-medium text-amber-800">Ingen aktivt repo valgt</span>
                  <span className="text-amber-600">· Velg repo i toppmenyen før du genererer prompt eller starter kit</span>
                </div>
              )}
              <StartPromptGeneratorPanel />
            </div>
            <div className="border-t border-slate-200 pt-4">
              <GovernanceStarterKitPanel />
            </div>
          </div>
        )}

        {tab === "Strategy" && (
          <div className="space-y-6">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Strategy</p>
              <p className="text-sm text-slate-500">Roadmap, prioritering og referansepanel</p>
            </div>

            {/* Active repo context — lets operators send repo into downstream flows with one click */}
            {activeRepo ? (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Aktivt repo</p>
                      <p className="text-sm font-semibold text-slate-800">{activeRepo.fullName}</p>
                      {activeRepo.provider && (
                        <p className="text-xs text-slate-500">{activeRepo.provider} · {activeRepo.owner}/{activeRepo.repo}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setTab("Build Prep")}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded border bg-slate-800 text-white border-slate-800 hover:bg-slate-700 transition-colors"
                      >
                        Generer Start Prompt →
                      </button>
                      <button
                        onClick={() => setTab("Govern")}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Kjør audit →
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-200 rounded px-3 py-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-emerald-800">Repo-kontekst er aktiv og brukes automatisk i Orchestrator, Audit Runner og Start Prompt Generator.</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 rounded px-3 py-1.5 w-fit">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span className="font-medium text-amber-800">Ingen aktivt repo valgt</span>
                <span className="text-amber-600">· Velg repo i toppmenyen for å bruke repo-kontekst i downstream-flyt</span>
              </div>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Prompt Approval Status</CardTitle>
              </CardHeader>
              <CardContent>
                <PromptApprovalGate />
              </CardContent>
            </Card>
            <ProductIntelligencePanel
              onUseInOrchestrator={(obj) => {
                setInjectedAudit(obj);
                setTab("Govern");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              activeRepo={activeRepo}
            />
            <div className="border-t border-slate-200 pt-4 space-y-4">
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
                          <p className="font-semibold text-slate-800">{title}</p>
                          <p className="text-sm text-slate-500">{desc}</p>
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
                <CardContent className="text-sm text-slate-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Plattform</span>
                    <span className="font-medium text-slate-800">Base44</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Appnavn</span>
                    <span className="font-medium text-slate-800">GovernanceHub</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bruker</span>
                    <span className="font-medium text-slate-800">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dato</span>
                    <span className="font-medium text-slate-800">{new Date().toLocaleDateString("nb-NO")}</span>
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

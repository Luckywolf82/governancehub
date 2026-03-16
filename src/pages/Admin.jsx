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

const TABS = ["Govern", "Setup", "Build Prep", "Strategy"];

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Govern");
  const [injectedAudit, setInjectedAudit] = useState(null);
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
          </div>
        )}

        {tab === "Setup" && (
          <div className="space-y-6">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Setup</p>
              <p className="text-sm text-slate-500">Registrer repo og opprett eller koble prosjekt</p>
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
            <Card>
              <CardHeader>
                <CardTitle>Prompt Approval Status</CardTitle>
              </CardHeader>
              <CardContent>
                <PromptApprovalGate />
              </CardContent>
            </Card>
            <ProductIntelligencePanel />
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

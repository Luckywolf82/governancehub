import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, FileText, Activity, Lock } from "lucide-react";
import RepoRawAccessPanel from "@/components/admin/RepoRawAccessPanel";
import RepoVerificationPanel from "@/components/admin/RepoVerificationPanel";
import GovernanceOrchestratorPanel from "@/components/admin/GovernanceOrchestratorPanel";
import AuditRunnerPanel from "@/components/admin/AuditRunnerPanel";
import RepositoryManagerPanel from "@/components/admin/RepositoryManagerPanel";
import ProductIntelligencePanel from "@/components/admin/ProductIntelligencePanel";
import StartPromptGeneratorPanel from "@/components/admin/StartPromptGeneratorPanel";
import GovernanceStarterKitPanel from "@/components/admin/GovernanceStarterKitPanel";
import ProjectBootstrapPanel from "@/components/admin/ProjectBootstrapPanel";

const TABS = ["Govern", "Setup", "Build Prep", "Strategy"];

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Govern");
  const [injectedAudit, setInjectedAudit] = useState(null);

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

        {/* Header */}
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

        {/* Tab bar */}
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

        {/* Tab: Operations */}
        {tab === "Operations" && (
          <div className="space-y-6">
            <AuditRunnerPanel onUseInOrchestrator={(obj) => { setInjectedAudit(obj); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            <div className="border-t border-slate-200 pt-4">
              <GovernanceOrchestratorPanel injectedAudit={injectedAudit} onClearInjected={() => setInjectedAudit(null)} />
            </div>
          </div>
        )}

        {/* Tab: Repo Tools */}
        {tab === "Repo Tools" && (
          <div className="space-y-6">
            <RepositoryManagerPanel />
            <div className="border-t border-slate-200 pt-4">
              <ProjectBootstrapPanel />
            </div>
            <div className="border-t border-slate-200 pt-4">
              <RepoRawAccessPanel />
            </div>
            <RepoVerificationPanel />
          </div>
        )}

        {/* Tab: Product */}
        {tab === "Product" && (
          <div className="space-y-6">
            <StartPromptGeneratorPanel />
            <div className="border-t border-slate-200 pt-4">
              <GovernanceStarterKitPanel />
            </div>
          </div>
        )}

        {/* Tab: System */}
        {tab === "System" && (
          <div className="space-y-6">
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
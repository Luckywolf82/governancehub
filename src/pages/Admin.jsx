import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, FileText, Activity, Lock } from "lucide-react";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-slate-700" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin-panel</h1>
            <p className="text-sm text-slate-500">GovernanceHub administrasjon</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" /> Innlogget bruker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-slate-700">
            <div><span className="font-medium">Navn:</span> {user.full_name}</div>
            <div><span className="font-medium">E-post:</span> {user.email}</div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Rolle:</span>
              <Badge className="bg-slate-900 text-white text-xs">{user.role}</Badge>
            </div>
          </CardContent>
        </Card>

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
              <span>Dato</span>
              <span className="font-medium text-slate-800">{new Date().toLocaleDateString("nb-NO")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
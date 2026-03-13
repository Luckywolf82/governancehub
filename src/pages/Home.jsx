import { Link } from "react-router-dom";
import { FolderKanban, ClipboardList, Shield, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AUDIT_INDEX } from "@/components/audits/AUDIT_INDEX";
import { PROJECT_REGISTRY } from "@/components/projects/PROJECT_REGISTRY";

const FEATURES = [
  {
    icon: FolderKanban,
    label: "Projects",
    desc: "Track active and planned development initiatives across your organization.",
    href: "/Projects",
    color: "text-blue-600",
  },
  {
    icon: ClipboardList,
    label: "Audits",
    desc: "Maintain compliance and quality audit records with clear status tracking.",
    href: "/Audits",
    color: "text-teal-600",
  },
  {
    icon: Shield,
    label: "Admin",
    desc: "Manage users, roles, and system configuration from a central dashboard.",
    href: "/Admin",
    color: "text-slate-700",
  },
];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">GovernanceHub</h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          A centralized platform for managing governance processes, tracking audits,
          and maintaining visibility across your development lifecycle.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/Projects"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
          >
            View Projects <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/Audits"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            View Audits
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, label, desc, href, color }) => (
          <Link key={href} to={href}>
            <Card className="h-full border-slate-200 bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-3">
                <Icon className={`w-6 h-6 ${color}`} />
                <div>
                  <p className="font-semibold text-slate-800">{label}</p>
                  <p className="text-sm text-slate-500 mt-1">{desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {/* Status strip */}
      <section className="border border-slate-200 rounded-lg bg-white px-6 py-4 flex flex-wrap gap-6 justify-center text-sm text-slate-600">
        {[
          { label: "Active Projects", value: "3" },
          { label: "Audits Completed", value: "3" },
          { label: "Planned Items", value: "4" },
          { label: "Platform", value: "Base44" },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="text-xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
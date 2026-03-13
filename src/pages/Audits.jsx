import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

const AUDITS = [
  {
    id: "arch-001",
    title: "Admin UI File Placement",
    category: "Architecture",
    status: "completed",
    date: "2026-03-13",
    summary: "Audited placement of Admin UI components against project conventions.",
  },
  {
    id: "prod-001",
    title: "Product Intelligence Audit",
    category: "Product",
    status: "completed",
    date: "2026-03-12",
    summary: "Evaluated product scoring model and roadmap prioritization framework.",
  },
  {
    id: "prod-002",
    title: "Product Utility Audit",
    category: "Product",
    status: "completed",
    date: "2026-03-11",
    summary: "Reviewed product utility standards and audit documentation template.",
  },
  {
    id: "gov-001",
    title: "Governance Workflow Review",
    category: "Governance",
    status: "planned",
    date: null,
    summary: "Review governance workflow definitions and enforcement coverage.",
  },
  {
    id: "perf-001",
    title: "Performance Baseline",
    category: "Performance",
    status: "planned",
    date: null,
    summary: "Establish performance baselines for critical user-facing pages.",
  },
];

const STATUS_STYLES = {
  completed: "bg-green-100 text-green-800",
  "in-progress": "bg-blue-100 text-blue-800",
  planned: "bg-slate-100 text-slate-600",
};

const CATEGORY_STYLES = {
  Architecture: "bg-purple-100 text-purple-800",
  Product: "bg-amber-100 text-amber-800",
  Governance: "bg-teal-100 text-teal-800",
  Performance: "bg-orange-100 text-orange-800",
  Data: "bg-sky-100 text-sky-800",
  UI: "bg-pink-100 text-pink-800",
};

export default function Audits() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="w-6 h-6 text-slate-700" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audits</h1>
          <p className="text-sm text-slate-500">Compliance and quality audit records</p>
        </div>
      </div>

      <div className="space-y-3">
        {AUDITS.map((a) => (
          <Card key={a.id} className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <CardTitle className="text-base font-semibold text-slate-800">{a.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={`${CATEGORY_STYLES[a.category] || "bg-slate-100 text-slate-600"} text-xs`}>
                    {a.category}
                  </Badge>
                  <Badge className={`${STATUS_STYLES[a.status]} text-xs`}>{a.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-sm text-slate-500">{a.summary}</p>
              <p className="text-xs text-slate-400">{a.date ? `Completed: ${a.date}` : "Not yet scheduled"} · ID: {a.id}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
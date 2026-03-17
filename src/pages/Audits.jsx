import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { AUDIT_INDEX } from "@/components/audits/AUDIT_INDEX";

const AUDITS = AUDIT_INDEX.entries;

const STATUS_STYLES = {
  completed: "bg-green-100 text-green-800",
  "in-progress": "bg-blue-100 text-blue-800",
  planned: "bg-slate-100 text-slate-600",
  verified: "bg-green-100 text-green-800",
  orphaned: "bg-amber-100 text-amber-800",
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
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="w-6 h-6 text-slate-700 dark:text-slate-300 shrink-0" />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Audits</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Compliance and quality audit records</p>
        </div>
      </div>

      <div className="space-y-4">
        {AUDITS.map((a) => (
          <Card key={a.id} className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100 min-w-0 leading-snug">
                  {a.title}
                </CardTitle>
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  <Badge className={`${CATEGORY_STYLES[a.category] || "bg-slate-100 text-slate-600"} text-xs`}>
                    {a.category}
                  </Badge>
                  <Badge className={`${STATUS_STYLES[a.status] || "bg-slate-100 text-slate-600"} text-xs`}>
                    {a.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{a.summary}</p>
              <p className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-slate-400 dark:text-slate-500">
                <span>{a.date ? `Completed: ${a.date}` : "Not yet scheduled"}</span>
                <span aria-hidden="true">·</span>
                <span>ID: {a.id}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
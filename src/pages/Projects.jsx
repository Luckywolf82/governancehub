import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Inbox } from "lucide-react";

const STATUS_STYLES = {
  active:        "bg-green-100 text-green-800",
  "in-progress": "bg-blue-100 text-blue-800",
  planned:       "bg-slate-100 text-slate-600",
  blocked:       "bg-red-100 text-red-800",
  archived:      "bg-yellow-100 text-yellow-800",
};

export default function Projects() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date"),
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <FolderKanban className="w-6 h-6 text-slate-700" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500">Active and planned development projects</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <Inbox className="w-10 h-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Ingen prosjekter registrert ennå</p>
          <p className="text-xs text-slate-400">Bruk <span className="font-medium">Project Bootstrap</span> i Admin → Product for å opprette det første prosjektet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <Card key={p.id} className="border-slate-200 bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold text-slate-800">{p.name}</CardTitle>
                  <Badge className={`${STATUS_STYLES[p.status] ?? STATUS_STYLES.planned} text-xs shrink-0`}>
                    {p.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {p.description && <p className="text-sm text-slate-500">{p.description}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  {p.phase && <span>{p.phase}</span>}
                  {p.phase && p.owner && <span>·</span>}
                  {p.owner && <span>{p.owner}</span>}
                  {p.repoFullName && (
                    <>
                      <span>·</span>
                      <span className="font-mono">{p.repoFullName}</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
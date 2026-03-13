import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";

const PROJECTS = [
  {
    id: 1,
    name: "GovernanceHub Core",
    description: "Core platform infrastructure, routing, and authentication.",
    status: "active",
    phase: "Phase 1",
    owner: "Platform Team",
  },
  {
    id: 2,
    name: "Audit Trail System",
    description: "Structured audit logging and compliance reporting for all governance actions.",
    status: "in-progress",
    phase: "Phase 2",
    owner: "Compliance Team",
  },
  {
    id: 3,
    name: "Admin Dashboard",
    description: "Administrative panel for managing users, roles, and system configuration.",
    status: "in-progress",
    phase: "Phase 1",
    owner: "Platform Team",
  },
  {
    id: 4,
    name: "Policy Management",
    description: "Define, publish, and enforce organizational policies across teams.",
    status: "planned",
    phase: "Phase 3",
    owner: "Governance Team",
  },
  {
    id: 5,
    name: "Execution Logs",
    description: "Full history of process executions with filtering and export.",
    status: "planned",
    phase: "Phase 3",
    owner: "Platform Team",
  },
];

const STATUS_STYLES = {
  active: "bg-green-100 text-green-800",
  "in-progress": "bg-blue-100 text-blue-800",
  planned: "bg-slate-100 text-slate-600",
  blocked: "bg-red-100 text-red-800",
};

export default function Projects() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <FolderKanban className="w-6 h-6 text-slate-700" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500">Active and planned development projects</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PROJECTS.map((p) => (
          <Card key={p.id} className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base font-semibold text-slate-800">{p.name}</CardTitle>
                <Badge className={`${STATUS_STYLES[p.status]} text-xs shrink-0`}>{p.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-500">{p.description}</p>
              <div className="flex gap-3 text-xs text-slate-400">
                <span>{p.phase}</span>
                <span>·</span>
                <span>{p.owner}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
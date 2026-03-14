import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, ClipboardList, Home, Shield, GitBranch } from "lucide-react";
import { useActiveRepo } from "@/components/ActiveRepoContext";

const NAV_ITEMS = [
  { label: "Home", href: "/Home", icon: Home },
  { label: "Projects", href: "/Projects", icon: FolderKanban },
  { label: "Audits", href: "/Audits", icon: ClipboardList },
  { label: "Admin", href: "/Admin", icon: Shield },
];

export default function AppLayout({ children }) {
  const { pathname } = useLocation();
  const { activeRepo, repos, selectRepo, clearActiveRepo } = useActiveRepo();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/Home" className="font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-slate-700" />
            GovernanceHub
          </Link>
          
          {/* Global Active Repo Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md">
            <GitBranch className="w-4 h-4 text-slate-500" />
            <select
              value={activeRepo?.id || ""}
              onChange={(e) => {
                if (e.target.value === "") {
                  clearActiveRepo();
                } else {
                  const repo = repos.find((r) => r.id === e.target.value);
                  if (repo) selectRepo(repo);
                }
              }}
              disabled={repos.length === 0}
              className="text-xs font-medium text-slate-700 bg-transparent border-0 focus:outline-none focus:ring-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Velg repo</option>
              {repos.length === 0 ? (
                <option disabled value="">Ingen aktive repo</option>
              ) : (
                repos.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.owner}/{repo.repo}
                  </option>
                ))
              )}
            </select>
          </div>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== "/Home" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 bg-slate-50">
        {children}
      </main>
    </div>
  );
}
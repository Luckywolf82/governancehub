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
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Top header */}
      <header className="app-header-safe border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          {/* Branding */}
          <Link
            to="/Home"
            className="font-semibold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2 shrink-0 select-none"
          >
            <LayoutDashboard className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            GovernanceHub
          </Link>

          {/* Repo selector — flexible on mobile, fixed on desktop */}
          <div className="flex items-center gap-2 min-w-0 flex-1 md:flex-initial">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:block">
              Aktivt repo
            </label>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md min-w-0 flex-1 md:flex-initial">
              <GitBranch className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
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
                className="text-xs font-medium text-slate-700 dark:text-slate-200 bg-transparent border-0 focus:outline-none focus:ring-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed min-w-0 w-full"
              >
                {repos.length === 0 ? (
                  <option value="">Ingen aktive repo</option>
                ) : (
                  <>
                    <option value="">Velg repo</option>
                    {repos.map((repo) => (
                      <option key={repo.id} value={repo.id}>
                        {repo.owner}/{repo.repo}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Desktop nav — hidden on mobile; bottom nav is used on small screens */}
          <nav className="hidden md:flex items-center gap-1 select-none ml-auto">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== "/Home" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="app-content-safe flex-1 bg-slate-50 dark:bg-slate-950">
        {children}
      </main>

      {/* Mobile bottom navigation — visible on small screens only */}
      <nav
        aria-label="Mobile navigation"
        className="app-bottom-nav-safe md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 select-none"
      >
        <div className="flex items-stretch">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/Home" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                to={href}
                style={{ minHeight: "var(--bottom-nav-height)" }}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs font-medium transition-colors border-t-2 ${
                  active
                    ? "border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100"
                    : "border-transparent text-slate-400 dark:text-slate-500"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
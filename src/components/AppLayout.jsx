import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, ClipboardList, Home, Shield, Trash2, LogOut } from "lucide-react";
import { useActiveRepo } from "@/components/ActiveRepoContext";
import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import AccountDeletionDialog from "@/components/AccountDeletionDialog";
import RepoSelectorDrawer from "@/components/RepoSelectorDrawer";

const NAV_ITEMS = [
  { label: "Home", href: "/Home", icon: Home },
  { label: "Projects", href: "/Projects", icon: FolderKanban },
  { label: "Audits", href: "/Audits", icon: ClipboardList },
  { label: "Admin", href: "/Admin", icon: Shield },
];

export default function AppLayout({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { activeRepo, repos, selectRepo, clearActiveRepo } = useActiveRepo();
  const [user, setUser] = useState(null);
  const [showDeletion, setShowDeletion] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Preserve scroll positions per route
  const scrollPositions = useRef({});

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Save scroll position when leaving a route
  useEffect(() => {
    const saveScroll = () => {
      scrollPositions.current[pathname] = window.scrollY;
    };
    window.addEventListener("scroll", saveScroll, { passive: true });
    return () => window.removeEventListener("scroll", saveScroll);
  }, [pathname]);

  // Restore scroll position when entering a route
  useEffect(() => {
    const saved = scrollPositions.current[pathname];
    if (saved !== undefined) {
      // Defer to let layout paint first
      requestAnimationFrame(() => window.scrollTo(0, saved));
    }
  }, [pathname]);

  const handleBottomTabClick = (href) => {
    const isActive = pathname === href || (href !== "/Home" && pathname.startsWith(href));
    if (isActive) {
      // Reset: scroll to top and navigate to root
      scrollPositions.current[href] = 0;
      window.scrollTo({ top: 0, behavior: "smooth" });
      navigate(href, { replace: true });
    } else {
      navigate(href);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* Top nav */}
      <header
        className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-30"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <Link
            to="/Home"
            className="font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 shrink-0 select-none"
          >
            <LayoutDashboard className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="hidden sm:inline">GovernanceHub</span>
          </Link>

          {/* Drawer-based Repo Selector */}
          <RepoSelectorDrawer
            repos={repos}
            activeRepo={activeRepo}
            onSelect={selectRepo}
            onClear={clearActiveRepo}
          />

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== "/Home" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] select-none ${
                    active
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Account menu button */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0 min-w-[44px] min-h-[44px] select-none"
                aria-label="Account menu"
              >
                {user.full_name?.[0]?.toUpperCase() || "U"}
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-50 py-1">
                    <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 truncate">
                      {user.email}
                    </div>
                    <button
                      onClick={() => { setMenuOpen(false); base44.auth.logout(); }}
                      className="w-full text-left px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 min-h-[44px]"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); setShowDeletion(true); }}
                      className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 flex items-center gap-2 min-h-[44px]"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Account
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Page content — padded for bottom tabs on mobile */}
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0">
        {children}
      </main>

      {/* Bottom tab bar — mobile only */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/Home" && pathname.startsWith(href));
          return (
            <button
              key={href}
              onClick={() => handleBottomTabClick(href)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors select-none ${
                active
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </nav>

      {user && (
        <AccountDeletionDialog
          open={showDeletion}
          onClose={() => setShowDeletion(false)}
          userEmail={user.email}
        />
      )}
    </div>
  );
}
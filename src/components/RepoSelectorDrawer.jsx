import { useState } from "react";
import { GitBranch, Check, ChevronDown, X } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

export default function RepoSelectorDrawer({ repos, activeRepo, onSelect, onClear }) {
  const [open, setOpen] = useState(false);

  const label = activeRepo ? `${activeRepo.owner}/${activeRepo.repo}` : "Velg repo";

  const handleSelect = (repo) => {
    if (repo) onSelect(repo);
    else onClear();
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => repos.length > 0 && setOpen(true)}
        disabled={repos.length === 0}
        className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md min-w-0 flex-1 max-w-xs select-none disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <GitBranch className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate flex-1 text-left">
          {repos.length === 0 ? "Ingen aktive repo" : label}
        </span>
        {repos.length > 0 && <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle className="flex items-center gap-2 text-base">
              <GitBranch className="w-4 h-4" /> Velg aktivt repo
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-1" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
            {/* Clear option */}
            <button
              onClick={() => handleSelect(null)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors min-h-[52px] select-none ${
                !activeRepo
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span>Ingen (fjern valgt repo)</span>
              {!activeRepo && <Check className="w-4 h-4" />}
            </button>

            {repos.map((repo) => {
              const selected = activeRepo?.id === repo.id;
              return (
                <button
                  key={repo.id}
                  onClick={() => handleSelect(repo)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-colors min-h-[52px] select-none ${
                    selected
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2 text-left min-w-0">
                    <GitBranch className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{repo.owner}/{repo.repo}</div>
                      {repo.defaultBranch && (
                        <div className={`text-xs truncate ${selected ? "opacity-70" : "text-slate-400"}`}>
                          {repo.defaultBranch}
                        </div>
                      )}
                    </div>
                  </div>
                  {selected && <Check className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
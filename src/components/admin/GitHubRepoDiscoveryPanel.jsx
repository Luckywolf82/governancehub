import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle2, AlertTriangle, Plus, Lock, Unlock } from "lucide-react";
import { useActiveRepo } from "@/components/ActiveRepoContext";

/**
 * GitHubRepoDiscoveryPanel
 *
 * Displays repositories discovered from the connected GitHub account.
 * Clearly separates:
 *   - GitHub access tier: visibility, push permission (canWrite)
 *   - GovernanceHub governance tier: registered, enabled, capabilities
 *
 * Allows one-click registration of discovered repos via registerGithubRepo.
 */
export default function GitHubRepoDiscoveryPanel() {
  const { refreshRepos } = useActiveRepo();
  const [repos, setRepos] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error | not_connected
  const [error, setError] = useState(null);
  const [registeringId, setRegisteringId] = useState(null);
  const [registerResult, setRegisterResult] = useState({});

  const discover = async () => {
    setStatus("loading");
    setError(null);
    setRepos([]);
    setRegisterResult({});
    try {
      const result = await base44.functions.invoke("listGithubRepos", {});
      if (result.error === "github_not_connected") {
        setStatus("not_connected");
        return;
      }
      if (!result.success) {
        setStatus("error");
        setError(result.message ?? result.error ?? "Unknown error from listGithubRepos");
        return;
      }
      setRepos(result.repositories ?? []);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err.message ?? "Failed to discover repositories");
    }
  };

  const registerRepo = async (repo) => {
    setRegisteringId(repo.fullName);
    try {
      const result = await base44.functions.invoke("registerGithubRepo", {
        owner: repo.owner,
        repo: repo.repo,
      });
      if (result.success) {
        setRegisterResult((prev) => ({
          ...prev,
          [repo.fullName]: { ok: true, githubCanWrite: result.repository?.githubCanWrite },
        }));
        // Refresh the discovery list and active repo context
        await discover();
        await refreshRepos();
      } else {
        setRegisterResult((prev) => ({
          ...prev,
          [repo.fullName]: { ok: false, error: result.message ?? result.error ?? "Registration failed" },
        }));
      }
    } catch (err) {
      setRegisterResult((prev) => ({
        ...prev,
        [repo.fullName]: { ok: false, error: err.message ?? "Registration failed" },
      }));
    } finally {
      setRegisteringId(null);
    }
  };

  const unregistered = repos.filter((r) => !r.registered);
  const registered = repos.filter((r) => r.registered);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">GitHub Repository Discovery</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover repositories from the connected GitHub account and register them in GovernanceHub
          </p>
        </div>
        <button
          onClick={discover}
          disabled={status === "loading"}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${status === "loading" ? "animate-spin" : ""}`} />
          {status === "loading" ? "Discovering…" : "Discover from GitHub"}
        </button>
      </div>

      {/* Auth model explainer */}
      <div className="border border-blue-100 bg-blue-50 rounded px-3 py-2 text-xs text-blue-800 space-y-0.5">
        <p className="font-semibold">Two-layer access model</p>
        <p>
          <span className="font-medium text-blue-700">GitHub tier</span> — repository visibility and push permission come from the connected GitHub account.
        </p>
        <p>
          <span className="font-medium text-blue-700">GovernanceHub tier</span> — registered + enabled + capabilities are GovernanceHub governance decisions, independent of GitHub.
        </p>
      </div>

      {status === "not_connected" && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            GitHub connector is not authorized. Connect a GitHub account in the platform connector settings before using repository discovery.
          </span>
        </div>
      )}

      {status === "error" && error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-800">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {status === "success" && repos.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-4">No repositories found in the connected GitHub account.</p>
      )}

      {status === "success" && repos.length > 0 && (
        <div className="space-y-4">
          {/* Unregistered repos */}
          {unregistered.length > 0 && (
            <Card className="border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-700">
                  Available to register ({unregistered.length})
                </CardTitle>
                <p className="text-xs text-slate-500">
                  These repositories are accessible via GitHub but not yet registered in GovernanceHub.
                </p>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {unregistered.map((repo) => {
                  const result = registerResult[repo.fullName];
                  const isRegistering = registeringId === repo.fullName;
                  return (
                    <div key={repo.fullName} className="border border-slate-100 rounded p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-mono font-semibold text-slate-800">{repo.fullName}</p>
                            {repo.archived && (
                              <Badge className="bg-slate-100 text-slate-600 text-xs">Archived</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                            <span>
                              <span className="font-medium text-slate-600">Branch:</span> {repo.defaultBranch}
                            </span>
                            <span>
                              <span className="font-medium text-slate-600">Visibility:</span> {repo.visibility}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <PermissionBadge canWrite={repo.canWrite} />
                          <button
                            onClick={() => registerRepo(repo)}
                            disabled={isRegistering}
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isRegistering ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" /> Registering…
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" /> Register
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      {result && !result.ok && (
                        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
                          {result.error}
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Registered repos */}
          {registered.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-700">
                  Registered in GovernanceHub ({registered.length})
                </CardTitle>
                <p className="text-xs text-slate-500">
                  These repositories are registered and governed by GovernanceHub.
                </p>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {registered.map((repo) => (
                  <div key={repo.fullName} className="border border-slate-100 rounded p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-mono font-semibold text-slate-800">{repo.fullName}</p>
                          {repo.archived && (
                            <Badge className="bg-slate-100 text-slate-600 text-xs">Archived</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                          <span>
                            <span className="font-medium text-slate-600">Branch:</span> {repo.defaultBranch}
                          </span>
                          <span>
                            <span className="font-medium text-slate-600">Visibility:</span> {repo.visibility}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        <PermissionBadge canWrite={repo.canWrite} />
                        <Badge
                          className={
                            repo.enabled
                              ? "bg-green-100 text-green-800 text-xs"
                              : "bg-red-100 text-red-800 text-xs"
                          }
                        >
                          {repo.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 text-xs flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" aria-label="Registered" /> Registered
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {status === "idle" && (
        <div className="border border-dashed border-slate-200 rounded px-4 py-6 text-center text-xs text-slate-400">
          Click <span className="font-semibold text-slate-600">Discover from GitHub</span> to load repositories from the connected GitHub account.
        </div>
      )}
    </div>
  );
}

function PermissionBadge({ canWrite }) {
  if (canWrite) {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 text-xs flex items-center gap-0.5">
        <Unlock className="w-3 h-3" aria-label="Write access" /> write
      </Badge>
    );
  }
  return (
    <Badge className="bg-slate-100 text-slate-600 text-xs flex items-center gap-0.5">
      <Lock className="w-3 h-3" aria-label="Read-only access" /> read-only
    </Badge>
  );
}

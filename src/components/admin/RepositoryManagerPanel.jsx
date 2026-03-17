import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Save, AlertTriangle } from "lucide-react";
import { useActiveRepo } from "@/components/ActiveRepoContext";

// Canonical set of known capabilities with their safe defaults.
// All capabilities are shown in the UI regardless of what is stored.
const KNOWN_CAPABILITIES = {
  "contents:read": true,
  "contents:write": false,
  "issue:create": true,
  "dispatch:audit": true,
  "repo:create": false,
};

export default function RepositoryManagerPanel() {
  const { refreshRepos } = useActiveRepo();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    provider: "github",
    owner: "",
    repo: "",
    visibility: "public",
    defaultBranch: "main",
    isEnabled: true,
    capabilitiesJson: { ...KNOWN_CAPABILITIES },
    notes: "",
  });
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState(null);

  // Load repositories
  useEffect(() => {
    async function loadRepos() {
      try {
        const result = await base44.entities.Repository.list();
        setRepos(result || []);
      } catch (err) {
        setError(`Failed to load repositories: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    loadRepos();
  }, []);

  const handleCreateChange = (field, value) => {
    setCreateForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-derive fullName from owner/repo
      if (field === "owner" || field === "repo") {
        if (updated.owner.trim() && updated.repo.trim()) {
          updated.fullName = `${updated.owner}/${updated.repo}`;
        }
      }
      return updated;
    });
  };

  const handleCapabilityToggle = (cap, isEdit = false) => {
    const setter = isEdit ? setEditForm : setCreateForm;
    setter((prev) => ({
      ...prev,
      capabilitiesJson: {
        ...prev.capabilitiesJson,
        [cap]: !prev.capabilitiesJson[cap],
      },
    }));
  };

  const handleCreate = async () => {
    if (!createForm.owner.trim() || !createForm.repo.trim()) {
      setError("Owner and repo name are required");
      return;
    }
    try {
      await base44.entities.Repository.create(createForm);
      setCreateForm({
        provider: "github",
        owner: "",
        repo: "",
        visibility: "public",
        defaultBranch: "main",
        isEnabled: true,
        capabilitiesJson: { ...KNOWN_CAPABILITIES },
        notes: "",
      });
      setShowCreate(false);
      setError(null);
      // Reload repos
      const result = await base44.entities.Repository.list();
      setRepos(result || []);
      // Refresh active repo context so header selector updates
      await refreshRepos();
    } catch (err) {
      setError(`Failed to create repository: ${err.message}`);
    }
  };

  const handleEditStart = (repo) => {
    setEditingId(repo.id);
    setEditForm({
      ...repo,
      // Merge KNOWN_CAPABILITIES (with safe defaults) over the stored capabilities
      // so that capabilities added after initial registration (e.g. contents:write)
      // always appear as toggleable checkboxes in the edit form.
      capabilitiesJson: {
        ...KNOWN_CAPABILITIES,
        ...(repo.capabilitiesJson || {}),
      },
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    try {
      await base44.entities.Repository.update(editingId, editForm);
      setEditingId(null);
      setEditForm({});
      setError(null);
      // Reload repos
      const result = await base44.entities.Repository.list();
      setRepos(result || []);
      // Refresh active repo context so header selector updates and validates current selection
      await refreshRepos();
    } catch (err) {
      setError(`Failed to update repository: ${err.message}`);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-6 h-6 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Repository Manager</h2>
          <p className="text-xs text-slate-500">Håndter GitHub-repository-registreringer og capabiliteter</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded bg-slate-800 text-white hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Opprett repo
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-800">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <Card className="border-slate-300 bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-700">Opprett ny repository</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Owner</label>
                <input
                  type="text"
                  value={createForm.owner}
                  onChange={(e) => handleCreateChange("owner", e.target.value)}
                  placeholder="e.g. my-org"
                  className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Repo</label>
                <input
                  type="text"
                  value={createForm.repo}
                  onChange={(e) => handleCreateChange("repo", e.target.value)}
                  placeholder="e.g. my-repo"
                  className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Visibility</label>
              <select
                value={createForm.visibility || "public"}
                onChange={(e) => handleCreateChange("visibility", e.target.value)}
                className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Default Branch</label>
              <input
                type="text"
                value={createForm.defaultBranch}
                onChange={(e) => handleCreateChange("defaultBranch", e.target.value)}
                placeholder="main"
                className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-2">Capabilities</label>
              <div className="space-y-1">
                {Object.keys(createForm.capabilitiesJson).map((cap) => (
                  <label key={cap} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={createForm.capabilitiesJson[cap]}
                      onChange={() => handleCapabilityToggle(cap, false)}
                      className="rounded border-slate-200"
                    />
                    <span className="text-slate-700 font-mono">{cap}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Notes</label>
              <textarea
                value={createForm.notes}
                onChange={(e) => handleCreateChange("notes", e.target.value)}
                placeholder="Admin notes (optional)"
                rows={2}
                className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="flex-1 text-xs font-semibold px-3 py-1.5 rounded bg-slate-800 text-white hover:bg-slate-700 transition-colors"
              >
                Opprett
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 text-xs px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Avbryt
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Repository List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-700">Registrerte repositories ({repos.length})</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Kun repositories med <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">provider: github</code> og <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">isEnabled: true</code> vises i «Aktivt repo»-velgeren i toppmenyen.</p>
        </CardHeader>
        <CardContent className="pt-0">
          {repos.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">Ingen repositories registrert. Opprett en ny for å komme i gang.</p>
          ) : (
            <div className="space-y-2">
              {repos.map((repo) => (
                <div key={repo.id} className="border border-slate-100 rounded p-3 space-y-2">
                  {editingId === repo.id ? (
                    // Edit mode
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editForm.fullName}
                          disabled
                          className="flex-1 text-xs font-mono bg-slate-100 border border-slate-200 rounded px-2 py-1 text-slate-600"
                        />
                        <Badge className={editForm.isEnabled ? "bg-green-100 text-green-800 text-xs" : "bg-red-100 text-red-800 text-xs"}>
                          {editForm.isEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">Enabled</label>
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={editForm.isEnabled}
                            onChange={(e) => handleEditChange("isEnabled", e.target.checked)}
                            className="rounded border-slate-200"
                          />
                          <span className="text-slate-700">Enable this repository</span>
                        </label>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-600 block mb-2">Capabilities</label>
                        <div className="space-y-1">
                          {Object.keys(editForm.capabilitiesJson || {}).map((cap) => (
                            <label key={cap} className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={editForm.capabilitiesJson?.[cap] || false}
                                onChange={() => handleCapabilityToggle(cap, true)}
                                className="rounded border-slate-200"
                              />
                              <span className="text-slate-700 font-mono">{cap}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">Notes</label>
                        <textarea
                          value={editForm.notes || ""}
                          onChange={(e) => handleEditChange("notes", e.target.value)}
                          rows={2}
                          className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-slate-400 resize-none"
                        />
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={handleEditSave}
                          className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold px-2 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-3 h-3" /> Lagre
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="flex-1 text-xs px-2 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Avbryt
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-mono font-semibold text-slate-800">{repo.fullName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{repo.notes || "(no notes)"}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {repo.isArchived && <Badge className="bg-slate-100 text-slate-700 text-xs">Archived</Badge>}
                          <Badge className={repo.isEnabled ? "bg-green-100 text-green-800 text-xs" : "bg-red-100 text-red-800 text-xs"}>
                            {repo.isEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <button
                            onClick={() => handleEditStart(repo)}
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-xs text-slate-600">
                        <div>
                          <span className="font-medium text-slate-700">Visibility:</span> {repo.visibility || "—"}
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Branch:</span> {repo.defaultBranch}
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Provider:</span> {repo.provider}
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Verified:</span> {repo.lastVerifiedAt ? new Date(repo.lastVerifiedAt).toLocaleDateString("nb-NO") : "—"}
                        </div>
                      </div>

                      <div className="text-xs">
                        <span className="font-medium text-slate-700 block mb-1">Capabilities:</span>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(repo.capabilitiesJson || {}).map(([cap, enabled]) => (
                            <Badge
                              key={cap}
                              className={`text-xs font-mono ${
                                enabled ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
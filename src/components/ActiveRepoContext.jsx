import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const ActiveRepoContext = createContext(null);

export function ActiveRepoProvider({ children }) {
  const [activeRepo, setActiveRepo] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load enabled GitHub repositories on mount
  useEffect(() => {
    async function loadRepos() {
      try {
        const result = await base44.entities.Repository.filter({
          provider: "github",
          isEnabled: true,
        });
        setRepos(result || []);
      } catch (err) {
        console.warn("Failed to load repositories:", err);
        setRepos([]);
      } finally {
        setLoading(false);
      }
    }
    loadRepos();
  }, []);

  const selectRepo = (repo) => {
    setActiveRepo(repo);
  };

  const clearActiveRepo = () => {
    setActiveRepo(null);
  };

  return (
    <ActiveRepoContext.Provider
      value={{
        activeRepo,
        repos,
        loading,
        selectRepo,
        clearActiveRepo,
      }}
    >
      {children}
    </ActiveRepoContext.Provider>
  );
}

export function useActiveRepo() {
  const context = useContext(ActiveRepoContext);
  if (!context) {
    throw new Error("useActiveRepo must be used within ActiveRepoProvider");
  }
  return context;
}
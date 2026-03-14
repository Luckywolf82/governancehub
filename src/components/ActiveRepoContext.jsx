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

  const refreshRepos = async () => {
    try {
      const result = await base44.entities.Repository.filter({
        provider: "github",
        isEnabled: true,
      });
      const updatedRepos = result || [];
      setRepos(updatedRepos);
      
      // If current activeRepo is no longer in the refreshed list, clear it
      if (activeRepo && !updatedRepos.find(r => r.id === activeRepo.id)) {
        setActiveRepo(null);
      }
    } catch (err) {
      console.warn("Failed to refresh repositories:", err);
    }
  };

  return (
    <ActiveRepoContext.Provider
      value={{
        activeRepo,
        repos,
        loading,
        selectRepo,
        clearActiveRepo,
        refreshRepos,
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
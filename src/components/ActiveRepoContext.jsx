import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const ActiveRepoContext = createContext(null);

export function ActiveRepoProvider({ children }) {
  const [activeRepo, setActiveRepo] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    setIsRefreshing(true);
    try {
      const result = await base44.entities.Repository.filter({
        provider: "github",
        isEnabled: true,
      });
      const updatedRepos = result || [];
      setRepos(updatedRepos);
      
      // Validate activeRepo against updated list using closure-safe reference
      setActiveRepo((currentActiveRepo) => {
        if (currentActiveRepo && !updatedRepos.find(r => r.id === currentActiveRepo.id)) {
          return null;
        }
        return currentActiveRepo;
      });
    } catch (err) {
      console.warn("Failed to refresh repositories:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <ActiveRepoContext.Provider
      value={{
        activeRepo,
        repos,
        loading,
        isRefreshing,
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
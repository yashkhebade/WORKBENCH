import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('');

  const fetchProjects = useCallback(async () => {
    if (!user) return; // Don't fetch if not logged in
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
      if (res.data.length > 0 && !activeProjectId) {
        setActiveProjectId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  }, [activeProjectId, user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <ProjectContext.Provider value={{ projects, activeProjectId, setActiveProjectId, fetchProjects }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProjects = () => useContext(ProjectContext);

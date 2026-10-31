import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

/**
 * Workspaces and the current workspace's projects. Only the selected workspace id is persisted.
 * `status` lets pages tell "still loading" apart from "loaded and empty".
 */
export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      workspaces: [],
      projects: [],
      favorites: [],
      currentId: null,
      status: 'idle',

      async fetchWorkspaces() {
        set({ status: 'loading' });
        const res = await api.get('/workspaces');
        const workspaces = res.data.data.workspaces;
        const stillValid = workspaces.some((w) => w.id === get().currentId);
        set({
          workspaces,
          currentId: stillValid ? get().currentId : (workspaces[0]?.id ?? null),
          status: 'ready',
        });
        await get().fetchProjects();
      },

      async fetchProjects() {
        const { currentId } = get();
        if (!currentId) return set({ projects: [], favorites: [] });
        const [projectsRes, workspaceRes] = await Promise.all([
          api.get(`/workspaces/${currentId}/projects`),
          api.get(`/workspaces/${currentId}`),
        ]);
        set({
          projects: projectsRes.data.data.projects,
          favorites: workspaceRes.data.data.favorites,
        });
      },

      async selectWorkspace(id) {
        set({ currentId: id, projects: [] });
        await get().fetchProjects();
      },

      async createWorkspace(name) {
        const res = await api.post('/workspaces', { name });
        const workspace = res.data.data.workspace;
        set({
          workspaces: [...get().workspaces, workspace],
          currentId: workspace.id,
          projects: [],
        });
        return workspace;
      },

      async toggleFavorite(projectId) {
        const res = await api.post(`/workspaces/${get().currentId}/favorites/${projectId}`);
        set({ favorites: res.data.data.favorites });
      },

      async createProject(input) {
        const res = await api.post(`/workspaces/${get().currentId}/projects`, input);
        const project = res.data.data.project;
        set({ projects: [...get().projects, project] });
        return project;
      },

      reset() {
        set({ workspaces: [], projects: [], favorites: [], currentId: null, status: 'idle' });
      },
    }),
    {
      name: 'teamsync-workspace',
      partialize: (state) => ({ currentId: state.currentId }),
    },
  ),
);

export const selectCurrentWorkspace = (state) =>
  state.workspaces.find((w) => w.id === state.currentId) ?? null;

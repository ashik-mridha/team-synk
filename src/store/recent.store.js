import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_RECENT = 8;

/** Recently opened tasks and projects for the command palette (per-viewer convenience). */
export const useRecentStore = create(
  persist(
    (set) => ({
      items: [],
      push: (item) =>
        set((s) => ({
          items: [item, ...s.items.filter((i) => i.href !== item.href)].slice(0, MAX_RECENT),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: 'teamsync-recent' },
  ),
);

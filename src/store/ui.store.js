import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Shared UI state. Only the sidebar collapse preference is persisted (localStorage is a
 * per-viewer convenience here; it never holds anything sensitive).
 */
export const useUiStore = create(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      paletteOpen: false,
      notificationsOpen: false,
      /** Name of the open global modal (see MODAL) and optional props for it. */
      modal: null,
      modalProps: {},
      /** Bumped when workspace membership changes elsewhere so open member lists refetch. */
      membersVersion: 0,
      /** Invite links by invite id. The raw token is shown once, so this lives in memory only. */
      inviteLinks: {},
      rememberInviteLink: (id, link) =>
        set((s) => ({ inviteLinks: { ...s.inviteLinks, [id]: link } })),
      bumpMembersVersion: () => set((s) => ({ membersVersion: s.membersVersion + 1 })),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
      setNotificationsOpen: (notificationsOpen) => set({ notificationsOpen }),
      openModal: (modal, modalProps = {}) => set({ modal, modalProps, mobileNavOpen: false }),
      closeModal: () => set({ modal: null, modalProps: {} }),
    }),
    {
      name: 'teamsync-ui',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);

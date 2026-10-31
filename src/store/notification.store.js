import { create } from 'zustand';
import { api } from '@/lib/api';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loaded: false,

  async fetch() {
    const res = await api.get('/notifications', { params: { limit: 50 } });
    const { notifications, unreadCount } = res.data.data;
    set({ notifications, unreadCount, loaded: true });
  },

  /** Called for each `notification:new` socket event. */
  receive(notification) {
    if (get().notifications.some((n) => n.id === notification.id)) return;
    set((s) => ({
      notifications: [notification, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    }));
  },

  async markRead(ids) {
    set((s) => ({
      notifications: s.notifications.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)),
    }));
    const res = await api.post('/notifications/read', { ids });
    set({ unreadCount: res.data.data.unreadCount });
  },

  async markAllRead() {
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
    const res = await api.post('/notifications/read', { all: true });
    set({ unreadCount: res.data.data.unreadCount });
  },

  reset() {
    set({ notifications: [], unreadCount: 0, loaded: false });
  },
}));

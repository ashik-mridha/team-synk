'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { SocketEvent } from '@/lib/constants';
import { connectSocket } from '@/lib/socket';
import { useNotificationStore } from '@/store/notification.store';

/** Loads the inbox once and keeps it live: each pushed notification updates the badge and toasts. */
export function useRealtimeNotifications() {
  const router = useRouter();

  useEffect(() => {
    useNotificationStore
      .getState()
      .fetch()
      .catch(() => undefined);
    const socket = connectSocket();

    const onNew = ({ notification }) => {
      useNotificationStore.getState().receive(notification);
      toast(notification.title, {
        action: notification.link
          ? { label: 'View', onClick: () => router.push(notification.link) }
          : undefined,
      });
    };
    // After a reconnect pushes may have been missed, so reload the list.
    const onConnect = () =>
      useNotificationStore
        .getState()
        .fetch()
        .catch(() => undefined);

    socket.on(SocketEvent.NOTIFICATION, onNew);
    socket.io.on('reconnect', onConnect);
    return () => {
      socket.off(SocketEvent.NOTIFICATION, onNew);
      socket.io.off('reconnect', onConnect);
    };
  }, [router]);
}

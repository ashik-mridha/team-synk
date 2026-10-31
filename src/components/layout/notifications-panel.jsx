'use client';

import { Bell, Inbox } from 'lucide-react';
import Link from 'next/link';
import { NotificationItem } from '@/components/dashboard/notification-item';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip } from '@/components/ui/tooltip';
import { useNotificationStore } from '@/store/notification.store';
import { useUiStore } from '@/store/ui.store';

/** Bell + quick panel with the latest notifications; the full list lives on the Inbox page. */
export function NotificationsPanel() {
  const open = useUiStore((s) => s.notificationsOpen);
  const setOpen = useUiStore((s) => s.setNotificationsOpen);
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip content="Notifications">
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          >
            <Bell aria-hidden className="size-4" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span
                aria-hidden
                className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-primary-solid px-1 text-[10px] font-medium leading-4 text-white md:right-0.5 md:top-0.5"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <h2 className="text-sm font-semibold">Notifications</h2>
          <Button
            variant="ghost"
            size="sm"
            disabled={unreadCount === 0}
            onClick={() => markAllRead().catch(() => undefined)}
          >
            Mark all read
          </Button>
        </div>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <Inbox aria-hidden className="size-6 text-subtle" strokeWidth={1.5} />
            <p className="text-sm font-medium">You are all caught up</p>
            <p className="text-xs text-muted">Assignments and mentions will show up here.</p>
          </div>
        ) : (
          <ul className="scrollbar-thin max-h-80 overflow-y-auto">
            {notifications.slice(0, 6).map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                compact
                onNavigate={() => setOpen(false)}
              />
            ))}
          </ul>
        )}
        <div className="border-t border-border p-1.5">
          <Link
            href="/dashboard/inbox"
            onClick={() => setOpen(false)}
            className="flex h-9 items-center justify-center rounded-chip text-sm text-muted hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Open inbox
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

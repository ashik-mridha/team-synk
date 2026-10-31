'use client';

import { AtSign, MessageSquare, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn, timeAgo } from '@/lib/utils';
import { useNotificationStore } from '@/store/notification.store';

const ICONS = { mention: AtSign, assigned: UserPlus, comment: MessageSquare };

/** One notification row; opening it marks it read and navigates to the task. */
export function NotificationItem({ notification, onNavigate, compact = false }) {
  const router = useRouter();
  const Icon = ICONS[notification.type] ?? MessageSquare;

  function open() {
    if (!notification.read) {
      useNotificationStore
        .getState()
        .markRead([notification.id])
        .catch(() => undefined);
    }
    onNavigate?.();
    if (notification.link) router.push(notification.link);
  }

  return (
    <li>
      <button
        type="button"
        onClick={open}
        className={cn(
          'flex w-full items-start gap-3 text-left transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none',
          compact ? 'px-4 py-2.5' : 'px-4 py-3',
        )}
      >
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted">
          <Icon aria-hidden className="size-3.5" strokeWidth={1.5} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn('block text-sm', !notification.read && 'font-medium')}>
            {notification.title}
          </span>
          <span className="block text-xs text-muted">{timeAgo(notification.createdAt)}</span>
        </span>
        {!notification.read && (
          <span aria-label="Unread" className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
        )}
      </button>
    </li>
  );
}

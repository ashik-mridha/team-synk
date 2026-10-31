'use client';

import { Inbox } from 'lucide-react';
import { useState } from 'react';
import { NotificationItem } from '@/components/dashboard/notification-item';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotificationStore } from '@/store/notification.store';

export function InboxPage() {
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const loaded = useNotificationStore((s) => s.loaded);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const [filter, setFilter] = useState('unread');

  const shown = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">Inbox</h1>
        <Button
          variant="outline"
          disabled={unreadCount === 0}
          onClick={() => markAllRead().catch(() => undefined)}
        >
          Mark all read
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="unread">Unread{unreadCount > 0 && ` · ${unreadCount}`}</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {!loaded ? (
        <Skeleton className="h-40 rounded-card" />
      ) : shown.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={filter === 'unread' ? 'Inbox zero' : 'No notifications yet'}
          description="Mentions, assignments and comments on your tasks appear here."
        />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-border">
            {shown.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

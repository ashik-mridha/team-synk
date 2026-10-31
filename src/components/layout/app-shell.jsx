'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { GlobalShortcuts } from '@/components/layout/global-shortcuts';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { ModalHost } from '@/components/modals/modal-host';
import { cn } from '@/lib/utils';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useUiStore } from '@/store/ui.store';
import { useWorkspaceStore } from '@/store/workspace.store';

// Loaded on first open (Ctrl+K), not with the page.
const CommandPalette = dynamic(
  () => import('@/components/layout/command-palette').then((m) => m.CommandPalette),
  { ssr: false },
);

export function AppShell({ children }) {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const paletteOpen = useUiStore((s) => s.paletteOpen);
  useRealtimeNotifications();

  useEffect(() => {
    // Errors are reported by the API client (console + toast).
    useWorkspaceStore
      .getState()
      .fetchWorkspaces()
      .catch(() => undefined);
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />
      <MobileNav />
      <div className={cn('flex min-h-dvh min-w-0 flex-col', !collapsed && 'lg:pl-64')}>
        <Topbar />
        <main className="mx-auto w-full min-w-0 flex-1 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <ModalHost />
      {paletteOpen && <CommandPalette />}
      <GlobalShortcuts />
    </div>
  );
}

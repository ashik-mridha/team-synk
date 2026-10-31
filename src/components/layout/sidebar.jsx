'use client';

import { SidebarContent } from '@/components/layout/sidebar-content';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui.store';

/** Persistent sidebar on large screens; collapsible from the top bar. Smaller screens use a drawer. */
export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        'fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar lg:block',
        collapsed && 'lg:hidden',
      )}
    >
      <SidebarContent />
    </aside>
  );
}

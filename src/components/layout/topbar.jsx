'use client';

import { ChevronRight, Menu, PanelLeft } from 'lucide-react';
import { useParams, usePathname } from 'next/navigation';
import { NotificationsPanel } from '@/components/layout/notifications-panel';
import { SearchBox } from '@/components/layout/search-box';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Tooltip } from '@/components/ui/tooltip';
import { useUiStore } from '@/store/ui.store';
import { selectCurrentWorkspace, useWorkspaceStore } from '@/store/workspace.store';

const SECTION_TITLES = {
  '/dashboard': 'Overview',
  '/dashboard/settings': 'Settings',
  '/dashboard/settings/members': 'Members',
};

function Breadcrumb() {
  const pathname = usePathname();
  const { projectId } = useParams();
  const workspace = useWorkspaceStore(selectCurrentWorkspace);
  const project = useWorkspaceStore((s) => s.projects.find((p) => p.id === projectId));
  const section = project?.name ?? SECTION_TITLES[pathname];

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
      <span className="hidden truncate text-muted sm:inline">{workspace?.name ?? 'TeamSync'}</span>
      {section && (
        <>
          <ChevronRight aria-hidden className="hidden size-3.5 text-subtle sm:block" />
          <span className="truncate font-medium">{section}</span>
        </>
      )}
    </nav>
  );
}

export function Topbar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);

  return (
    <header className="pt-safe sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-1.5 sm:h-12 sm:flex-nowrap sm:px-6 sm:py-0 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu aria-hidden className="size-4" strokeWidth={1.5} />
          </Button>
          <Tooltip content={collapsed ? 'Show sidebar' : 'Hide sidebar'}>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}
              aria-pressed={collapsed}
              onClick={toggleSidebar}
            >
              <PanelLeft aria-hidden className="size-4" strokeWidth={1.5} />
            </Button>
          </Tooltip>
          <Breadcrumb />
        </div>

        <div className="order-3 w-full pb-1 sm:order-none sm:w-56 sm:pb-0 lg:w-64">
          <SearchBox />
        </div>

        <div className="flex items-center gap-1">
          <NotificationsPanel />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

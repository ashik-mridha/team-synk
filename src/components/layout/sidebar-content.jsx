'use client';

import {
  Archive,
  ChartPie,
  ChevronRight,
  CircleDot,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  List,
  Palette,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  Star,
  UserPlus,
  Users,
} from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { SidebarItem } from '@/components/layout/sidebar-item';
import { UserMenu } from '@/components/layout/user-menu';
import { WorkspaceSwitcher } from '@/components/layout/workspace-switcher';
import { ComingSoon } from '@/components/ui/coming-soon';
import { MODAL } from '@/lib/constants';
import { Action, can } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { useMyRole } from '@/hooks/useMyRole';
import { useNotificationStore } from '@/store/notification.store';
import { useUiStore } from '@/store/ui.store';
import { useWorkspaceStore } from '@/store/workspace.store';

function SoonItem({ icon, children }) {
  return (
    <ComingSoon className="w-full">
      <SidebarItem icon={icon} tabIndex={-1} className="pointer-events-none">
        {children}
      </SidebarItem>
    </ComingSoon>
  );
}

function ProjectTree({ project, active, onNavigate }) {
  const pathname = usePathname();
  const listView = useSearchParams().get('view') === 'list';
  const [override, setOverride] = useState(null);
  const expanded = override ?? active;
  const boardHref = `/dashboard/projects/${project.id}`;
  const onBoard = pathname === boardHref;

  return (
    <li>
      <SidebarItem
        onClick={() => setOverride(!expanded)}
        aria-expanded={expanded}
        trailing={
          <ChevronRight
            aria-hidden
            className={cn('!size-3.5 text-subtle transition-transform', expanded && 'rotate-90')}
          />
        }
      >
        <span className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-[3px]"
            style={{ backgroundColor: project.color }}
          />
          <span className="truncate">{project.name}</span>
        </span>
      </SidebarItem>
      {expanded && (
        <ul className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-2">
          <li>
            <SidebarItem
              href={boardHref}
              icon={LayoutDashboard}
              active={onBoard && !listView}
              onClick={onNavigate}
            >
              Board
            </SidebarItem>
          </li>
          <li>
            <SidebarItem
              href={`${boardHref}?view=list`}
              icon={List}
              active={onBoard && listView}
              onClick={onNavigate}
            >
              List
            </SidebarItem>
          </li>
          <li>
            <SoonItem icon={RefreshCcw}>Cycles</SoonItem>
          </li>
          <li>
            <SoonItem icon={Archive}>Archive</SoonItem>
          </li>
        </ul>
      )}
    </li>
  );
}

/** Sidebar body shared by the desktop sidebar and the mobile drawer. */
export function SidebarContent({ onNavigate }) {
  const pathname = usePathname();
  const projects = useWorkspaceStore((s) => s.projects);
  const favorites = useWorkspaceStore((s) => s.favorites);
  const hasWorkspace = useWorkspaceStore((s) => Boolean(s.currentId));
  const unread = useNotificationStore((s) => s.unreadCount);
  const role = useMyRole();
  const { openModal, setPaletteOpen } = useUiStore.getState();

  const run = (fn) => () => {
    onNavigate?.();
    fn();
  };
  const favoriteProjects = projects.filter((p) => favorites.includes(p.id));

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 px-2 pb-2 pt-2">
      <div className="flex items-center gap-1">
        <WorkspaceSwitcher className="flex-1" onNavigate={onNavigate} />
        <UserMenu />
      </div>

      <nav aria-label="Main" className="flex flex-col gap-0.5">
        <SidebarItem
          icon={Search}
          onClick={run(() => setPaletteOpen(true))}
          trailing={<kbd className="font-sans text-xs text-subtle">Ctrl K</kbd>}
        >
          Search
        </SidebarItem>
        <SidebarItem
          href="/dashboard/inbox"
          icon={Inbox}
          active={pathname === '/dashboard/inbox'}
          onClick={onNavigate}
          trailing={
            unread > 0 ? (
              <span
                aria-label={`${unread} unread`}
                className="rounded-chip bg-primary-solid px-1.5 text-xs font-medium text-white"
              >
                {unread > 99 ? '99+' : unread}
              </span>
            ) : null
          }
        >
          Inbox
        </SidebarItem>
        <SoonItem icon={CircleDot}>My issues</SoonItem>
        <SidebarItem
          href="/dashboard"
          icon={LayoutDashboard}
          active={pathname === '/dashboard'}
          onClick={onNavigate}
        >
          Overview
        </SidebarItem>
        <SidebarItem
          href="/dashboard/analytics"
          icon={ChartPie}
          active={pathname === '/dashboard/analytics'}
          onClick={onNavigate}
        >
          Analytics
        </SidebarItem>
      </nav>

      {favoriteProjects.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="px-2 pt-1 text-xs font-medium text-subtle">Favorites</span>
          <ul className="flex flex-col gap-0.5">
            {favoriteProjects.map((project) => (
              <li key={project.id}>
                <SidebarItem
                  href={`/dashboard/projects/${project.id}`}
                  icon={Star}
                  active={pathname === `/dashboard/projects/${project.id}`}
                  onClick={onNavigate}
                >
                  {project.name}
                </SidebarItem>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between px-2 pt-2">
          <span className="text-xs font-medium text-subtle">Projects</span>
          <button
            type="button"
            aria-label="New project"
            disabled={!hasWorkspace || !can(role, Action.CREATE_PROJECT)}
            onClick={run(() => openModal(MODAL.CREATE_PROJECT))}
            className="flex size-11 items-center justify-center rounded-chip text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-40 md:size-7"
          >
            <Plus aria-hidden className="size-4" />
          </button>
        </div>
        <ul className="scrollbar-thin flex flex-col gap-0.5 overflow-y-auto">
          {projects.map((project) => (
            <ProjectTree
              key={project.id}
              project={project}
              active={pathname === `/dashboard/projects/${project.id}`}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
        {hasWorkspace && projects.length === 0 && (
          <p className="px-2 py-1 text-xs text-subtle">No projects yet.</p>
        )}
      </div>

      <div className="flex flex-col gap-0.5 border-t border-border pt-2">
        <SidebarItem
          href="/dashboard/settings/members"
          icon={Users}
          active={pathname === '/dashboard/settings/members'}
          onClick={onNavigate}
        >
          Members
        </SidebarItem>
        <SidebarItem
          href="/dashboard/settings"
          icon={Settings}
          active={pathname === '/dashboard/settings'}
          onClick={onNavigate}
        >
          Settings
        </SidebarItem>
        <SidebarItem
          href="/design"
          icon={Palette}
          active={pathname === '/design'}
          onClick={onNavigate}
        >
          Design system
        </SidebarItem>
        <SidebarItem
          icon={UserPlus}
          disabled={!hasWorkspace || !can(role, Action.MANAGE_INVITES)}
          onClick={run(() => openModal(MODAL.INVITE))}
          className="disabled:pointer-events-none disabled:opacity-40"
        >
          Invite people
        </SidebarItem>
        <SoonItem icon={HelpCircle}>Help &amp; Feedback</SoonItem>
      </div>
    </div>
  );
}

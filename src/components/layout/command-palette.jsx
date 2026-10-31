'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  BarChart3,
  Clock,
  FolderKanban,
  Inbox,
  Keyboard,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings,
  SquarePen,
  UserPlus,
  UserRound,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useRef, useState } from 'react';
import { overlayClasses } from '@/components/ui/modal';
import { StatusIcon } from '@/components/ui/status-icon';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useMyRole } from '@/hooks/useMyRole';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { MODAL } from '@/lib/constants';
import { fuzzyFilter } from '@/lib/fuzzy';
import { Action, can } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { useRecentStore } from '@/store/recent.store';
import { useUiStore } from '@/store/ui.store';
import { useWorkspaceStore } from '@/store/workspace.store';

const MAX_PER_GROUP = 6;

/**
 * Ctrl/Cmd+K palette: fuzzy search over actions, navigation, projects, members and (from the
 * server) tasks, with recent items when the query is empty. Fully keyboard driven.
 */
function PaletteBody({ onDone }) {
  const router = useRouter();
  const { projectId } = useParams();
  const { resolvedTheme, setTheme } = useTheme();
  const role = useMyRole();
  const openModal = useUiStore((s) => s.openModal);
  const projects = useWorkspaceStore((s) => s.projects);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const currentId = useWorkspaceStore((s) => s.currentId);
  const recent = useRecentStore((s) => s.items);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const listRef = useRef(null);
  const debounced = useDebouncedValue(query.trim(), 200);

  useEffect(() => {
    if (!currentId) return;
    let cancelled = false;
    api
      .get(`/workspaces/${currentId}/members`, { silent: true })
      .then((res) => !cancelled && setMembers(res.data.data.members))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [currentId]);

  useEffect(() => {
    if (!currentId || debounced.length < 2) return;
    let cancelled = false;
    api
      .get(`/workspaces/${currentId}/search`, { params: { q: debounced }, silent: true })
      .then((res) => !cancelled && setTasks(res.data.data.tasks))
      .catch(() => !cancelled && setTasks([]));
    return () => {
      cancelled = true;
    };
  }, [debounced, currentId]);

  const groups = useMemo(() => {
    const go = (href) => () => router.push(href);
    const canWrite = can(role, Action.WRITE_TASKS);

    const actions = [
      projectId &&
        canWrite && {
          id: 'task',
          label: 'Create task',
          icon: SquarePen,
          run: () => openModal(MODAL.CREATE_TASK),
        },
      can(role, Action.CREATE_PROJECT) && {
        id: 'project',
        label: 'Create project',
        icon: FolderKanban,
        run: () => openModal(MODAL.CREATE_PROJECT),
      },
      {
        id: 'workspace',
        label: 'Create workspace',
        icon: Plus,
        run: () => openModal(MODAL.CREATE_WORKSPACE),
      },
      can(role, Action.MANAGE_INVITES) && {
        id: 'invite',
        label: 'Invite people',
        icon: UserPlus,
        run: () => openModal(MODAL.INVITE),
      },
      {
        id: 'theme',
        label: `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`,
        icon: Moon,
        run: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
      },
      {
        id: 'shortcuts',
        label: 'Keyboard shortcuts',
        icon: Keyboard,
        run: () => openModal(MODAL.SHORTCUTS),
      },
      {
        id: 'logout',
        label: 'Log out',
        icon: LogOut,
        run: async () => {
          await authClient.signOut().catch(() => undefined);
          useWorkspaceStore.getState().reset();
          window.location.replace('/login');
        },
      },
    ].filter(Boolean);

    const navigation = [
      { id: 'overview', label: 'Go to overview', icon: LayoutDashboard, run: go('/dashboard') },
      { id: 'inbox', label: 'Go to inbox', icon: Inbox, run: go('/dashboard/inbox') },
      {
        id: 'analytics',
        label: 'Go to analytics',
        icon: BarChart3,
        run: go('/dashboard/analytics'),
      },
      {
        id: 'members',
        label: 'Go to members and roles',
        icon: Users,
        run: go('/dashboard/settings/members'),
      },
      { id: 'settings', label: 'Go to settings', icon: Settings, run: go('/dashboard/settings') },
    ];

    const switching = [
      ...projects.map((p) => ({
        id: `project-${p.id}`,
        label: p.name,
        hint: 'Project',
        icon: FolderKanban,
        run: go(`/dashboard/projects/${p.id}`),
      })),
      ...workspaces
        .filter((w) => w.id !== currentId)
        .map((w) => ({
          id: `ws-${w.id}`,
          label: `Switch to ${w.name}`,
          hint: 'Workspace',
          icon: Users,
          run: async () => {
            await useWorkspaceStore.getState().selectWorkspace(w.id);
            router.push('/dashboard');
          },
        })),
    ];

    const people = members.map((m) => ({
      id: `member-${m.userId}`,
      label: m.name,
      hint: m.email,
      icon: UserRound,
      run: go('/dashboard/settings/members'),
    }));

    const taskItems = tasks.map((t) => ({
      id: `task-${t.id}`,
      label: t.title,
      icon: () => <StatusIcon status={t.status} />,
      run: go(`/dashboard/projects/${t.project}?task=${t.id}`),
    }));

    if (!query.trim()) {
      return [
        {
          title: 'Recent',
          items: recent.map((r) => ({
            id: `recent-${r.href}`,
            label: r.label,
            icon: r.type === 'task' ? Clock : FolderKanban,
            run: go(r.href),
          })),
        },
        { title: 'Actions', items: actions },
        { title: 'Go to', items: navigation },
      ].filter((g) => g.items.length);
    }

    const pick = (items) =>
      fuzzyFilter(items, query, (i) => `${i.label} ${i.hint ?? ''}`).slice(0, MAX_PER_GROUP);
    return [
      { title: 'Tasks', items: taskItems },
      { title: 'Actions', items: pick(actions) },
      { title: 'Go to', items: pick(navigation) },
      { title: 'Projects and workspaces', items: pick(switching) },
      { title: 'People', items: pick(people) },
    ].filter((g) => g.items.length);
  }, [
    query,
    tasks,
    members,
    projects,
    workspaces,
    currentId,
    recent,
    role,
    projectId,
    router,
    openModal,
    resolvedTheme,
    setTheme,
  ]);

  const flat = groups.flatMap((g) => g.items);

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [index]);

  function runCommand(item) {
    onDone();
    item.run();
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIndex((i) => Math.min(i + 1, flat.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' && flat[index]) {
      event.preventDefault();
      runCommand(flat[index]);
    }
  }

  let position = -1;
  return (
    <>
      <div className="flex items-center gap-2 border-b border-border px-3">
        <Search aria-hidden className="size-4 text-muted" strokeWidth={1.5} />
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search tasks, projects, people and actions…"
          aria-label="Command"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          className="h-12 flex-1 bg-transparent text-sm text-foreground placeholder:text-subtle focus:outline-none"
        />
      </div>
      <div
        ref={listRef}
        id="palette-list"
        role="listbox"
        aria-label="Results"
        className="scrollbar-thin max-h-96 overflow-y-auto p-1"
      >
        {flat.length === 0 && (
          <p className="px-3 py-8 text-center text-xs text-muted">No results for “{query}”</p>
        )}
        {groups.map((group) => (
          <div key={group.title} role="group" aria-label={group.title}>
            <p className="px-2 pb-1 pt-2 text-xs font-medium text-subtle">{group.title}</p>
            {group.items.map((item) => {
              position += 1;
              const itemIndex = position;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={itemIndex === index}
                  onClick={() => runCommand(item)}
                  onMouseMove={() => setIndex(itemIndex)}
                  className={cn(
                    'flex h-11 w-full items-center gap-2.5 rounded-chip px-2 text-left text-sm md:h-9',
                    itemIndex === index ? 'bg-surface-muted text-foreground' : 'text-muted',
                  )}
                >
                  <Icon aria-hidden className="size-4 shrink-0" strokeWidth={1.5} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.hint && <span className="shrink-0 text-xs text-subtle">{item.hint}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

/** The body mounts only while open, so each open starts with a clean query. */
export function CommandPalette() {
  const setOpen = useUiStore((s) => s.setPaletteOpen);

  return (
    <DialogPrimitive.Root open onOpenChange={(next) => !next && setOpen(false)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={overlayClasses} />
        <DialogPrimitive.Content
          aria-label="Command palette"
          className="fixed left-1/2 top-[12vh] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-card border border-border-strong bg-elevated shadow-overlay focus-visible:outline-none data-[state=open]:animate-fade-in"
        >
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Type to search, use the arrow keys to move and Enter to run.
          </DialogPrimitive.Description>
          <PaletteBody onDone={() => setOpen(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

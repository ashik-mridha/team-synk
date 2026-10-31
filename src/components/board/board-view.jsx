'use client';

import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Check, Columns3, List, Plus, SlidersHorizontal, Star } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ActiveFilters, FilterMenu } from '@/components/board/board-filters';
import { BoardColumn } from '@/components/board/board-column';
import { SelectionBar } from '@/components/board/selection-bar';
import { TaskCardView } from '@/components/board/task-card';
import { AvatarGroup } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { GROUPS, VIEWS, useBoardFilters } from '@/hooks/useBoardFilters';
import { useBoard } from '@/hooks/useBoard';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { authClient } from '@/lib/auth-client';
import { MODAL, STATUS_LABELS } from '@/lib/constants';
import { Action, can } from '@/lib/permissions';
import { COLUMNS, SORTS, sortTasks } from '@/lib/tasks';
import { useRecentStore } from '@/store/recent.store';
import { useUiStore } from '@/store/ui.store';
import { useWorkspaceStore } from '@/store/workspace.store';

// Heavy, rarely-needed parts load on demand to keep the first board render light.
const lazy = (loader, name) => dynamic(() => loader().then((m) => m[name]), { ssr: false });
const TaskDrawer = lazy(() => import('@/components/board/task-drawer'), 'TaskDrawer');
const ListView = lazy(() => import('@/components/board/list-view'), 'ListView');
const CreateTaskModal = lazy(
  () => import('@/components/board/create-task-modal'),
  'CreateTaskModal',
);

const SORT_LABELS = {
  [SORTS.MANUAL]: 'Manual',
  [SORTS.PRIORITY]: 'Priority',
  [SORTS.DUE]: 'Due date',
};
const GROUP_LABELS = {
  [GROUPS.STATUS]: 'Status',
  [GROUPS.ASSIGNEE]: 'Assignee',
  [GROUPS.PRIORITY]: 'Priority',
  [GROUPS.LABEL]: 'Label',
};

function PickItem({ checked, onSelect, children }) {
  return (
    <DropdownMenuItem onSelect={onSelect}>
      <span className="flex-1">{children}</span>
      {checked && <Check aria-hidden className="text-primary-text" />}
    </DropdownMenuItem>
  );
}

function ViewSwitch({ view, onChange }) {
  const options = [
    { value: VIEWS.BOARD, label: 'Board', icon: Columns3 },
    { value: VIEWS.LIST, label: 'List', icon: List },
  ];
  return (
    <div role="group" aria-label="View" className="flex rounded-input border border-border p-0.5">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={view === value}
          onClick={() => onChange(value)}
          className={
            'flex h-10 items-center gap-1.5 rounded-chip px-2.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:h-7 ' +
            (view === value
              ? 'bg-surface-muted text-foreground'
              : 'text-muted hover:text-foreground')
          }
        >
          <Icon aria-hidden className="size-3.5" strokeWidth={1.5} />
          {label}
        </button>
      ))}
    </div>
  );
}

export function BoardView() {
  const { projectId } = useParams();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();
  const myId = session?.user.id;

  const board = useBoard(projectId);
  const { project, role, tasks, members, membersById, state, presence } = board;
  const { filters, update, togglePriority, clearAll, activeCount, apply } = useBoardFilters();

  const modal = useUiStore((s) => s.modal);
  const modalProps = useUiStore((s) => s.modalProps);
  const openModal = useUiStore((s) => s.openModal);
  const closeModal = useUiStore((s) => s.closeModal);
  const favorites = useWorkspaceStore((s) => s.favorites);
  const toggleFavorite = useWorkspaceStore((s) => s.toggleFavorite);
  const pushRecent = useRecentStore((s) => s.push);

  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [activeId, setActiveId] = useState(null);
  const [dropIndicator, setDropIndicator] = useState(null);
  const [queryDraft, setQueryDraft] = useState(filters.query);
  const debouncedQuery = useDebouncedValue(queryDraft, 300);

  const canWrite = can(role, Action.WRITE_TASKS);
  const openTaskId = searchParams.get('task');
  const manual = filters.sort === SORTS.MANUAL;

  useEffect(() => {
    if (debouncedQuery !== filters.query) update({ q: debouncedQuery });
  }, [debouncedQuery, filters.query, update]);

  // Escape clears a multi-selection.
  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && setSelectedIds(new Set());
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (project) {
      pushRecent({
        href: `/dashboard/projects/${project.id}`,
        label: project.name,
        type: 'project',
      });
    }
  }, [project, pushRecent]);

  const openTask = useMemo(
    () => tasks.find((t) => t.id === openTaskId) ?? null,
    [tasks, openTaskId],
  );
  useEffect(() => {
    if (openTask && project) {
      pushRecent({
        href: `/dashboard/projects/${project.id}?task=${openTask.id}`,
        label: `${project.key}-${openTask.number} ${openTask.title}`,
        type: 'task',
      });
    }
  }, [openTask?.id, project, pushRecent]); // eslint-disable-line react-hooks/exhaustive-deps

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
  );

  const visibleTasks = useMemo(() => apply(tasks, myId), [apply, tasks, myId]);
  const columns = useMemo(
    () =>
      Object.fromEntries(
        COLUMNS.map((c) => [
          c.status,
          sortTasks(
            visibleTasks.filter((t) => t.status === c.status),
            filters.sort,
          ),
        ]),
      ),
    [visibleTasks, filters.sort],
  );
  const labels = useMemo(() => [...new Set(tasks.flatMap((t) => t.labels ?? []))].sort(), [tasks]);
  const tasksById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);

  const setOpenTask = useCallback((id) => update({ task: id }), [update]);
  const toggleSelect = useCallback((id) => {
    setSelectedIds((ids) => {
      const next = new Set(ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const { updateTasks, moveTask, deleteTask } = board;
  const moveTasks = useCallback((ids, status) => updateTasks(ids, { status }), [updateTasks]);

  async function duplicate(task) {
    const copy = await board.createTask({
      title: `${task.title} (copy)`,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      labels: task.labels,
      dueDate: task.dueDate,
    });
    toast.success(`Duplicated as ${project.key}-${copy.number}`);
    setOpenTask(copy.id);
  }

  async function deleteSelected() {
    const ids = [...selectedIds];
    setSelectedIds(new Set());
    await Promise.all(ids.map((id) => deleteTask(id)));
  }

  /** Where a dragged card would land: before/after a hovered card, or at the end of a column. */
  function dropTarget({ active, collisions }) {
    const hit = collisions?.find((c) => c.id !== active.id && tasksById.has(c.id));
    if (hit) {
      const target = tasksById.get(hit.id);
      const column = columns[target.status].filter((t) => t.id !== active.id);
      const index = column.findIndex((t) => t.id === target.id);
      const rect = hit.data?.droppableContainer?.rect.current;
      const dragged = active.rect.current.translated;
      const before =
        !rect || !dragged || dragged.top + dragged.height / 2 < rect.top + rect.height / 2;
      return before
        ? {
            status: target.status,
            afterId: column[index - 1]?.id ?? null,
            beforeId: target.id,
            indicator: { taskId: target.id, position: 'before' },
          }
        : {
            status: target.status,
            afterId: target.id,
            beforeId: column[index + 1]?.id ?? null,
            indicator: { taskId: target.id, position: 'after' },
          };
    }
    const status = collisions?.find((c) => COLUMNS.some((col) => col.status === c.id))?.id;
    if (!status) return null;
    const column = columns[status].filter((t) => t.id !== active.id);
    return { status, afterId: column.at(-1)?.id ?? null, beforeId: null, indicator: null };
  }

  function handleDragEnd(event) {
    setActiveId(null);
    setDropIndicator(null);
    const task = tasksById.get(event.active.id);
    const target = dropTarget(event);
    if (!task || !target) return;

    const ids = selectedIds.has(task.id) && selectedIds.size > 1 ? [...selectedIds] : [task.id];
    if (ids.length > 1) {
      if (target.status !== task.status) moveTasks(ids, target.status);
      return;
    }
    // With a non-manual sort, positions are computed from data, so only the column can change.
    if (!manual) {
      if (target.status !== task.status) moveTasks([task.id], target.status);
      return;
    }
    if (target.status === task.status && target.afterId === null && target.beforeId === null)
      return;
    moveTask(task.id, target);
  }

  const announcements = {
    onDragStart: ({ active }) => `Picked up ${tasksById.get(active.id)?.title}.`,
    onDragOver: ({ active, over }) =>
      over
        ? `${tasksById.get(active.id)?.title} is over ${STATUS_LABELS[over.id] ?? 'another card'}.`
        : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${tasksById.get(active.id)?.title} was dropped on ${STATUS_LABELS[over.id] ?? 'another card'}.`
        : `${tasksById.get(active.id)?.title} was dropped.`,
    onDragCancel: ({ active }) => `Move of ${tasksById.get(active.id)?.title} cancelled.`,
  };

  if (state === 'loading') {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-56" />
        <div className="flex gap-6">
          {COLUMNS.map((c) => (
            <Skeleton key={c.status} className="h-64 w-80 rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  if (state === 'error' || !project) {
    return (
      <EmptyState
        icon={Plus}
        title="Project not found"
        description="It may have been deleted, or you may not have access to it."
      />
    );
  }

  const isFavorite = favorites.includes(project.id);
  const online = presence.map((p) => ({ name: p.name, src: p.image ?? undefined, online: true }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-sm font-medium">{filters.view === VIEWS.LIST ? 'List' : 'Board'}</h1>
        <span className="text-sm text-muted" aria-label={`${visibleTasks.length} tasks`}>
          {visibleTasks.length}
        </span>

        <FilterMenu
          filters={filters}
          activeCount={activeCount - (filters.query ? 1 : 0)}
          members={members}
          labels={labels}
          onTogglePriority={togglePriority}
          onUpdate={update}
          onClear={() => {
            clearAll();
            setQueryDraft('');
          }}
        />
        <ActiveFilters
          filters={filters}
          membersById={membersById}
          onTogglePriority={togglePriority}
          onUpdate={update}
        />
        <Input
          type="search"
          value={queryDraft}
          onChange={(e) => setQueryDraft(e.target.value)}
          placeholder="Filter by title"
          aria-label="Filter by title"
          className="hidden w-40 sm:block md:h-7 md:text-xs"
        />

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {online.length > 0 && (
            <span
              className="mr-1 flex items-center"
              aria-label={`${online.length} online on this board`}
            >
              <AvatarGroup users={online} max={4} size="xs" />
            </span>
          )}
          <ViewSwitch
            view={filters.view}
            onChange={(view) => update({ view: view === VIEWS.BOARD ? null : view })}
          />
          <DropdownMenu>
            <Tooltip content="Display options">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Display options">
                  <SlidersHorizontal aria-hidden className="size-4" strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
            </Tooltip>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort cards by</DropdownMenuLabel>
              {Object.values(SORTS).map((value) => (
                <PickItem
                  key={value}
                  checked={filters.sort === value}
                  onSelect={() => update({ sort: value === SORTS.MANUAL ? null : value })}
                >
                  {SORT_LABELS[value]}
                </PickItem>
              ))}
              {filters.view === VIEWS.LIST && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Group list by</DropdownMenuLabel>
                  {Object.values(GROUPS).map((value) => (
                    <PickItem
                      key={value}
                      checked={filters.group === value}
                      onSelect={() => update({ group: value === GROUPS.STATUS ? null : value })}
                    >
                      {GROUP_LABELS[value]}
                    </PickItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip content={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={isFavorite}
              onClick={() => toggleFavorite(project.id).catch(() => undefined)}
            >
              <Star
                aria-hidden
                className={isFavorite ? 'size-4 fill-warning text-warning' : 'size-4'}
                strokeWidth={1.5}
              />
            </Button>
          </Tooltip>
          {canWrite && (
            <Tooltip content="New task (C)">
              <Button
                size="icon"
                aria-label="New task"
                onClick={() => openModal(MODAL.CREATE_TASK)}
              >
                <Plus aria-hidden className="size-4" />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {filters.view === VIEWS.LIST ? (
        <ListView
          tasks={sortTasks(visibleTasks, filters.sort)}
          group={filters.group}
          projectKey={project.key}
          members={members}
          membersById={membersById}
          selectedIds={selectedIds}
          canWrite={canWrite}
          onOpen={setOpenTask}
          onToggleSelect={toggleSelect}
          onUpdate={updateTasks}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          accessibility={{ announcements }}
          onDragStart={({ active }) => setActiveId(active.id)}
          onDragOver={(event) =>
            setDropIndicator(manual ? (dropTarget(event)?.indicator ?? null) : null)
          }
          onDragCancel={() => {
            setActiveId(null);
            setDropIndicator(null);
          }}
          onDragEnd={handleDragEnd}
        >
          <div className="scrollbar-thin relative -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-24 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:snap-none">
            {COLUMNS.map((column) => (
              <BoardColumn
                key={column.status}
                status={column.status}
                title={column.title}
                tasks={columns[column.status]}
                projectKey={project.key}
                membersById={membersById}
                selectedIds={selectedIds}
                canWrite={canWrite}
                dropIndicator={dropIndicator}
                onAdd={() => openModal(MODAL.CREATE_TASK, { status: column.status })}
                onSelectAll={() => setSelectedIds(new Set(columns[column.status].map((t) => t.id)))}
                onOpen={setOpenTask}
                onToggleSelect={toggleSelect}
                onMove={moveTasks}
                onDelete={deleteTask}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={{ duration: 160 }}>
            {activeId && tasksById.get(activeId) && (
              <TaskCardView
                task={tasksById.get(activeId)}
                projectKey={project.key}
                assignee={membersById.get(tasksById.get(activeId).assignee)}
                lifted
              />
            )}
          </DragOverlay>
        </DndContext>
      )}

      {canWrite && selectedIds.size >= 2 && (
        <SelectionBar
          count={selectedIds.size}
          members={members}
          onMove={(status) => moveTasks([...selectedIds], status)}
          onAssign={(assignee) => updateTasks([...selectedIds], { assignee })}
          onPriority={(priority) => updateTasks([...selectedIds], { priority })}
          onDelete={deleteSelected}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      {modal === MODAL.CREATE_TASK && canWrite && (
        <CreateTaskModal
          open
          onOpenChange={(open) => !open && closeModal()}
          initialStatus={modalProps.status}
          members={members}
          onCreate={async (input) => {
            await board.createTask(input);
            toast.success('Task created');
          }}
        />
      )}

      {openTask && (
        <TaskDrawer
          task={openTask}
          project={project}
          members={members}
          membersById={membersById}
          presence={presence}
          myId={myId}
          canWrite={canWrite}
          onClose={() => setOpenTask(null)}
          onUpdate={(id, patch) => updateTasks([id], patch)}
          onDelete={async (id) => {
            setOpenTask(null);
            await deleteTask(id);
          }}
          onDuplicate={duplicate}
          setViewing={board.setViewing}
        />
      )}
    </div>
  );
}

'use client';

import { useDroppable } from '@dnd-kit/core';
import { MoreHorizontal, Plus } from 'lucide-react';
import { TaskCard } from '@/components/board/task-card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusIcon } from '@/components/ui/status-icon';
import { cn } from '@/lib/utils';

/** Column header: status icon, title, muted count, "+" and "..." with a thin divider below. */
export function ColumnHeader({ status, title, count, onAdd, onSelectAll }) {
  return (
    <div className="flex items-center gap-2 border-b border-border pb-2">
      <StatusIcon status={status} />
      <h2 className="text-sm font-medium">{title}</h2>
      <span className="text-sm text-muted">{count}</span>
      <div className="ml-auto flex items-center">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Add task to ${title}`}
          onClick={onAdd}
          disabled={!onAdd}
        >
          <Plus aria-hidden className="size-4" strokeWidth={1.5} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`${title} column options`}>
              <MoreHorizontal aria-hidden className="size-4" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled={!onAdd} onSelect={onAdd}>
              Add task
            </DropdownMenuItem>
            <DropdownMenuItem disabled={count === 0} onSelect={onSelectAll}>
              Select all in column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function BoardColumn({
  status,
  title,
  tasks,
  projectKey,
  membersById,
  selectedIds,
  canWrite,
  dropIndicator,
  onAdd,
  onSelectAll,
  onOpen,
  onToggleSelect,
  onMove,
  onDelete,
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      aria-label={title}
      className="flex w-[85vw] max-w-[360px] shrink-0 snap-center flex-col gap-3 sm:w-[320px] xl:w-auto xl:max-w-none xl:flex-1 xl:shrink"
    >
      <ColumnHeader
        status={status}
        title={title}
        count={tasks.length}
        onAdd={canWrite ? onAdd : undefined}
        onSelectAll={onSelectAll}
      />
      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-32 flex-1 flex-col gap-2 rounded-card transition-colors duration-150',
          isOver && 'bg-primary/[0.05] outline-dashed outline-1 outline-primary/30',
        )}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            projectKey={projectKey}
            assignee={membersById.get(task.assignee)}
            selected={selectedIds.has(task.id)}
            canWrite={canWrite}
            indicator={dropIndicator?.taskId === task.id ? dropIndicator.position : null}
            onOpen={onOpen}
            onToggleSelect={onToggleSelect}
            onMove={onMove}
            onDelete={onDelete}
          />
        ))}
        {tasks.length === 0 && (
          <p className="px-1 py-3 text-xs text-subtle">
            {canWrite ? 'No tasks. Drop one here or press +.' : 'No tasks.'}
          </p>
        )}
      </div>
    </section>
  );
}

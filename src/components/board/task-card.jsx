'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import {
  CalendarDays,
  CheckSquare,
  MessageSquare,
  MoreHorizontal,
  SignalHigh,
  SignalLow,
  SignalMedium,
} from 'lucide-react';
import { memo, useId } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Chip } from '@/components/ui/chip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusIcon } from '@/components/ui/status-icon';
import { PRIORITY_LABELS, Priority } from '@/lib/constants';
import { COLUMNS, formatDueDate, isOverdue } from '@/lib/tasks';
import { cn } from '@/lib/utils';

const PRIORITY_ICONS = {
  [Priority.LOW]: SignalLow,
  [Priority.MEDIUM]: SignalMedium,
  [Priority.HIGH]: SignalHigh,
};

const MAX_LABELS = 2;

/** Presentational card (also used by the drag overlay and the design page). */
export function TaskCardView({
  task,
  projectKey,
  assignee,
  selected = false,
  dragging = false,
  lifted = false,
  indicator = null,
  titleId,
  menu,
  className,
  ...props
}) {
  const PriorityIcon = PRIORITY_ICONS[task.priority];
  const subtasks = task.subtasks ?? [];
  const labels = task.labels ?? [];
  const doneSubtasks = subtasks.filter((s) => s.done).length;

  return (
    <div
      className={cn(
        'group relative flex cursor-pointer select-none flex-col gap-2.5 rounded-card border border-border bg-surface p-3 text-left transition-colors duration-150 hover:bg-surface-muted',
        selected && 'border-primary/40 bg-primary/[0.12] hover:bg-primary/[0.16]',
        dragging && 'opacity-40',
        lifted && 'rotate-[1.2deg] cursor-grabbing border-border-strong bg-elevated shadow-lifted',
        className,
      )}
      {...props}
    >
      {indicator && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-0 h-0.5 rounded-full bg-primary',
            indicator === 'before' ? '-top-[5px]' : '-bottom-[5px]',
          )}
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <p id={titleId} className="min-w-0 break-words text-sm font-medium leading-snug">
          {task.title}
        </p>
        {assignee && <Avatar name={assignee.name} src={assignee.image ?? undefined} size="sm" />}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {menu}
        <Chip title={`Priority: ${PRIORITY_LABELS[task.priority]}`}>
          <PriorityIcon aria-hidden className="size-3.5" strokeWidth={1.5} />
          <span className="sr-only">Priority: </span>
          {PRIORITY_LABELS[task.priority]}
        </Chip>
        <Chip className="font-mono">
          <span aria-hidden className="size-1.5 rounded-[2px] bg-primary" />
          {projectKey}-{task.number}
        </Chip>
        {labels.slice(0, MAX_LABELS).map((label) => (
          <Chip key={label}>
            <span aria-hidden className="size-1.5 rounded-full bg-info" />
            {label}
          </Chip>
        ))}
        {labels.length > MAX_LABELS && <Chip>+{labels.length - MAX_LABELS}</Chip>}
        {subtasks.length > 0 && (
          <Chip title="Subtasks done">
            <CheckSquare aria-hidden className="size-3.5" strokeWidth={1.5} />
            {doneSubtasks}/{subtasks.length}
          </Chip>
        )}
        {task.commentCount > 0 && (
          <Chip title="Comments">
            <MessageSquare aria-hidden className="size-3.5" strokeWidth={1.5} />
            <span className="sr-only">Comments: </span>
            {task.commentCount}
          </Chip>
        )}
        {task.dueDate && (
          <Chip className={cn(isOverdue(task) && 'border-danger/40 text-danger-text')}>
            <CalendarDays aria-hidden className="size-3.5" strokeWidth={1.5} />
            {formatDueDate(task.dueDate)}
          </Chip>
        )}
      </div>
    </div>
  );
}

/** The "..." chip and its menu: open, select, move between columns, delete. */
function TaskMenu({ task, selected, canWrite, onOpen, onToggleSelect, onMove, onDelete }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Chip
          as="button"
          aria-label={`Actions for ${task.title}`}
          className="px-1.5"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <MoreHorizontal aria-hidden className="size-3.5" strokeWidth={1.5} />
        </Chip>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={onOpen}>Open</DropdownMenuItem>
        <DropdownMenuItem onSelect={onToggleSelect}>
          {selected ? 'Deselect' : 'Select'}
        </DropdownMenuItem>
        {canWrite && (
          <>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                {COLUMNS.map((column) => (
                  <DropdownMenuItem
                    key={column.status}
                    disabled={column.status === task.status}
                    onSelect={() => onMove(column.status)}
                  >
                    <StatusIcon status={column.status} /> {column.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              Delete task
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TaskCardInner({
  task,
  projectKey,
  assignee,
  selected,
  canWrite,
  indicator,
  onOpen,
  onToggleSelect,
  onMove,
  onDelete,
}) {
  const drag = useDraggable({ id: task.id, disabled: !canWrite });
  const drop = useDroppable({ id: task.id });
  const titleId = useId();

  function setRef(node) {
    drag.setNodeRef(node);
    drop.setNodeRef(node);
  }

  function handleClick(event) {
    if (event.shiftKey || event.metaKey || event.ctrlKey) onToggleSelect(task.id);
    else onOpen(task.id);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && event.target === event.currentTarget) onOpen(task.id);
  }

  return (
    <TaskCardView
      ref={setRef}
      task={task}
      projectKey={projectKey}
      assignee={assignee}
      selected={selected}
      dragging={drag.isDragging}
      indicator={indicator}
      data-task-title={task.title}
      titleId={titleId}
      aria-labelledby={titleId}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      menu={
        <TaskMenu
          task={task}
          selected={selected}
          canWrite={canWrite}
          onOpen={() => onOpen(task.id)}
          onToggleSelect={() => onToggleSelect(task.id)}
          onMove={(status) => onMove([task.id], status)}
          onDelete={() => onDelete(task.id)}
        />
      }
      {...drag.attributes}
      {...drag.listeners}
    />
  );
}

/** Memoised: a board of hundreds of cards re-renders only the ones whose props changed. */
export const TaskCard = memo(TaskCardInner);

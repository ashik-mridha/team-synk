'use client';

import { ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Chip } from '@/components/ui/chip';
import { StatusIcon } from '@/components/ui/status-icon';
import { GROUPS } from '@/hooks/useBoardFilters';
import { PRIORITY_LABELS, Priority, STATUS_LABELS, TaskStatus } from '@/lib/constants';
import { formatDueDate, isOverdue } from '@/lib/tasks';
import { cn } from '@/lib/utils';

const inlineSelect =
  'h-8 max-w-full rounded-chip border border-transparent bg-transparent px-1.5 text-xs text-muted hover:border-border hover:bg-surface-muted focus-visible:border-primary focus-visible:outline-none disabled:cursor-default disabled:hover:border-transparent disabled:hover:bg-transparent';

function buildGroups(tasks, group, membersById) {
  const buckets = new Map();
  const add = (key, label, task) => {
    if (!buckets.has(key)) buckets.set(key, { key, label, tasks: [] });
    buckets.get(key).tasks.push(task);
  };

  if (group === GROUPS.STATUS) {
    for (const status of Object.values(TaskStatus))
      buckets.set(status, { key: status, label: STATUS_LABELS[status], status, tasks: [] });
  }
  if (group === GROUPS.PRIORITY) {
    for (const p of [Priority.HIGH, Priority.MEDIUM, Priority.LOW])
      buckets.set(p, { key: p, label: PRIORITY_LABELS[p], tasks: [] });
  }

  for (const task of tasks) {
    if (group === GROUPS.STATUS) add(task.status, STATUS_LABELS[task.status], task);
    else if (group === GROUPS.PRIORITY) add(task.priority, PRIORITY_LABELS[task.priority], task);
    else if (group === GROUPS.ASSIGNEE) {
      add(task.assignee ?? 'none', membersById.get(task.assignee)?.name ?? 'Unassigned', task);
    } else if (task.labels.length === 0) add('none', 'No label', task);
    else task.labels.forEach((label) => add(label, label, task));
  }
  return [...buckets.values()];
}

function Row({
  task,
  projectKey,
  members,
  membersById,
  selected,
  canWrite,
  onOpen,
  onToggleSelect,
  onUpdate,
}) {
  const assignee = membersById.get(task.assignee);

  return (
    <li
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-3 py-2 last:border-b-0 hover:bg-surface-muted/60 md:flex-nowrap',
        selected && 'bg-primary/[0.12] hover:bg-primary/[0.16]',
      )}
    >
      <StatusIcon status={task.status} />
      <span className="w-16 shrink-0 font-mono text-xs text-muted">
        {projectKey}-{task.number}
      </span>
      <button
        type="button"
        onClick={(e) =>
          e.shiftKey || e.metaKey || e.ctrlKey ? onToggleSelect(task.id) : onOpen(task.id)
        }
        className="min-w-0 flex-1 basis-full truncate rounded-chip text-left text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:basis-0"
      >
        {task.title}
      </button>
      <div className="flex flex-wrap items-center gap-1.5">
        {task.labels.slice(0, 2).map((label) => (
          <Chip key={label}>{label}</Chip>
        ))}
      </div>
      <select
        aria-label={`Priority of ${task.title}`}
        value={task.priority}
        disabled={!canWrite}
        onChange={(e) => onUpdate([task.id], { priority: e.target.value })}
        className={inlineSelect}
      >
        {Object.values(Priority).map((value) => (
          <option key={value} value={value}>
            {PRIORITY_LABELS[value]}
          </option>
        ))}
      </select>
      <select
        aria-label={`Status of ${task.title}`}
        value={task.status}
        disabled={!canWrite}
        onChange={(e) => onUpdate([task.id], { status: e.target.value })}
        className={inlineSelect}
      >
        {Object.values(TaskStatus).map((value) => (
          <option key={value} value={value}>
            {STATUS_LABELS[value]}
          </option>
        ))}
      </select>
      <span className="flex min-w-[8.5rem] items-center gap-1.5">
        {assignee && <Avatar name={assignee.name} src={assignee.image ?? undefined} size="xs" />}
        <select
          aria-label={`Assignee of ${task.title}`}
          value={task.assignee ?? ''}
          disabled={!canWrite}
          onChange={(e) => onUpdate([task.id], { assignee: e.target.value || null })}
          className={cn(inlineSelect, 'w-28')}
        >
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.name}
            </option>
          ))}
        </select>
      </span>
      <span
        className={cn(
          'w-14 shrink-0 text-right text-xs',
          isOverdue(task) ? 'text-danger-text' : 'text-muted',
        )}
      >
        {task.dueDate ? formatDueDate(task.dueDate) : ''}
      </span>
    </li>
  );
}

/** Grouped table with inline editing. Groups collapse; Shift/Cmd+click selects. */
export function ListView({
  tasks,
  group,
  projectKey,
  members,
  membersById,
  selectedIds,
  canWrite,
  onOpen,
  onToggleSelect,
  onUpdate,
}) {
  const [collapsed, setCollapsed] = useState(() => new Set());
  const groups = useMemo(() => buildGroups(tasks, group, membersById), [tasks, group, membersById]);

  const toggle = (key) =>
    setCollapsed((set) => {
      const next = new Set(set);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <section
          key={g.key}
          aria-label={g.label}
          className="overflow-hidden rounded-card border border-border"
        >
          <h2 className="m-0 text-sm">
            <button
              type="button"
              aria-expanded={!collapsed.has(g.key)}
              onClick={() => toggle(g.key)}
              className="flex h-10 w-full items-center gap-2 bg-surface px-3 text-left text-sm font-medium hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:h-9"
            >
              <ChevronRight
                aria-hidden
                className={cn(
                  'size-3.5 text-subtle transition-transform',
                  !collapsed.has(g.key) && 'rotate-90',
                )}
              />
              {g.status && <StatusIcon status={g.status} />}
              {g.label}
              <span className="text-muted">{g.tasks.length}</span>
            </button>
          </h2>
          {!collapsed.has(g.key) && (
            <ul>
              {g.tasks.map((task) => (
                <Row
                  key={`${g.key}-${task.id}`}
                  task={task}
                  projectKey={projectKey}
                  members={members}
                  membersById={membersById}
                  selected={selectedIds.has(task.id)}
                  canWrite={canWrite}
                  onOpen={onOpen}
                  onToggleSelect={onToggleSelect}
                  onUpdate={onUpdate}
                />
              ))}
              {g.tasks.length === 0 && (
                <li className="px-3 py-3 text-xs text-subtle">Nothing here.</li>
              )}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

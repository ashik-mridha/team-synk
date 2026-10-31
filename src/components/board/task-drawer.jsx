'use client';

import { CopyPlus, Link2, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { TaskThread } from '@/components/board/task-thread';
import { AvatarGroup } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Drawer } from '@/components/ui/drawer';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { MarkdownView } from '@/components/ui/markdown';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PRIORITY_LABELS, Priority, STATUS_LABELS, TaskStatus } from '@/lib/constants';
import { checklistProgress } from '@/lib/markdown';
import { toDateInputValue } from '@/lib/tasks';
import { cn } from '@/lib/utils';

function LabelsEditor({ labels, disabled, onChange }) {
  const [draft, setDraft] = useState('');

  function add() {
    const value = draft.trim().replace(/^#/, '');
    setDraft('');
    if (value && !labels.includes(value) && labels.length < 10) onChange([...labels, value]);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {labels.map((label) => (
        <Chip key={label}>
          <span aria-hidden className="size-1.5 rounded-full bg-info" />
          {label}
          {!disabled && (
            <button
              type="button"
              aria-label={`Remove label ${label}`}
              onClick={() => onChange(labels.filter((l) => l !== label))}
              className="-mr-0.5 rounded-sm text-subtle hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X aria-hidden className="size-3" />
            </button>
          )}
        </Chip>
      ))}
      {!disabled && (
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            }
          }}
          onBlur={add}
          placeholder="Add label…"
          aria-label="Add label"
          maxLength={30}
          className="h-6 w-24 rounded-chip bg-transparent px-1 text-xs placeholder:text-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      )}
    </div>
  );
}

function Subtasks({ subtasks, disabled, onChange }) {
  const [draft, setDraft] = useState('');
  const done = subtasks.filter((s) => s.done).length;
  const percent = subtasks.length ? Math.round((done / subtasks.length) * 100) : 0;
  const save = (next) => onChange(next.map(({ id, title, done: d }) => ({ id, title, done: d })));

  function add() {
    const title = draft.trim();
    setDraft('');
    if (title) save([...subtasks, { title, done: false }]);
  }

  return (
    <section aria-label="Subtasks" className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Subtasks</h3>
        {subtasks.length > 0 && (
          <span className="text-xs text-muted">
            {done}/{subtasks.length}
          </span>
        )}
      </div>
      {subtasks.length > 0 && (
        <div
          role="progressbar"
          aria-label="Subtask progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
        >
          <div
            className="h-full rounded-full bg-success transition-[width] duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
      <ul className="flex flex-col gap-1">
        {subtasks.map((subtask, index) => (
          <li key={subtask.id ?? index} className="group flex items-center gap-2">
            <button
              type="button"
              role="checkbox"
              aria-checked={subtask.done}
              aria-label={subtask.title}
              disabled={disabled}
              onClick={() =>
                save(subtasks.map((s, i) => (i === index ? { ...s, done: !s.done } : s)))
              }
              className={cn(
                'flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                subtask.done && 'border-primary-solid bg-primary-solid',
              )}
            >
              {subtask.done && <span className="text-[10px] leading-none text-white">✓</span>}
            </button>
            <span
              className={cn(
                'min-w-0 flex-1 break-words text-sm',
                subtask.done && 'text-muted line-through',
              )}
            >
              {subtask.title}
            </span>
            {!disabled && (
              <button
                type="button"
                aria-label={`Remove ${subtask.title}`}
                onClick={() => save(subtasks.filter((_, i) => i !== index))}
                className="rounded-chip p-1 text-subtle opacity-0 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100"
              >
                <X aria-hidden className="size-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {!disabled && (
        <div className="flex items-center gap-2">
          <Plus aria-hidden className="size-4 text-subtle" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
            placeholder="Add a subtask"
            aria-label="Add a subtask"
            maxLength={200}
            className="h-8 flex-1 bg-transparent text-sm placeholder:text-subtle focus:outline-none"
          />
        </div>
      )}
    </section>
  );
}

function Description({ value, disabled, onSave }) {
  const [editing, setEditing] = useState(false);
  const progress = checklistProgress(value);

  if (editing && !disabled) {
    return (
      <Textarea
        autoFocus
        rows={7}
        defaultValue={value}
        aria-label="Description"
        placeholder="Add a description. Markdown and - [ ] checklists work."
        onBlur={(e) => {
          setEditing(false);
          if (e.target.value !== value) onSave(e.target.value);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {progress.total > 0 && (
        <p className="text-xs text-muted">
          Checklist {progress.done}/{progress.total}
        </p>
      )}
      {value.trim() ? (
        <div
          className={cn('rounded-input', !disabled && 'cursor-text hover:bg-surface-muted/60')}
          onClick={(e) => !disabled && !e.target.closest('button, a') && setEditing(true)}
        >
          <MarkdownView text={value} onChange={disabled ? undefined : onSave} />
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setEditing(true)}
          className="rounded-input border border-dashed border-border px-3 py-3 text-left text-sm text-subtle hover:border-border-strong hover:text-muted disabled:cursor-default"
        >
          {disabled ? 'No description' : 'Add a description…'}
        </button>
      )}
    </div>
  );
}

/** Task details. Full-screen on phones, side panel on larger screens. */
export function TaskDrawer({
  task,
  project,
  members,
  membersById,
  presence,
  myId,
  canWrite,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
  setViewing,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const taskId = task?.id;

  // Tell teammates which task we are looking at (cleared when the drawer closes).
  useEffect(() => {
    if (!taskId) return;
    setViewing(taskId);
    return () => setViewing(null);
  }, [taskId, setViewing]);

  if (!task) return null;

  const key = `${project.key}-${task.number}`;
  const viewers = presence.filter((p) => p.viewing === task.id && p.userId !== myId);
  const save = (patch) => onUpdate(task.id, patch);
  const saveIfChanged = (field, value) => value !== task[field] && save({ [field]: value });

  async function copyLink() {
    const link = `${window.location.origin}/p/${project.key}/T-${task.number}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy the link');
    }
  }

  return (
    <Drawer
      open
      onOpenChange={(open) => !open && onClose()}
      title={key}
      description="Task details"
      className="sm:max-w-xl"
    >
      <div key={task.id} data-task-drawer className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Link2 aria-hidden className="size-3.5" /> Copy link
          </Button>
          {canWrite && (
            <Button variant="outline" size="sm" onClick={() => onDuplicate(task)}>
              <CopyPlus aria-hidden className="size-3.5" /> Duplicate
            </Button>
          )}
          {viewers.length > 0 && (
            <span className="ml-auto flex items-center gap-2 text-xs text-muted">
              <AvatarGroup
                users={viewers.map((v) => ({
                  name: v.name,
                  src: v.image ?? undefined,
                  online: true,
                }))}
                size="xs"
              />
              {viewers.map((v) => v.name.split(' ')[0]).join(', ')} viewing
            </span>
          )}
        </div>

        <FormField label="Title">
          <Input
            data-field="title"
            defaultValue={task.title}
            maxLength={200}
            disabled={!canWrite}
            className="text-base font-medium"
            onBlur={(e) => e.target.value.trim() && saveIfChanged('title', e.target.value.trim())}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Status">
            <Select
              data-field="status"
              value={task.status}
              disabled={!canWrite}
              onChange={(e) => save({ status: e.target.value })}
            >
              {Object.values(TaskStatus).map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Priority">
            <Select
              data-field="priority"
              value={task.priority}
              disabled={!canWrite}
              onChange={(e) => save({ priority: e.target.value })}
            >
              {Object.values(Priority).map((value) => (
                <option key={value} value={value}>
                  {PRIORITY_LABELS[value]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Assignee">
            <Select
              data-field="assignee"
              value={task.assignee ?? ''}
              disabled={!canWrite}
              onChange={(e) => save({ assignee: e.target.value || null })}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Due date">
            <Input
              type="date"
              data-field="due"
              value={toDateInputValue(task.dueDate)}
              disabled={!canWrite}
              onChange={(e) => save({ dueDate: e.target.value || null })}
            />
          </FormField>
        </div>

        <section aria-label="Labels" className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">Labels</h3>
          <LabelsEditor
            labels={task.labels ?? []}
            disabled={!canWrite}
            onChange={(labels) => save({ labels })}
          />
        </section>

        <section aria-label="Description" className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">Description</h3>
          <Description
            value={task.description ?? ''}
            disabled={!canWrite}
            onSave={(description) => save({ description })}
          />
        </section>

        <Subtasks
          subtasks={task.subtasks ?? []}
          disabled={!canWrite}
          onChange={(subtasks) => save({ subtasks })}
        />

        <TaskThread
          taskId={task.id}
          members={members}
          membersById={membersById}
          myId={myId}
          canWrite={canWrite}
        />

        {canWrite && (
          <div className="border-t border-border pt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(true)}>
              <Trash2 aria-hidden className="size-4" /> Delete task
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this task?"
        description="You can undo this right after from the toast."
        confirmLabel="Delete"
        destructive
        onConfirm={() => onDelete(task.id)}
      />
    </Drawer>
  );
}

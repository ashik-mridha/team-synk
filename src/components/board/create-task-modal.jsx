'use client';

import { CalendarDays, Hash, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { PRIORITY_LABELS, Priority, STATUS_LABELS, TaskStatus } from '@/lib/constants';
import { parseQuickAdd } from '@/lib/quick-add';
import { formatDueDate } from '@/lib/tasks';

/**
 * Mounted only while open, so every open starts with a fresh form. The title accepts quick-add
 * tokens (`!high @rahim #frontend due:fri`); recognised tokens override the selects below.
 */
export function CreateTaskModal({ open, onOpenChange, initialStatus, members, onCreate }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState(initialStatus ?? TaskStatus.TODO);
  const [priority, setPriority] = useState(Priority.MEDIUM);
  const [assignee, setAssignee] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const parsed = useMemo(() => parseQuickAdd(text, { members }), [text, members]);
  const hasTokens = parsed.priority || parsed.assignee || parsed.labels.length || parsed.dueDate;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!parsed.title) return setError('Give the task a title');
    setError('');
    setLoading(true);
    try {
      await onCreate({
        title: parsed.title,
        status,
        priority: parsed.priority ?? priority,
        assignee: parsed.assignee ?? (assignee || null),
        labels: parsed.labels,
        dueDate: parsed.dueDate,
      });
      onOpenChange(false);
    } catch {
      // The API client already reported the failure.
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="New task"
      description="Tip: type !high @name #label due:fri in the title to fill the fields."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="create-task-form" loading={loading}>
            Create task
          </Button>
        </>
      }
    >
      <form
        id="create-task-form"
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <FormField label="Title" error={error} required>
            <Input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Fix login bug !high @rahim #frontend due:fri"
              maxLength={300}
            />
          </FormField>
          {hasTokens && (
            <div aria-live="polite" className="flex flex-wrap gap-1.5">
              {parsed.priority && <Chip>Priority: {PRIORITY_LABELS[parsed.priority]}</Chip>}
              {parsed.assigneeName && (
                <Chip>
                  <UserRound aria-hidden className="size-3.5" strokeWidth={1.5} />
                  {parsed.assigneeName}
                </Chip>
              )}
              {parsed.labels.map((label) => (
                <Chip key={label}>
                  <Hash aria-hidden className="size-3.5" strokeWidth={1.5} />
                  {label}
                </Chip>
              ))}
              {parsed.dueDate && (
                <Chip>
                  <CalendarDays aria-hidden className="size-3.5" strokeWidth={1.5} />
                  {formatDueDate(parsed.dueDate)}
                </Chip>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {Object.values(TaskStatus).map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Priority">
            <Select
              value={parsed.priority ?? priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={Boolean(parsed.priority)}
            >
              {Object.values(Priority).map((value) => (
                <option key={value} value={value}>
                  {PRIORITY_LABELS[value]}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
        <FormField label="Assignee">
          <Select
            value={parsed.assignee ?? assignee}
            onChange={(e) => setAssignee(e.target.value)}
            disabled={Boolean(parsed.assignee)}
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name}
              </option>
            ))}
          </Select>
        </FormField>
      </form>
    </Modal>
  );
}

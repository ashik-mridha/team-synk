import { Priority, TaskStatus } from './constants.js';

export const COLUMNS = [
  { status: TaskStatus.TODO, title: 'To Do' },
  { status: TaskStatus.IN_PROGRESS, title: 'In Progress' },
  { status: TaskStatus.DONE, title: 'Done' },
];

const PRIORITY_RANK = { [Priority.HIGH]: 0, [Priority.MEDIUM]: 1, [Priority.LOW]: 2 };

export const SORTS = Object.freeze({
  MANUAL: 'manual',
  PRIORITY: 'priority',
  DUE: 'due',
});

export function sortTasks(tasks, sort) {
  const copy = [...tasks];
  if (sort === SORTS.PRIORITY) {
    return copy.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  }
  if (sort === SORTS.DUE) {
    const time = (t) => (t.dueDate ? new Date(t.dueDate).getTime() : Infinity);
    return copy.sort((a, b) => time(a) - time(b));
  }
  return copy;
}

export function isOverdue(task) {
  return (
    Boolean(task.dueDate) && task.status !== TaskStatus.DONE && new Date(task.dueDate) < new Date()
  );
}

const shortDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

export function formatDueDate(value) {
  return shortDate.format(new Date(value));
}

/** `<input type="date">` wants YYYY-MM-DD. */
export function toDateInputValue(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}

export const DUE_PRESETS = Object.freeze({
  TODAY: 'today',
  WEEK: 'week',
  OVERDUE: 'overdue',
  NONE: 'none',
});

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export function matchesDue(task, preset, now = new Date()) {
  if (!preset) return true;
  if (preset === DUE_PRESETS.NONE) return !task.dueDate;
  if (!task.dueDate) return false;
  const due = new Date(task.dueDate);
  const today = startOfDay(now);
  if (preset === DUE_PRESETS.TODAY) return startOfDay(due).getTime() === today.getTime();
  if (preset === DUE_PRESETS.WEEK) {
    return due >= today && due < new Date(today.getTime() + 7 * 86_400_000);
  }
  return due < now && task.status !== TaskStatus.DONE;
}

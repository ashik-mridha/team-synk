import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DUE_PRESETS, matchesDue, sortTasks } from './tasks.js';

// Wednesday 2026-10-28 15:00 local
const now = new Date(2026, 9, 28, 15, 0, 0);
const task = (dueDate, status = 'todo') => ({ dueDate, status, priority: 'medium' });

describe('matchesDue', () => {
  it('matches the due-date presets', () => {
    assert.ok(matchesDue(task(new Date(2026, 9, 28, 9)), DUE_PRESETS.TODAY, now));
    assert.ok(!matchesDue(task(new Date(2026, 9, 29, 9)), DUE_PRESETS.TODAY, now));
    assert.ok(matchesDue(task(new Date(2026, 10, 2)), DUE_PRESETS.WEEK, now));
    assert.ok(!matchesDue(task(new Date(2026, 10, 9)), DUE_PRESETS.WEEK, now));
    assert.ok(matchesDue(task(new Date(2026, 9, 1)), DUE_PRESETS.OVERDUE, now));
    assert.ok(matchesDue(task(null), DUE_PRESETS.NONE, now));
  });

  it('never counts a finished task as overdue and ignores tasks without a date', () => {
    assert.ok(!matchesDue(task(new Date(2026, 9, 1), 'done'), DUE_PRESETS.OVERDUE, now));
    assert.ok(!matchesDue(task(null), DUE_PRESETS.OVERDUE, now));
    assert.ok(matchesDue(task(null), '', now));
  });
});

describe('sortTasks', () => {
  it('sorts by priority and by due date without mutating the input', () => {
    const input = [
      { id: 1, priority: 'low', dueDate: '2026-12-01' },
      { id: 2, priority: 'high', dueDate: null },
      { id: 3, priority: 'medium', dueDate: '2026-11-01' },
    ];

    assert.deepEqual(
      sortTasks(input, 'priority').map((t) => t.id),
      [2, 3, 1],
    );
    assert.deepEqual(
      sortTasks(input, 'due').map((t) => t.id),
      [3, 1, 2],
    );
    assert.deepEqual(
      input.map((t) => t.id),
      [1, 2, 3],
    );
  });
});

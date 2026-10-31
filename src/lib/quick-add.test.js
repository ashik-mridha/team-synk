import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseDue, parseQuickAdd } from './quick-add.js';

// Wednesday 2026-10-28, local time
const now = new Date(2026, 9, 28, 9, 0, 0);
const members = [
  { userId: 'u1', name: 'Rahim Uddin', email: 'rahim@example.com' },
  { userId: 'u2', name: 'Mia Member', email: 'mia@example.com' },
];
const ymd = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

describe('parseQuickAdd', () => {
  it('parses every token type and keeps the rest as the title', () => {
    const parsed = parseQuickAdd('Fix login bug !high @rahim #frontend due:fri', { members, now });

    assert.equal(parsed.title, 'Fix login bug');
    assert.equal(parsed.priority, 'high');
    assert.equal(parsed.assignee, 'u1');
    assert.deepEqual(parsed.labels, ['frontend']);
    assert.equal(ymd(parsed.dueDate), '2026-10-30');
  });

  it('keeps unknown tokens in the title instead of dropping them', () => {
    const parsed = parseQuickAdd('Ship it !nope @ghost due:someday', { members, now });

    assert.equal(parsed.title, 'Ship it !nope @ghost due:someday');
    assert.equal(parsed.priority, null);
    assert.equal(parsed.assignee, null);
    assert.equal(parsed.dueDate, null);
  });

  it('matches members by first name, last name or email and dedupes labels', () => {
    assert.equal(parseQuickAdd('a @uddin', { members, now }).assignee, 'u1');
    assert.equal(parseQuickAdd('a @mia', { members, now }).assignee, 'u2');
    assert.deepEqual(parseQuickAdd('a #x #y #x', { members, now }).labels, ['x', 'y']);
  });

  it('accepts short priority forms', () => {
    assert.equal(parseQuickAdd('a !l', { now }).priority, 'low');
    assert.equal(parseQuickAdd('a !m', { now }).priority, 'medium');
  });

  it('handles empty input', () => {
    assert.equal(parseQuickAdd('   ', { now }).title, '');
  });
});

describe('parseDue', () => {
  it('understands relative and absolute dates', () => {
    assert.equal(ymd(parseDue('today', now)), '2026-10-28');
    assert.equal(ymd(parseDue('tomorrow', now)), '2026-10-29');
    assert.equal(ymd(parseDue('+3d', now)), '2026-10-31');
    assert.equal(ymd(parseDue('nextweek', now)), '2026-11-4');
    assert.equal(ymd(parseDue('2027-01-05', now)), '2027-1-5');
  });

  it('picks the next occurrence of a weekday, never today', () => {
    assert.equal(ymd(parseDue('wed', now)), '2026-11-4');
    assert.equal(ymd(parseDue('monday', now)), '2026-11-2');
  });

  it('rejects nonsense', () => {
    assert.equal(parseDue('soonish', now), null);
    assert.equal(parseDue('2027-13-45', now), null);
  });
});

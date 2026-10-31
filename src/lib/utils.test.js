import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getInitials, timeAgo } from './utils.js';

const now = new Date('2026-10-28T12:00:00Z').getTime();

describe('timeAgo', () => {
  it('formats past times in the largest sensible unit', () => {
    assert.equal(timeAgo(now - 20_000, now), 'just now');
    assert.equal(timeAgo(now - 5 * 60_000, now), '5 minutes ago');
    assert.equal(timeAgo(now - 3 * 3_600_000, now), '3 hours ago');
    assert.equal(timeAgo(now - 86_400_000, now), 'yesterday');
  });
});

describe('getInitials', () => {
  it('uses first and last word', () => {
    assert.equal(getInitials('Rahim Uddin'), 'RU');
    assert.equal(getInitials('Mia'), 'M');
    assert.equal(getInitials('  anna maria lee '), 'AL');
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fuzzyFilter, fuzzyScore } from './fuzzy.js';

describe('fuzzyScore', () => {
  it('matches subsequences in order and rejects anything else', () => {
    assert.ok(fuzzyScore('crt', 'Create task') >= 0);
    assert.equal(fuzzyScore('xyz', 'Create task'), -1);
    assert.equal(fuzzyScore('tc', 'cat'), -1);
  });

  it('ranks word starts and consecutive runs higher', () => {
    assert.ok(fuzzyScore('cre', 'Create task') > fuzzyScore('cre', 'Secret recipe'));
    assert.ok(fuzzyScore('set', 'Settings') > fuzzyScore('set', 'Switch to a different theme'));
  });

  it('treats an empty query as a match for everything', () => {
    assert.equal(fuzzyScore('', 'anything'), 0);
  });
});

describe('fuzzyFilter', () => {
  const items = [{ t: 'Go to settings' }, { t: 'Create task' }, { t: 'Switch theme' }];

  it('filters and orders by score', () => {
    const result = fuzzyFilter(items, 'ctask', (i) => i.t).map((i) => i.t);
    assert.deepEqual(result, ['Create task']);
  });

  it('returns everything for an empty query', () => {
    assert.equal(fuzzyFilter(items, '', (i) => i.t).length, 3);
  });
});

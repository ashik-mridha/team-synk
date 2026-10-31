import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { suggestEmail } from './email-hint.js';

describe('suggestEmail', () => {
  it('fixes the .som typo from the bug report', () => {
    assert.equal(suggestEmail('him@gmail.som'), 'him@gmail.com');
  });

  it('fixes other mistyped .com endings on any domain', () => {
    assert.equal(suggestEmail('a@company.con'), 'a@company.com');
    assert.equal(suggestEmail('a@company.cmo'), 'a@company.com');
    assert.equal(suggestEmail('a@company.comm'), 'a@company.com');
  });

  it('fixes misspelled major providers', () => {
    assert.equal(suggestEmail('a@gmial.com'), 'a@gmail.com');
    assert.equal(suggestEmail('a@gmai.com'), 'a@gmail.com');
    assert.equal(suggestEmail('a@hotmial.com'), 'a@hotmail.com');
    assert.equal(suggestEmail('a@gmail.co'), 'a@gmail.com');
  });

  it('never flags correct addresses or uncommon but real TLDs', () => {
    for (const ok of [
      'a@gmail.com',
      'a@company.com',
      'a@company.io',
      'a@company.co.uk',
      'a@university.edu.bd',
      'a@startup.dev',
      'a@example.xyz',
      'a@brand.app',
    ]) {
      assert.equal(suggestEmail(ok), null, ok);
    }
  });

  it('stays quiet until the address looks complete', () => {
    for (const partial of ['', 'a', 'a@', 'a@gmail', 'a@gmail.', '@gmail.som']) {
      assert.equal(suggestEmail(partial), null, partial);
    }
  });

  it('keeps the local part exactly as typed', () => {
    assert.equal(suggestEmail('First.Last+tag@gmail.som'), 'First.Last+tag@gmail.com');
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checklistProgress, parseBlocks, parseInline, toggleChecklistLine } from './markdown.js';

describe('parseBlocks', () => {
  it('groups consecutive list items and keeps source line numbers', () => {
    const blocks = parseBlocks('# Plan\n\n- [ ] design\n- [x] build\n\nsome text\n1. one\n2. two');

    assert.equal(blocks[0].type, 'heading');
    assert.equal(blocks[1].type, 'checklist');
    assert.deepEqual(
      blocks[1].items.map((i) => [i.text, i.checked, i.line]),
      [
        ['design', false, 2],
        ['build', true, 3],
      ],
    );
    assert.equal(blocks[2].type, 'paragraph');
    assert.equal(blocks[3].type, 'numbered');
    assert.equal(blocks[3].items.length, 2);
  });

  it('keeps fenced code verbatim', () => {
    const [block] = parseBlocks('```\nconst a = **1**;\n```');
    assert.deepEqual(block, { type: 'code', text: 'const a = **1**;' });
  });
});

describe('parseInline', () => {
  it('marks bold, italic, code and http links; never treats other schemes as links', () => {
    const marks = parseInline('a **b** *c* `d` [e](https://x.dev) [f](javascript:alert(1))');

    assert.deepEqual(
      marks.filter((m) => m.type !== 'text').map((m) => [m.type, m.text]),
      [
        ['bold', 'b'],
        ['italic', 'c'],
        ['code', 'd'],
        ['link', 'e'],
      ],
    );
    assert.ok(marks.every((m) => m.type !== 'link' || m.href.startsWith('https://')));
    assert.ok(marks.some((m) => m.type === 'text' && m.text.includes('javascript:')));
  });
});

describe('checklists', () => {
  it('toggles one line and leaves the rest untouched', () => {
    const text = '- [ ] a\n- [x] b';

    assert.equal(toggleChecklistLine(text, 0), '- [x] a\n- [x] b');
    assert.equal(toggleChecklistLine(text, 1), '- [ ] a\n- [ ] b');
    assert.equal(toggleChecklistLine(text, 5), text);
  });

  it('counts progress', () => {
    assert.deepEqual(checklistProgress('- [x] a\n- [ ] b\n- [x] c'), { done: 2, total: 3 });
    assert.deepEqual(checklistProgress('no list'), { done: 0, total: 0 });
  });
});

/**
 * A deliberately small Markdown subset for task descriptions and comments: headings, bullet and
 * numbered lists, checklists (`- [ ]`), fenced code, paragraphs, and inline bold, italic, code and
 * http(s) links. It produces a plain AST; rendering builds React elements, so no HTML is ever
 * injected.
 */

const CHECKLIST = /^\s*[-*]\s+\[( |x|X)\]\s+(.*)$/;
const BULLET = /^\s*[-*]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const HEADING = /^(#{1,3})\s+(.*)$/;

export function parseBlocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      flushParagraph();
      const code = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i++]);
      blocks.push({ type: 'code', text: code.join('\n') });
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    const heading = HEADING.exec(line);
    const check = CHECKLIST.exec(line);
    const bullet = BULLET.exec(line);
    const numbered = NUMBERED.exec(line);

    if (heading) {
      flushParagraph();
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] });
    } else if (check || bullet || numbered) {
      flushParagraph();
      const type = check ? 'checklist' : bullet ? 'bullet' : 'numbered';
      const last = blocks.at(-1);
      const item = {
        text: (check ?? bullet ?? numbered)[check ? 2 : 1],
        checked: check ? check[1] !== ' ' : false,
        line: i,
      };
      if (last?.type === type) last.items.push(item);
      else blocks.push({ type, items: [item] });
    } else {
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  return blocks;
}

const INLINE =
  /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|_[^_\s][^_]*_|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;

/** Splits text into plain strings and `{ type, text, href? }` marks. */
export function parseInline(text) {
  return text
    .split(INLINE)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith('**')) return { type: 'bold', text: part.slice(2, -2) };
      if (part.startsWith('`')) return { type: 'code', text: part.slice(1, -1) };
      if (part.startsWith('*') || part.startsWith('_'))
        return { type: 'italic', text: part.slice(1, -1) };
      const link = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(part);
      if (link) return { type: 'link', text: link[1], href: link[2] };
      return { type: 'text', text: part };
    });
}

/** Flips the checkbox on a given source line and returns the new text. */
export function toggleChecklistLine(text, lineIndex) {
  const lines = text.split('\n');
  const match = CHECKLIST.exec(lines[lineIndex] ?? '');
  if (!match) return text;
  lines[lineIndex] = lines[lineIndex].replace(/\[( |x|X)\]/, match[1] === ' ' ? '[x]' : '[ ]');
  return lines.join('\n');
}

export function checklistProgress(text) {
  const items = parseBlocks(text)
    .filter((b) => b.type === 'checklist')
    .flatMap((b) => b.items);
  return { done: items.filter((i) => i.checked).length, total: items.length };
}

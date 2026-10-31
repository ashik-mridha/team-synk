import { Check } from 'lucide-react';
import { parseBlocks, parseInline, toggleChecklistLine } from '@/lib/markdown';
import { cn } from '@/lib/utils';

function Inline({ text }) {
  return parseInline(text).map((mark, i) => {
    if (mark.type === 'bold') return <strong key={i}>{mark.text}</strong>;
    if (mark.type === 'italic') return <em key={i}>{mark.text}</em>;
    if (mark.type === 'code') {
      return (
        <code key={i} className="rounded-chip bg-surface-muted px-1 py-0.5 font-mono text-xs">
          {mark.text}
        </code>
      );
    }
    if (mark.type === 'link') {
      return (
        <a
          key={i}
          href={mark.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-text underline underline-offset-2"
        >
          {mark.text}
        </a>
      );
    }
    return <span key={i}>{mark.text}</span>;
  });
}

/**
 * Renders the Markdown subset from lib/markdown. Built from React elements (never raw HTML), so
 * user text cannot inject markup. Checklists are interactive when `onChange` is given.
 */
export function MarkdownView({ text, onChange, className }) {
  const blocks = parseBlocks(text);
  if (blocks.length === 0) return null;

  return (
    <div className={cn('flex flex-col gap-2 text-sm leading-relaxed', className)}>
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <p key={i} className={cn('font-semibold', block.level === 1 ? 'text-base' : 'text-sm')}>
              <Inline text={block.text} />
            </p>
          );
        }
        if (block.type === 'code') {
          return (
            <pre
              key={i}
              className="overflow-x-auto rounded-input bg-surface-muted p-3 font-mono text-xs"
            >
              {block.text}
            </pre>
          );
        }
        if (block.type === 'checklist') {
          return (
            <ul key={i} className="flex flex-col gap-1">
              {block.items.map((item) => (
                <li key={item.line} className="flex items-start gap-2">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={item.checked}
                    aria-label={item.text}
                    disabled={!onChange}
                    onClick={() => onChange?.(toggleChecklistLine(text, item.line))}
                    className={cn(
                      'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-border-strong transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      item.checked && 'border-primary-solid bg-primary-solid',
                    )}
                  >
                    {item.checked && (
                      <Check aria-hidden className="size-3 text-white" strokeWidth={3} />
                    )}
                  </button>
                  <span className={cn(item.checked && 'text-muted line-through')}>
                    <Inline text={item.text} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === 'bullet' || block.type === 'numbered') {
          const List = block.type === 'bullet' ? 'ul' : 'ol';
          return (
            <List
              key={i}
              className={cn(
                'ml-5 flex flex-col gap-0.5',
                block.type === 'bullet' ? 'list-disc' : 'list-decimal',
              )}
            >
              {block.items.map((item) => (
                <li key={item.line}>
                  <Inline text={item.text} />
                </li>
              ))}
            </List>
          );
        }
        return (
          <p key={i}>
            <Inline text={block.text} />
          </p>
        );
      })}
    </div>
  );
}

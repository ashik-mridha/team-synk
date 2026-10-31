import { TaskStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';

/** Linear-style status glyphs: empty circle, half-filled circle, check circle. */
export function StatusIcon({ status, className }) {
  const base = cn('size-4 shrink-0', className);

  if (status === TaskStatus.DONE) {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden className={cn(base, 'text-column-done')}>
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="8" r="4.5" fill="currentColor" opacity="0.25" />
        <path
          d="m5.5 8.2 1.7 1.7 3.3-3.6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (status === TaskStatus.IN_PROGRESS) {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden className={cn(base, 'text-column-progress')}>
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.25a3.75 3.75 0 0 1 0 7.5V4.25Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={cn(base, 'text-column-todo')}>
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

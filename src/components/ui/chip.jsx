import { cn } from '@/lib/utils';

const chipClasses =
  'inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-chip border border-border px-1.5 text-xs text-muted transition-colors duration-150';

/** Small outlined chip used for task meta (priority, key, due date, labels). */
export function Chip({ as: Component = 'span', className, children, ...props }) {
  const interactive = Component === 'button';
  return (
    <Component
      className={cn(
        chipClasses,
        interactive &&
          'cursor-pointer hover:border-border-strong hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
      {...(interactive ? { type: 'button' } : {})}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Dashed "+ Filter" style chip. */
export function DashedChip({ className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        chipClasses,
        'h-7 cursor-pointer border-dashed px-2 hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

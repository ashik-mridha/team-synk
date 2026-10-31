import { cn } from '@/lib/utils';

export const fieldClasses =
  'w-full rounded-input border border-border-strong bg-transparent px-2.5 text-sm text-foreground transition-colors duration-150 placeholder:text-subtle hover:border-foreground/25 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/30';

export function Input({ className, invalid, type = 'text', ...props }) {
  return (
    <input
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(fieldClasses, 'h-11 md:h-8', className)}
      {...props}
    />
  );
}

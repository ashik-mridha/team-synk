import { cn } from '@/lib/utils';
export function Label({ className, required, children, ...props }) {
  return (
    <label className={cn('text-sm font-medium text-foreground', className)} {...props}>
      {children}
      {required && (
        <span aria-hidden className="ml-0.5 text-danger-text">
          *
        </span>
      )}
    </label>
  );
}

import { cn } from '@/lib/utils';
export function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-input bg-surface-muted', className)}
      {...props}
    />
  );
}

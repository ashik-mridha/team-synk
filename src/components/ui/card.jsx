import { cn } from '@/lib/utils';
export function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-card border border-border bg-surface shadow-soft', className)}
      {...props}
    />
  );
}
export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-1 p-5 sm:p-6', className)} {...props} />;
}
export function CardTitle({ className, ...props }) {
  return <h3 className={cn('font-heading text-base font-semibold', className)} {...props} />;
}
export function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted', className)} {...props} />;
}
export function CardContent({ className, ...props }) {
  return <div className={cn('px-5 pb-5 sm:px-6 sm:pb-6', className)} {...props} />;
}
export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex items-center gap-2 border-t border-border px-5 py-4 sm:px-6', className)}
      {...props}
    />
  );
}

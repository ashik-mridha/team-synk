import { fieldClasses } from '@/components/ui/input';
import { cn } from '@/lib/utils';
export function Textarea({ className, invalid, rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(fieldClasses, 'min-h-24 resize-y py-2', className)}
      {...props}
    />
  );
}

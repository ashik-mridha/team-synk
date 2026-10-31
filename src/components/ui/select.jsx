import { ChevronDown } from 'lucide-react';
import { fieldClasses } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/** Native select: best mobile UX (OS picker) and fully accessible out of the box. */
export function Select({ className, invalid, children, ...props }) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={cn(fieldClasses, 'h-11 appearance-none bg-surface pr-8 md:h-8', className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

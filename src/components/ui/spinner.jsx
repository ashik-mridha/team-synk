import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
export function Spinner({ className, label = 'Loading' }) {
  return (
    <span role="status" className="inline-flex">
      <Loader2 aria-hidden className={cn('size-5 animate-spin text-primary-text', className)} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

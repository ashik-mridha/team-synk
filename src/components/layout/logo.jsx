import { Layers } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
export function Logo({ className, textClassName }) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-2 rounded-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-primary-solid to-accent text-white shadow-soft">
        <Layers aria-hidden className="size-4" />
      </span>
      <span className={cn('text-base font-semibold tracking-tight', textClassName)}>TeamSync</span>
    </Link>
  );
}

'use client';

import { toast } from 'sonner';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * Wraps a control that is not built yet: it is dimmed, cannot be activated, and shows a
 * "Coming soon" tooltip on hover or keyboard focus. Nothing in the UI is a silent dead button.
 */
export function ComingSoon({ children, className, label = 'Coming soon' }) {
  return (
    <Tooltip content={label}>
      <span
        role="button"
        tabIndex={0}
        aria-disabled="true"
        onClick={() => toast.info(label)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toast.info(label)}
        className={cn(
          'inline-flex cursor-not-allowed rounded-input opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          className,
        )}
      >
        <span className="pointer-events-none flex w-full items-center">{children}</span>
      </span>
    </Tooltip>
  );
}

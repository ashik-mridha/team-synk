'use client';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { useId } from 'react';
import { cn } from '@/lib/utils';
export function Checkbox({ className, label, description, id, ...props }) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  const box = (
    <CheckboxPrimitive.Root
      id={checkboxId}
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-md border border-border bg-surface shadow-soft transition-colors duration-150 hover:border-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary-solid data-[state=checked]:bg-primary-solid',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check aria-hidden className="size-3 text-white" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
  if (!label) return box;
  return (
    <div className="flex min-h-11 items-start gap-3 py-1.5 md:min-h-0">
      <div className="pt-0.5">{box}</div>
      <label htmlFor={checkboxId} className="flex cursor-pointer flex-col gap-0.5 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        {description && <span className="text-muted">{description}</span>}
      </label>
    </div>
  );
}

import { cloneElement, useId } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
/** Wires label, hint and error text to a single control (Input, Textarea, Select). */
export function FormField({ label, error, hint, required, className, children }) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {cloneElement(children, {
        id,
        invalid: Boolean(error),
        required,
        'aria-describedby': message ? messageId : undefined,
      })}
      {message && (
        <p
          id={messageId}
          role={error ? 'alert' : undefined}
          className={cn('text-xs', error ? 'text-danger-text' : 'text-muted')}
        >
          {message}
        </p>
      )}
    </div>
  );
}

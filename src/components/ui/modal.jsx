'use client';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
export const overlayClasses =
  'fixed inset-0 z-50 bg-black/55 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in';
export function CloseButton({ className }) {
  return (
    <DialogPrimitive.Close
      aria-label="Close"
      className={cn(
        'absolute right-3 top-3 flex size-11 items-center justify-center rounded-input text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:size-9',
        className,
      )}
    >
      <X aria-hidden className="size-4" />
    </DialogPrimitive.Close>
  );
}
export function Modal({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  footer,
  children,
  className,
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={overlayClasses} />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg flex-col rounded-card border border-border-strong bg-elevated shadow-overlay focus-visible:outline-none data-[state=closed]:animate-zoom-out data-[state=open]:animate-zoom-in',
            className,
          )}
        >
          <div className="flex flex-col gap-1 p-5 pr-14 sm:p-6 sm:pr-14">
            <DialogPrimitive.Title className="text-base font-semibold">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="text-sm text-muted">
                {description}
              </DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
            )}
          </div>
          {children && <div className="overflow-y-auto px-5 pb-5 sm:px-6">{children}</div>}
          {footer && (
            <div className="flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:justify-end sm:px-6">
              {footer}
            </div>
          )}
          <CloseButton />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export const ModalClose = DialogPrimitive.Close;

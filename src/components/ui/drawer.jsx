'use client';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { CloseButton, overlayClasses } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
const sideClasses = {
  right:
    'right-0 data-[state=closed]:animate-slide-out-right data-[state=open]:animate-slide-in-right border-l',
  left: 'left-0 data-[state=closed]:animate-slide-out-left data-[state=open]:animate-slide-in-left border-r',
};
/** Side sheet. Full-screen below the sm breakpoint, fixed-width panel above. */
export function Drawer({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  side = 'right',
  hideHeader = false,
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
            'pt-safe pb-safe fixed inset-y-0 z-50 flex h-dvh w-full flex-col border-border-strong bg-elevated shadow-overlay focus-visible:outline-none sm:max-w-md',
            sideClasses[side],
            className,
          )}
        >
          <div className={cn('flex flex-col gap-1 p-5 pr-14', hideHeader && 'sr-only')}>
            <DialogPrimitive.Title className="text-base font-semibold">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description
              className={cn('text-sm text-muted', !description && 'sr-only')}
            >
              {description ?? title}
            </DialogPrimitive.Description>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
          <CloseButton className="mt-[env(safe-area-inset-top)]" />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

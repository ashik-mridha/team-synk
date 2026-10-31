'use client';

import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuGroup = DropdownPrimitive.Group;
export const DropdownMenuSub = DropdownPrimitive.Sub;

export function DropdownMenuContent({ className, sideOffset = 6, align = 'end', ...props }) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        collisionPadding={12}
        className={cn(
          'z-50 min-w-48 max-w-[calc(100vw-1.5rem)] origin-[--radix-dropdown-menu-content-transform-origin] rounded-card border border-border-strong bg-elevated p-1 shadow-overlay data-[state=open]:animate-pop-in',
          className,
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}

export function DropdownMenuSubTrigger({ className, children, ...props }) {
  return (
    <DropdownPrimitive.SubTrigger
      className={cn(
        itemVariants(),
        'justify-between data-[state=open]:bg-surface-muted',
        className,
      )}
      {...props}
    >
      {children}
    </DropdownPrimitive.SubTrigger>
  );
}

export function DropdownMenuSubContent({ className, ...props }) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.SubContent
        sideOffset={6}
        collisionPadding={12}
        className={cn(
          'z-50 min-w-40 rounded-card border border-border-strong bg-elevated p-1 shadow-overlay data-[state=open]:animate-pop-in',
          className,
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}

const itemVariants = cva(
  'relative flex min-h-11 cursor-pointer select-none items-center gap-2.5 rounded-chip px-2 text-sm outline-none transition-colors duration-150 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 md:min-h-8 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted',
  {
    variants: {
      variant: {
        default: 'text-foreground data-[highlighted]:bg-surface-muted',
        destructive: 'text-danger-text data-[highlighted]:bg-danger-soft [&_svg]:text-danger-text',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export function DropdownMenuItem({ className, variant, ...props }) {
  return <DropdownPrimitive.Item className={cn(itemVariants({ variant }), className)} {...props} />;
}

export function DropdownMenuLabel({ className, ...props }) {
  return (
    <DropdownPrimitive.Label
      className={cn('px-2 py-1.5 text-xs font-medium text-subtle', className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }) {
  return (
    <DropdownPrimitive.Separator
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

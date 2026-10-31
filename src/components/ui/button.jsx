import { cva } from 'class-variance-authority';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-input font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary-solid text-white hover:bg-primary-solid-hover',
        secondary:
          'border border-border bg-surface-muted text-foreground hover:border-border-strong hover:bg-surface-muted/70',
        ghost: 'text-muted hover:bg-surface-muted hover:text-foreground',
        outline:
          'border border-border-strong bg-transparent text-foreground hover:bg-surface-muted',
        danger: 'bg-danger-solid text-white hover:bg-danger-solid/90',
      },
      size: {
        sm: 'h-11 px-2.5 text-xs md:h-7',
        md: 'h-11 px-3 text-sm md:h-8',
        lg: 'h-12 px-4 text-sm md:h-9',
        icon: 'size-11 md:size-8',
        'icon-sm': 'size-11 md:size-7',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner className="size-4 text-current" label="Loading" />}
      {children}
    </button>
  );
}

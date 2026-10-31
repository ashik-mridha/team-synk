import Link from 'next/link';
import { cn } from '@/lib/utils';

const baseClasses =
  'flex h-11 w-full items-center gap-2.5 rounded-input px-2 text-left text-sm text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:h-8 [&_svg]:size-4 [&_svg]:shrink-0';

const activeClasses = 'bg-surface-muted text-foreground';

/** One sidebar row: a link when `href` is set, otherwise a button. */
export function SidebarItem({
  href,
  icon: Icon,
  active = false,
  trailing,
  className,
  children,
  ...props
}) {
  const classes = cn(baseClasses, active && activeClasses, className);
  const content = (
    <>
      {Icon && <Icon aria-hidden strokeWidth={1.5} />}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing}
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-current={active ? 'page' : undefined} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  );
}

import { cva } from 'class-variance-authority';
import { cn, getInitials } from '@/lib/utils';
const avatarVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-surface',
  {
    variants: {
      size: {
        xs: 'size-6 text-[10px]',
        sm: 'size-8 text-xs',
        md: 'size-10 text-sm',
        lg: 'size-14 text-lg',
      },
    },
    defaultVariants: { size: 'md' },
  },
);
const dotSizes = { xs: 'size-2', sm: 'size-2.5', md: 'size-3', lg: 'size-4' };
const palette = [
  'bg-primary-soft text-primary-text',
  'bg-success-soft text-success-text',
  'bg-warning-soft text-warning-text',
  'bg-info-soft text-info-text',
  'bg-danger-soft text-danger-text',
];
function paletteFor(name) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length] ?? palette[0];
}
export function Avatar({ name, src, size = 'md', online, className }) {
  return (
    <span
      role="img"
      aria-label={online === undefined ? name : `${name}, ${online ? 'online' : 'offline'}`}
      className={cn(avatarVariants({ size }), !src && paletteFor(name), className)}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full rounded-full object-cover" />
      ) : (
        <span aria-hidden>{getInitials(name)}</span>
      )}
      {online !== undefined && (
        <span
          aria-hidden
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-surface',
            dotSizes[size ?? 'md'],
            online ? 'bg-success' : 'bg-muted',
          )}
        />
      )}
    </span>
  );
}
export function AvatarGroup({ users, max = 4, size = 'sm', className }) {
  const visible = users.slice(0, max);
  const overflow = users.length - visible.length;
  return (
    <div
      className={cn('flex items-center', size === 'xs' ? '-space-x-1.5' : '-space-x-2', className)}
    >
      {visible.map((user) => (
        <Avatar key={user.name} size={size} {...user} />
      ))}
      {overflow > 0 && (
        <span
          className={cn(avatarVariants({ size }), 'bg-surface-muted text-muted')}
          aria-label={`${overflow} more`}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

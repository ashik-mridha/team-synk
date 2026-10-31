import { cva } from 'class-variance-authority';
import { Priority, TaskStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-chip px-1.5 py-0.5 text-xs font-medium',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-muted text-foreground',
        primary: 'bg-primary-soft text-primary-text',
        success: 'bg-success-soft text-success-text',
        warning: 'bg-warning-soft text-warning-text',
        danger: 'bg-danger-soft text-danger-text',
        info: 'bg-info-soft text-info-text',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export function Badge({ className, tone, ...props }) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

const priorityConfig = {
  [Priority.LOW]: { label: 'Low', tone: 'success' },
  [Priority.MEDIUM]: { label: 'Medium', tone: 'warning' },
  [Priority.HIGH]: { label: 'High', tone: 'danger' },
};

export function PriorityBadge({ priority, className }) {
  const { label, tone } = priorityConfig[priority];
  return (
    <Badge tone={tone} className={className}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}

const statusConfig = {
  [TaskStatus.TODO]: { label: 'To Do', tone: 'neutral', dot: 'bg-column-todo' },
  [TaskStatus.IN_PROGRESS]: { label: 'In Progress', tone: 'primary', dot: 'bg-column-progress' },
  [TaskStatus.DONE]: { label: 'Done', tone: 'success', dot: 'bg-column-done' },
};

export function StatusBadge({ status, className }) {
  const { label, tone, dot } = statusConfig[status];
  return (
    <Badge tone={tone} className={className}>
      <span aria-hidden className={cn('size-1.5 rounded-full', dot)} />
      {label}
    </Badge>
  );
}

export function LabelBadge({ className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-chip border border-border px-1.5 py-0.5 text-xs font-medium text-muted',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

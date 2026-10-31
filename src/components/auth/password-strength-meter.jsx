import { scorePassword } from '@/lib/password-strength';
import { cn } from '@/lib/utils';
const barColors = ['', 'bg-danger', 'bg-warning', 'bg-info', 'bg-success'];
const textColors = [
  '',
  'text-danger-text',
  'text-warning-text',
  'text-info-text',
  'text-success-text',
];
export function PasswordStrengthMeter({ password }) {
  const { score, label } = scorePassword(password);
  if (!password) return null;
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div aria-hidden className="grid flex-1 grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn(
              'h-1.5 rounded-full bg-surface-muted transition-colors duration-200',
              step <= score && barColors[score],
            )}
          />
        ))}
      </div>
      <span className={cn('w-16 text-right text-xs font-medium', textColors[score])}>
        <span className="sr-only">Password strength: </span>
        {label}
      </span>
    </div>
  );
}

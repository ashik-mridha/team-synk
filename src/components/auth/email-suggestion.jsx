'use client';

import { suggestEmail } from '@/lib/email-hint';

/** "Did you mean you@gmail.com?" under an email field. Advisory only: the address is never blocked. */
export function EmailSuggestion({ value, onAccept }) {
  const suggestion = suggestEmail(value);
  if (!suggestion) return null;
  return (
    <p className="-mt-3 text-xs text-muted" role="status">
      Did you mean{' '}
      <button
        type="button"
        onClick={() => onAccept(suggestion)}
        className="rounded-sm font-medium text-primary-text underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {suggestion}
      </button>
      ?
    </p>
  );
}

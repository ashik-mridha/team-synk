import { createAuthClient } from 'better-auth/react';
import { AUTH_URL } from '@/lib/config';
import { describeFailure, logFailure } from '@/lib/errors';

/**
 * Better Auth lives on the Express API; the session cookie is httpOnly and managed by the server.
 * With no NEXT_PUBLIC_AUTH_URL the client uses this site's own origin (/api/auth), which the
 * Next.js rewrite forwards to the API, keeping the session cookie first-party.
 */
export const authClient = createAuthClient({
  ...(AUTH_URL && { baseURL: AUTH_URL }),
});

/** Message for a Better Auth `{ error }` result or an exception thrown while reaching the server. */
export function getAuthErrorMessage(error) {
  logFailure('auth', error);
  return describeFailure(error).message;
}

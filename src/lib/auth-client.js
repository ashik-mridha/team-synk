import { createAuthClient } from 'better-auth/react';

/** Better Auth lives on the Express API; the session cookie is httpOnly and managed by the server. */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
});

export function getAuthErrorMessage(error) {
  return error?.message || 'Something went wrong. Please try again.';
}

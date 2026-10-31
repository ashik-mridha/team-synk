/**
 * Where the browser talks to the backend. All three values come from NEXT_PUBLIC_* variables,
 * which Next.js bakes into the bundle at BUILD time: change them in the hosting dashboard, then redeploy.
 *
 *   NEXT_PUBLIC_API_URL    REST API.  "/api/v1" = same origin through the Next.js rewrite (recommended),
 *                          or the API's absolute URL for direct cross-origin calls.
 *   NEXT_PUBLIC_AUTH_URL   Better Auth server. Leave empty to use this site's own origin (/api/auth).
 *   NEXT_PUBLIC_SOCKET_URL Socket.io server. Always the API's own URL: WebSockets cannot go through rewrites.
 *
 * Localhost is only a development fallback; a production build never falls back to it.
 */
const isDev = process.env.NODE_ENV !== 'production';
const DEV_API = 'http://localhost:5000';

const clean = (value) => (value ?? '').trim().replace(/\/$/, '');

export const API_URL =
  clean(process.env.NEXT_PUBLIC_API_URL) || (isDev ? `${DEV_API}/api/v1` : '/api/v1');
export const AUTH_URL = clean(process.env.NEXT_PUBLIC_AUTH_URL) || (isDev ? DEV_API : '');
export const SOCKET_URL = clean(process.env.NEXT_PUBLIC_SOCKET_URL) || (isDev ? DEV_API : '');
/** Parent domain shared with the API (mirrors the server's COOKIE_DOMAIN), if any. */
export const COOKIE_DOMAIN = clean(process.env.NEXT_PUBLIC_COOKIE_DOMAIN).replace(/^\./, '');

if (!isDev && !SOCKET_URL && typeof window !== 'undefined') {
  console.error(
    'NEXT_PUBLIC_SOCKET_URL is not set: real-time updates are disabled. Set it and redeploy.',
  );
}

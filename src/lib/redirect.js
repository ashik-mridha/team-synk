export const DEFAULT_AUTH_REDIRECT = '/dashboard';
/**
 * Returns `next` only when it is a same-origin relative path; otherwise the fallback.
 * Blocks open redirects such as `//evil.com`, `/\evil.com` and `https://evil.com`.
 */
export function safeNextPath(next, fallback = DEFAULT_AUTH_REDIRECT) {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) {
    return fallback;
  }
  if (/[\u0000-\u001f]/.test(next)) return fallback;
  try {
    const base = 'http://redirect.invalid';
    const url = new URL(next, base);
    return url.origin === base ? url.pathname + url.search + url.hash : fallback;
  } catch {
    return fallback;
  }
}
export function loginUrl(next) {
  return `/login?next=${encodeURIComponent(next)}`;
}

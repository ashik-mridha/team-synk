/**
 * Can `proxy.js` (which runs on the web app's own server) see the Better Auth session cookie?
 *
 * It can when the cookie is first-party to the web app: the API is reached through this origin
 * (no auth URL), the API shares this hostname (localhost in development), or both live under a
 * shared parent domain. When the API is on an unrelated domain the cookie belongs to that domain
 * and never reaches `proxy.js`; enforcing it there would bounce every signed-in user to /login
 * forever, so the server-side gate is skipped and the client-side AuthGuard does the job instead.
 */
export function sessionCookieVisible(requestHost, authUrl, cookieDomain = '') {
  if (!authUrl) return true;
  const host = requestHost.split(':')[0].toLowerCase();
  let authHost;
  try {
    authHost = new URL(authUrl).hostname.toLowerCase();
  } catch {
    return false;
  }
  if (authHost === host) return true;
  const domain = cookieDomain.toLowerCase();
  return Boolean(domain) && (host === domain || host.endsWith(`.${domain}`));
}

import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse } from 'next/server';
import { loginUrl } from '@/lib/redirect';

/**
 * Optimistic redirect for protected routes based on the presence of Better Auth's session cookie.
 * This is NOT a security check: AuthGuard and the API validate the session. It deliberately does
 * not redirect away from /login, so a stale cookie can never cause a redirect loop.
 * (Next.js 16 renamed `middleware.js` to `proxy.js`.)
 */
export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL(loginUrl(pathname + search), request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};

import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse } from 'next/server';
import { COOKIE_DOMAIN, AUTH_URL } from '@/lib/config';
import { loginUrl } from '@/lib/redirect';
import { sessionCookieVisible } from '@/lib/session-cookie';

export function proxy(request) {
  // When the API is on an unrelated domain its session cookie is invisible here, so redirecting on
  // "no cookie" would send signed-in users to /login in a loop. The client-side AuthGuard (which
  // asks the API) gates those pages instead.
  if (!sessionCookieVisible(request.nextUrl.host, AUTH_URL, COOKIE_DOMAIN)) {
    return NextResponse.next();
  }

  if (!getSessionCookie(request)) {
    const { pathname, search } = request.nextUrl;
    return NextResponse.redirect(new URL(loginUrl(pathname + search), request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};

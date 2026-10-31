import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse } from 'next/server';
import { loginUrl } from '@/lib/redirect';

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

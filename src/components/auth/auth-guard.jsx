'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { FullPageSkeleton } from '@/components/auth/full-page-skeleton';
import { authClient } from '@/lib/auth-client';
import { loginUrl } from '@/lib/redirect';

/** Client-side gate for protected pages. The API validates the session on every request. */
export function AuthGuard({ children }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useEffect(() => {
    if (isPending || session) return;
    // Clear a stale session cookie (e.g. revoked elsewhere) so proxy.js stops treating us as signed in.
    authClient
      .signOut()
      .catch(() => undefined)
      .finally(() => router.replace(loginUrl(search ? `${pathname}?${search}` : pathname)));
  }, [isPending, session, router, pathname, search]);

  if (isPending || !session) return <FullPageSkeleton />;
  return children;
}

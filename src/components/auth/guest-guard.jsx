'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { FullPageSkeleton } from '@/components/auth/full-page-skeleton';
import { authClient } from '@/lib/auth-client';
import { safeNextPath } from '@/lib/redirect';

/** Keeps signed-in users off /login and /register, honouring a validated `?next=`. */
export function GuestGuard({ children }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const next = useSearchParams().get('next');

  useEffect(() => {
    if (session) router.replace(safeNextPath(next));
  }, [session, router, next]);

  if (isPending || session) return <FullPageSkeleton />;
  return children;
}

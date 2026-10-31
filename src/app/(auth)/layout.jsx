import { Suspense } from 'react';
import { FullPageSkeleton } from '@/components/auth/full-page-skeleton';
import { AuthShell } from '@/components/auth/auth-shell';
import { GuestGuard } from '@/components/auth/guest-guard';
export default function AuthLayout({ children }) {
  return (
    <Suspense fallback={<FullPageSkeleton />}>
      <GuestGuard>
        <AuthShell>{children}</AuthShell>
      </GuestGuard>
    </Suspense>
  );
}

import { Suspense } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { FullPageSkeleton } from '@/components/auth/full-page-skeleton';
import { AppShell } from '@/components/layout/app-shell';
export default function DashboardLayout({ children }) {
  return (
    <Suspense fallback={<FullPageSkeleton />}>
      <AuthGuard>
        <AppShell>{children}</AppShell>
      </AuthGuard>
    </Suspense>
  );
}

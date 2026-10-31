'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Charts load on demand so the board and dashboard bundles stay small.
const AnalyticsPage = dynamic(() => import('@/components/dashboard/analytics-page'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 rounded-card" />,
});

export default function Page() {
  return <AnalyticsPage />;
}

import { Skeleton } from '@/components/ui/skeleton';
/** Shown while the session is being restored so no protected or login UI flashes. */
export function FullPageSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="min-h-dvh md:pl-[72px] lg:pl-64">
      <div className="fixed inset-y-0 left-0 hidden w-[72px] flex-col gap-4 border-r border-border p-3 md:flex lg:w-64">
        <Skeleton className="h-9 w-full lg:w-36" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="flex h-16 items-center gap-3 border-b border-border px-4 sm:px-6 lg:px-8">
        <Skeleton className="size-10 md:hidden" />
        <Skeleton className="hidden h-10 max-w-md flex-1 sm:block" />
        <Skeleton className="ml-auto size-10 rounded-full" />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-card" />
          <Skeleton className="h-36 rounded-card" />
        </div>
      </div>
      <span className="sr-only">Loading your session</span>
    </div>
  );
}

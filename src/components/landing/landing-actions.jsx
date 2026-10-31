'use client';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
function useIsAuthenticated() {
  const { data: session } = authClient.useSession();
  return Boolean(session);
}
export function HeaderActions() {
  const authed = useIsAuthenticated();
  return authed ? (
    <Link href="/dashboard" className={buttonVariants()}>
      Dashboard
    </Link>
  ) : (
    <>
      <Link
        href="/login"
        className={cn(buttonVariants({ variant: 'ghost' }), 'hidden sm:inline-flex')}
      >
        Sign in
      </Link>
      <Link href="/register" className={buttonVariants()}>
        Get started
      </Link>
    </>
  );
}
export function HeroActions() {
  const authed = useIsAuthenticated();
  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
      {authed ? (
        <Link href="/dashboard" className={buttonVariants({ size: 'lg' })}>
          Go to dashboard <ArrowRight aria-hidden className="size-4" />
        </Link>
      ) : (
        <>
          <Link href="/register" className={buttonVariants({ size: 'lg' })}>
            Start for free <ArrowRight aria-hidden className="size-4" />
          </Link>
          <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            Sign in
          </Link>
        </>
      )}
    </div>
  );
}
export function CtaActions() {
  const authed = useIsAuthenticated();
  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
      <Link
        href={authed ? '/dashboard' : '/register'}
        className={cn(
          buttonVariants({ size: 'lg' }),
          'bg-white text-[#3F46A0] shadow-none hover:bg-white/90',
        )}
      >
        {authed ? 'Open your dashboard' : 'Create your workspace'}
      </Link>
      {!authed && (
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'lg' }),
            'text-white hover:bg-white/15',
          )}
        >
          Sign in
        </Link>
      )}
    </div>
  );
}

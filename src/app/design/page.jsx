import Link from 'next/link';
import { Showcase } from '@/app/design/showcase';
import { Logo } from '@/components/layout/logo';
import { buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export const metadata = { title: 'Design system' };

export default function DesignPage() {
  return (
    <div className="min-h-dvh">
      <header className="pt-safe sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/dashboard" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Open app
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 pb-8">
          <h1 className="text-3xl">Design system</h1>
          <p className="max-w-2xl text-muted">
            Tokens and components in the dark-first, Linear-style language. Every demo responds to
            clicks; switch the theme or compare light and dark side by side.
          </p>
        </div>
        <Showcase />
      </main>
    </div>
  );
}

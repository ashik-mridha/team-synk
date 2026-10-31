import { Check } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
const highlights = [
  'Live boards that update for everyone instantly',
  'Clear priorities, owners and due dates',
  'Secure by design with encrypted sessions',
];
/** Split layout: brand panel on large screens, form only (with compact logo) below lg. */
export function AuthShell({ children }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-solid via-[#3F46A0] to-[#1B1C20] p-12 text-white lg:flex xl:p-16">
        <div
          aria-hidden
          className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-24 size-96 rounded-full bg-accent/30 blur-3xl"
        />
        <Logo className="relative" textClassName="text-white" />
        <div className="relative flex max-w-md flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-balance text-4xl font-semibold leading-tight text-white xl:text-5xl">
              Ship projects faster, together.
            </h2>
            <p className="text-lg text-white/85">
              One calm workspace for your whole team to plan, track and deliver.
            </p>
          </div>
          <ul className="flex flex-col gap-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-white/90">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Check aria-hidden className="size-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/70">© {new Date().getFullYear()} TeamSync</p>
      </aside>

      <main className="pt-safe pb-safe flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8 lg:justify-end">
          <Logo className="lg:hidden" />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-10 pt-2 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}

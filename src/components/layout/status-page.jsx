import { Logo } from '@/components/layout/logo';
/** Centered full-page message used by 404 and error screens. */
export function StatusPage({ code, title, description, children }) {
  return (
    <div className="pt-safe pb-safe relative isolate flex min-h-dvh flex-col items-center justify-center gap-10 overflow-hidden px-4 py-10 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,rgb(var(--primary)/0.14),transparent)]"
      />
      <Logo />
      <div className="flex max-w-md flex-col items-center gap-4">
        <p className="bg-gradient-to-r from-primary-solid to-accent bg-clip-text text-7xl font-semibold text-transparent sm:text-8xl">
          {code}
        </p>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        <p className="text-muted">{description}</p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
        {children}
      </div>
    </div>
  );
}

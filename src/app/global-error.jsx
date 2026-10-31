'use client';
import './globals.css';
/** Last-resort boundary. It replaces the root layout, so it applies the system theme itself. */
const applySystemTheme = `document.documentElement.classList.toggle('dark', matchMedia('(prefers-color-scheme: dark)').matches)`;
export default function GlobalError({ reset }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: applySystemTheme }} />
      </head>
      <body>
        <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
          <p className="text-7xl font-semibold text-primary-text">500</p>
          <h1 className="text-2xl font-semibold">TeamSync hit an unexpected error</h1>
          <p className="max-w-md text-muted">
            Please try again. If the problem persists, reload the page.
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center rounded-input bg-primary-solid px-6 font-medium text-white transition-colors hover:bg-primary-solid-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

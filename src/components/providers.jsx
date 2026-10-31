'use client';

import { ThemeProvider } from 'next-themes';
import { ErrorLogger } from '@/components/error-logger';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <TooltipProvider delayDuration={200}>
        <ErrorLogger />
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

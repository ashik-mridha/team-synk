'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Development-only safety net: any uncaught error or unhandled promise rejection (for example
 * inside a click handler) is logged to the console and surfaced as a toast, so a "button that
 * does nothing" always leaves evidence. Failed API calls are reported by lib/api.js.
 */
export function ErrorLogger() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    function onError(event) {
      console.error('[ui] Uncaught error:', event.error ?? event.message);
      toast.error(`UI error: ${event.message}`);
    }
    function onRejection(event) {
      const reason = event.reason;
      // API failures were already toasted by the axios interceptor.
      if (reason?.isAxiosError) return;
      console.error('[ui] Unhandled promise rejection:', reason);
      toast.error(`Unhandled error: ${reason?.message ?? String(reason)}`);
    }

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}

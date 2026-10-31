import axios from 'axios';
import { toast } from 'sonner';
import { API_URL } from '@/lib/config';
import { describeFailure, logFailure } from '@/lib/errors';

/** Client for the app's own REST API. Authentication is the Better Auth session cookie. */
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  // Free hosts can take ~30-60 s to wake from idle; keep the wait bounded but realistic.
  timeout: 30_000,
});

export function getApiErrorMessage(error) {
  return describeFailure(error).message;
}

/**
 * Every failed request is logged to the console and shown as a toast, so a click that does
 * nothing because the request failed is never silent. Pass `{ silent: true }` in the request
 * config to opt out when the caller renders its own error UI.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;
    logFailure(
      `api ${config?.method?.toUpperCase()} ${config?.url} -> ${response?.status ?? 'no response'}`,
      error,
    );

    if (response?.status === 401 && typeof window !== 'undefined') {
      const { pathname, search } = window.location;
      if (!pathname.startsWith('/login') && !pathname.startsWith('/register')) {
        window.location.replace(`/login?next=${encodeURIComponent(pathname + search)}`);
      }
    } else if (!config?.silent) {
      toast.error(getApiErrorMessage(error));
    }
    return Promise.reject(error);
  },
);

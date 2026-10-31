import axios from 'axios';
import { toast } from 'sonner';

/** Client for the app's own REST API. Authentication is the Better Auth session cookie. */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 15_000,
});

export function getApiErrorMessage(error) {
  const body = error?.response?.data;
  if (body?.error?.message) return body.error.message;
  if (error?.code === 'ERR_NETWORK') return 'Cannot reach the server. Check your connection.';
  return error?.message || 'Something went wrong. Please try again.';
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
    console.error(
      `[api] ${config?.method?.toUpperCase()} ${config?.url} -> ${response?.status ?? 'no response'}`,
      response?.data ?? error.message,
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

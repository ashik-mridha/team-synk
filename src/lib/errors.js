export const UNAVAILABLE_MESSAGE =
  'Server is temporarily unavailable. Please try again in a moment.';
const OFFLINE_MESSAGE = 'You appear to be offline. Check your connection and try again.';
const TIMEOUT_MESSAGE =
  'The server is taking too long to respond. It may be waking up, so try again.';
const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;

/**
 * Turns whatever a request produced into one user-facing problem.
 *
 * Accepts an axios error, a Better Auth `{ status, message }` error object or an exception thrown by
 * `fetch`. A browser reports a CORS block and a dead server identically (no response at all), and
 * the user can do nothing about either, so both read "temporarily unavailable"; `cause` carries the
 * precise class for logging.
 */
export function describeFailure(error) {
  const status = error?.response?.status ?? error?.status;
  const body = error?.response?.data;
  // axios errors carry the API's JSON error body; Better Auth errors carry their own message.
  const text = error?.isAxiosError ? body?.error?.message : error?.message;
  const serverMessage = typeof text === 'string' ? text : '';

  if (
    error?.code === 'ECONNABORTED' ||
    error?.code === 'ETIMEDOUT' ||
    error?.name === 'TimeoutError'
  ) {
    return { cause: 'timeout', message: TIMEOUT_MESSAGE };
  }
  if (!status) {
    // No HTTP response at all: offline, DNS, refused connection, TLS, or a CORS block.
    return isOffline()
      ? { cause: 'offline', message: OFFLINE_MESSAGE }
      : { cause: 'network-or-cors', message: UNAVAILABLE_MESSAGE };
  }
  if (status === 502 || status === 503 || status === 504) {
    return { cause: 'unavailable', message: UNAVAILABLE_MESSAGE };
  }
  if (status >= 500 && !serverMessage) {
    // e.g. a hosting provider's HTML error page instead of the API's JSON.
    return { cause: 'unavailable', message: UNAVAILABLE_MESSAGE };
  }
  return { cause: 'server', message: serverMessage || GENERIC_MESSAGE };
}

/** Developer-facing explanation of the most common deployment mistakes, for the console. */
export function logFailure(label, error) {
  if (process.env.NODE_ENV === 'production') return;
  const { cause } = describeFailure(error);
  const hint =
    cause === 'network-or-cors'
      ? 'No response. Either the API is down, the URL in NEXT_PUBLIC_* is wrong, or the browser blocked it with CORS (check CLIENT_URL on the server and the Network tab).'
      : cause === 'unavailable'
        ? 'The API (or the proxy in front of it) answered with an error page. Check the server logs.'
        : '';
  console.error(`[${label}] ${cause}`, hint, error);
}

import { useSyncExternalStore } from 'react';
const subscribe = () => () => {};
/** True after hydration; use to render values that differ between server and client (e.g. the active theme). */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

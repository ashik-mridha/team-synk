'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { matchesDue } from '@/lib/tasks';

export const VIEWS = Object.freeze({ BOARD: 'board', LIST: 'list' });
export const GROUPS = Object.freeze({
  STATUS: 'status',
  ASSIGNEE: 'assignee',
  PRIORITY: 'priority',
  LABEL: 'label',
});
/**
 * Board/list filters, kept in the URL (?view=list&group=assignee&p=high,low&a=me&l=bug&due=overdue&q=...)
 * so a view can be shared, bookmarked and survives a reload.
 */
export function useBoardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const filters = useMemo(
    () => ({
      view: params.get('view') === VIEWS.LIST ? VIEWS.LIST : VIEWS.BOARD,
      group: Object.values(GROUPS).includes(params.get('group'))
        ? params.get('group')
        : GROUPS.STATUS,
      sort: params.get('sort') ?? 'manual',
      priorities: new Set((params.get('p') ?? '').split(',').filter(Boolean)),
      assignee: params.get('a') ?? '',
      label: params.get('l') ?? '',
      due: params.get('due') ?? '',
      query: params.get('q') ?? '',
    }),
    [params],
  );

  const update = useCallback(
    (changes) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === '' || value === undefined) next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const togglePriority = useCallback(
    (value) => {
      const next = new Set(filters.priorities);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      update({ p: [...next].join(',') });
    },
    [filters.priorities, update],
  );

  const clearAll = useCallback(
    () => update({ p: null, a: null, l: null, due: null, q: null }),
    [update],
  );

  const activeCount =
    filters.priorities.size +
    (filters.assignee ? 1 : 0) +
    (filters.label ? 1 : 0) +
    (filters.due ? 1 : 0) +
    (filters.query ? 1 : 0);

  const apply = useCallback(
    (tasks, myId) => {
      const q = filters.query.trim().toLowerCase();
      return tasks.filter((t) => {
        if (filters.priorities.size && !filters.priorities.has(t.priority)) return false;
        if (filters.assignee) {
          const target = filters.assignee === 'me' ? myId : filters.assignee;
          if (target === 'none' ? t.assignee : t.assignee !== target) return false;
        }
        if (filters.label && !t.labels.includes(filters.label)) return false;
        if (!matchesDue(t, filters.due)) return false;
        if (q && !t.title.toLowerCase().includes(q)) return false;
        return true;
      });
    },
    [filters],
  );

  return { filters, update, togglePriority, clearAll, activeCount, apply };
}

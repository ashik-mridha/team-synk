'use client';

import { Folder, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { StatusIcon } from '@/components/ui/status-icon';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/store/workspace.store';

export const SEARCH_INPUT_ID = 'global-search';

/** Debounced (300 ms) workspace search. The "/" shortcut focuses it (see GlobalShortcuts). */
export function SearchBox() {
  const router = useRouter();
  const workspaceId = useWorkspaceStore((s) => s.currentId);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(query.trim(), 300);

  useEffect(() => {
    if (!workspaceId || !debounced) return;
    let cancelled = false;
    api
      .get(`/workspaces/${workspaceId}/search`, { params: { q: debounced }, silent: true })
      .then((res) => {
        if (cancelled) return;
        setResults(res.data.data);
        setOpen(true);
      })
      .catch(() => {
        if (!cancelled) setResults({ projects: [], tasks: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, workspaceId]);

  function go(href) {
    setOpen(false);
    setQuery('');
    setResults(null);
    router.push(href);
  }

  const visible = open && debounced && results;
  const empty = visible && results.projects.length === 0 && results.tasks.length === 0;

  return (
    <Popover open={Boolean(visible)} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="relative w-full">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-subtle"
            strokeWidth={1.5}
          />
          <Input
            id={SEARCH_INPUT_ID}
            type="search"
            value={query}
            disabled={!workspaceId}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value) {
                setResults(null);
                setOpen(false);
              }
            }}
            onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
            placeholder="Search tasks and projects"
            aria-label="Search tasks and projects"
            autoComplete="off"
            className="pl-8 pr-8"
          />
          <kbd
            aria-hidden
            className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-chip border border-border px-1.5 font-sans text-xs text-subtle md:block"
          >
            /
          </kbd>
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-72 p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {empty && <p className="px-3 py-4 text-center text-xs text-muted">No results</p>}
        {visible && results.projects.length > 0 && (
          <div className="py-1">
            <p className="px-2 py-1 text-xs text-subtle">Projects</p>
            {results.projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => go(`/dashboard/projects/${project.id}`)}
                className="flex h-9 w-full items-center gap-2 rounded-chip px-2 text-left text-sm hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
              >
                <Folder aria-hidden className="size-4 text-muted" strokeWidth={1.5} />
                <span className="truncate">{project.name}</span>
              </button>
            ))}
          </div>
        )}
        {visible && results.tasks.length > 0 && (
          <div className="py-1">
            <p className="px-2 py-1 text-xs text-subtle">Tasks</p>
            {results.tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => go(`/dashboard/projects/${task.project}?task=${task.id}`)}
                className="flex h-9 w-full items-center gap-2 rounded-chip px-2 text-left text-sm hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
              >
                <StatusIcon status={task.status} />
                <span className="truncate">{task.title}</span>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

'use client';

import { SearchX } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/store/workspace.store';

/** Resolves /p/WEB/T-42 to the task: current workspace first, then the user's others. */
export function DeepLink() {
  const { key, ref } = useParams();
  const router = useRouter();
  const status = useWorkspaceStore((s) => s.status);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (status !== 'ready') return;
    const number = Number(String(ref).replace(/^T-/i, ''));
    const { workspaces, currentId } = useWorkspaceStore.getState();
    const ordered = [...workspaces].sort((a) => (a.id === currentId ? -1 : 1));
    let cancelled = false;

    async function resolve() {
      for (const workspace of ordered) {
        try {
          const res = await api.get(`/workspaces/${workspace.id}/resolve`, {
            params: { key, number },
            silent: true,
          });
          if (cancelled) return;
          if (workspace.id !== currentId)
            await useWorkspaceStore.getState().selectWorkspace(workspace.id);
          const { projectId, taskId } = res.data.data;
          router.replace(`/dashboard/projects/${projectId}?task=${taskId}`);
          return;
        } catch {
          // Not in this workspace; try the next one.
        }
      }
      if (!cancelled) setMissing(true);
    }
    resolve();
    return () => {
      cancelled = true;
    };
  }, [status, key, ref, router]);

  if (missing) {
    return (
      <EmptyState
        icon={SearchX}
        title="Task not found"
        description={`${String(key).toUpperCase()}-${String(ref).replace(/^T-/i, '')} does not exist, or you do not have access to it.`}
      />
    );
  }
  return <Skeleton className="h-40 rounded-card" />;
}

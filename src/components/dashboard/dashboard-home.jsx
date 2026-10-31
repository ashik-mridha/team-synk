'use client';

import { FolderKanban, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { authClient } from '@/lib/auth-client';
import { MODAL } from '@/lib/constants';
import { useUiStore } from '@/store/ui.store';
import { selectCurrentWorkspace, useWorkspaceStore } from '@/store/workspace.store';

export function DashboardHome() {
  const { data: session } = authClient.useSession();
  const status = useWorkspaceStore((s) => s.status);
  const workspace = useWorkspaceStore(selectCurrentWorkspace);
  const projects = useWorkspaceStore((s) => s.projects);
  const openModal = useUiStore((s) => s.openModal);
  const firstName = session?.user.name.split(' ')[0];

  if (status !== 'ready') {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-7 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-24 rounded-card" />
          <Skeleton className="h-24 rounded-card" />
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl">Welcome, {firstName}</h1>
        <EmptyState
          icon={FolderKanban}
          title="Create your first workspace"
          description="A workspace holds your projects and teammates."
          action={
            <Button onClick={() => openModal(MODAL.CREATE_WORKSPACE)}>
              <Plus aria-hidden className="size-4" /> Create workspace
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl">Welcome back, {firstName}</h1>
          <p className="text-muted">{workspace.name}</p>
        </div>
        <Button onClick={() => openModal(MODAL.CREATE_PROJECT)}>
          <Plus aria-hidden className="size-4" /> New project
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create a project to get a board for your tasks."
          action={
            <Button onClick={() => openModal(MODAL.CREATE_PROJECT)}>
              <Plus aria-hidden className="size-4" /> New project
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Card className="flex items-center gap-3 p-4 transition-colors duration-150 hover:bg-surface-muted">
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-input text-xs font-semibold text-black/70"
                    style={{ backgroundColor: project.color }}
                  >
                    {project.key}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{project.name}</span>
                    <span className="block text-xs text-muted">Open board</span>
                  </span>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

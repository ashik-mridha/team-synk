'use client';

import { Check, ChevronDown, Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MODAL } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui.store';
import { selectCurrentWorkspace, useWorkspaceStore } from '@/store/workspace.store';

export function WorkspaceTile({ name, className }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-primary-solid text-[11px] font-semibold text-white',
        className,
      )}
    >
      {name?.[0]?.toUpperCase() ?? '?'}
    </span>
  );
}

export function WorkspaceSwitcher({ className, onNavigate }) {
  const router = useRouter();
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const current = useWorkspaceStore(selectCurrentWorkspace);
  const selectWorkspace = useWorkspaceStore((s) => s.selectWorkspace);
  const openModal = useUiStore((s) => s.openModal);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex h-11 min-w-0 items-center gap-2 rounded-input px-2 text-sm font-medium transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:h-8',
          className,
        )}
      >
        <WorkspaceTile name={current?.name} />
        <span className="min-w-0 flex-1 truncate text-left">{current?.name ?? 'No workspace'}</span>
        <ChevronDown aria-hidden className="size-3.5 shrink-0 text-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onSelect={async () => {
              await selectWorkspace(workspace.id);
              router.push('/dashboard');
              onNavigate?.();
            }}
          >
            <WorkspaceTile name={workspace.name} />
            <span className="flex-1 truncate">{workspace.name}</span>
            {workspace.id === current?.id && <Check aria-hidden className="text-primary-text" />}
          </DropdownMenuItem>
        ))}
        {workspaces.length > 0 && <DropdownMenuSeparator />}
        <DropdownMenuItem onSelect={() => openModal(MODAL.CREATE_WORKSPACE)}>
          <Plus aria-hidden /> Create workspace
        </DropdownMenuItem>
        {current && (
          <DropdownMenuItem
            onSelect={() => {
              router.push('/dashboard/settings/members');
              onNavigate?.();
            }}
          >
            <Users aria-hidden /> Members and roles
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

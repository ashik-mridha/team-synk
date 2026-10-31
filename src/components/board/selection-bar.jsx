'use client';

import { ChevronDown, Command, Trash2, UserRound, X } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusIcon } from '@/components/ui/status-icon';
import { PRIORITY_LABELS, Priority } from '@/lib/constants';
import { COLUMNS } from '@/lib/tasks';
import { useUiStore } from '@/store/ui.store';

function Menu({ label, icon, align = 'center', children }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {icon}
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side="top">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Floating bulk-action bar shown while two or more cards are selected. */
export function SelectionBar({ count, members, onMove, onAssign, onPriority, onDelete, onClear }) {
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen);

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className="pb-safe fixed bottom-4 left-1/2 z-40 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 animate-rise-in flex-wrap items-center justify-center gap-1 rounded-card border border-border-strong bg-elevated p-1.5 shadow-overlay"
    >
      <span className="px-2 text-sm text-muted">{count} selected</span>

      <Menu label="Move to" icon={<ChevronDown aria-hidden className="order-last size-3.5" />}>
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        {COLUMNS.map((column) => (
          <DropdownMenuItem key={column.status} onSelect={() => onMove(column.status)}>
            <StatusIcon status={column.status} /> {column.title}
          </DropdownMenuItem>
        ))}
      </Menu>

      <Menu label="Assign" icon={<UserRound aria-hidden className="size-3.5" />}>
        <DropdownMenuLabel>Assignee</DropdownMenuLabel>
        {members.map((member) => (
          <DropdownMenuItem key={member.userId} onSelect={() => onAssign(member.userId)}>
            <Avatar name={member.name} src={member.image ?? undefined} size="xs" />
            {member.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onAssign(null)}>Unassign</DropdownMenuItem>
      </Menu>

      <Menu label="Priority">
        <DropdownMenuLabel>Priority</DropdownMenuLabel>
        {Object.values(Priority).map((value) => (
          <DropdownMenuItem key={value} onSelect={() => onPriority(value)}>
            {PRIORITY_LABELS[value]}
          </DropdownMenuItem>
        ))}
      </Menu>

      <Button variant="outline" size="sm" onClick={() => setPaletteOpen(true)}>
        <Command aria-hidden className="size-3.5" /> Command
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Delete selected" onClick={onDelete}>
        <Trash2 aria-hidden className="size-4" strokeWidth={1.5} />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Clear selection" onClick={onClear}>
        <X aria-hidden className="size-4" />
      </Button>
    </div>
  );
}

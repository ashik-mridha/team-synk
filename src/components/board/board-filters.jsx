'use client';

import { Check, Plus, X } from 'lucide-react';
import { DashedChip, Chip } from '@/components/ui/chip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DUE_PRESETS } from '@/lib/tasks';
import { PRIORITY_LABELS, Priority } from '@/lib/constants';

const DUE_LABELS = {
  [DUE_PRESETS.TODAY]: 'Due today',
  [DUE_PRESETS.WEEK]: 'Due this week',
  [DUE_PRESETS.OVERDUE]: 'Overdue',
  [DUE_PRESETS.NONE]: 'No due date',
};

/** Menu rows stay open after a click so several filters can be combined quickly. */
function CheckItem({ checked, onToggle, children }) {
  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();
        onToggle();
      }}
    >
      <span className="flex-1">{children}</span>
      {checked && <Check aria-hidden className="text-primary-text" />}
    </DropdownMenuItem>
  );
}

export function FilterMenu({
  filters,
  activeCount,
  members,
  labels,
  onTogglePriority,
  onUpdate,
  onClear,
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <DashedChip>
          <Plus aria-hidden className="size-3.5" />
          Filter{activeCount > 0 && ` · ${activeCount}`}
        </DashedChip>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Priority</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {Object.values(Priority).map((value) => (
              <CheckItem
                key={value}
                checked={filters.priorities.has(value)}
                onToggle={() => onTogglePriority(value)}
              >
                {PRIORITY_LABELS[value]}
              </CheckItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Assignee</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <CheckItem
              checked={filters.assignee === 'me'}
              onToggle={() => onUpdate({ a: filters.assignee === 'me' ? null : 'me' })}
            >
              Assigned to me
            </CheckItem>
            <CheckItem
              checked={filters.assignee === 'none'}
              onToggle={() => onUpdate({ a: filters.assignee === 'none' ? null : 'none' })}
            >
              Unassigned
            </CheckItem>
            <DropdownMenuSeparator />
            {members.map((m) => (
              <CheckItem
                key={m.userId}
                checked={filters.assignee === m.userId}
                onToggle={() => onUpdate({ a: filters.assignee === m.userId ? null : m.userId })}
              >
                {m.name}
              </CheckItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Label</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {labels.length === 0 && <p className="px-2 py-1.5 text-xs text-muted">No labels yet</p>}
            {labels.map((label) => (
              <CheckItem
                key={label}
                checked={filters.label === label}
                onToggle={() => onUpdate({ l: filters.label === label ? null : label })}
              >
                {label}
              </CheckItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Due date</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {Object.values(DUE_PRESETS).map((preset) => (
              <CheckItem
                key={preset}
                checked={filters.due === preset}
                onToggle={() => onUpdate({ due: filters.due === preset ? null : preset })}
              >
                {DUE_LABELS[preset]}
              </CheckItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {activeCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onClear}>Clear all</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** One removable chip per active filter, next to the Filter button. */
export function ActiveFilters({ filters, membersById, onTogglePriority, onUpdate }) {
  const chips = [
    ...[...filters.priorities].map((p) => ({
      key: `p-${p}`,
      label: `Priority: ${PRIORITY_LABELS[p]}`,
      remove: () => onTogglePriority(p),
    })),
    filters.assignee && {
      key: 'a',
      label: `Assignee: ${
        filters.assignee === 'me'
          ? 'me'
          : filters.assignee === 'none'
            ? 'unassigned'
            : (membersById.get(filters.assignee)?.name ?? '…')
      }`,
      remove: () => onUpdate({ a: null }),
    },
    filters.label && {
      key: 'l',
      label: `Label: ${filters.label}`,
      remove: () => onUpdate({ l: null }),
    },
    filters.due && {
      key: 'due',
      label: DUE_LABELS[filters.due],
      remove: () => onUpdate({ due: null }),
    },
  ].filter(Boolean);

  return chips.map((chip) => (
    <Chip key={chip.key} className="h-7 pr-1">
      {chip.label}
      <button
        type="button"
        aria-label={`Remove filter ${chip.label}`}
        onClick={chip.remove}
        className="rounded-sm p-0.5 text-subtle hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <X aria-hidden className="size-3" />
      </button>
    </Chip>
  ));
}

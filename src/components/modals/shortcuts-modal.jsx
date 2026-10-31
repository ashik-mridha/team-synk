'use client';

import { SHORTCUT_GROUPS } from '@/components/layout/global-shortcuts';
import { Modal } from '@/components/ui/modal';

function Keys({ keys }) {
  return (
    <span className="flex items-center gap-1">
      {keys.map((key, i) => (
        <span key={key} className="flex items-center gap-1">
          {i > 0 && <span className="text-xs text-subtle">then</span>}
          <kbd className="min-w-6 rounded-chip border border-border-strong bg-surface-muted px-1.5 py-0.5 text-center font-sans text-xs">
            {key}
          </kbd>
        </span>
      ))}
    </span>
  );
}

export function ShortcutsModal({ open, onOpenChange }) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Keyboard shortcuts"
      description="Single-key shortcuts are off while you type in a field."
      className="max-w-xl"
    >
      <div className="grid gap-6 pb-2 sm:grid-cols-2">
        {SHORTCUT_GROUPS.map((group) => (
          <section key={group.title} aria-label={group.title} className="flex flex-col gap-2">
            <h3 className="text-xs font-medium text-subtle">{group.title}</h3>
            <ul className="flex flex-col gap-2">
              {group.items.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted">{item.label}</span>
                  <Keys keys={item.keys} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Modal>
  );
}

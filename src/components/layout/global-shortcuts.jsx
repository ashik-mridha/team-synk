'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { SEARCH_INPUT_ID } from '@/components/layout/search-box';
import { MODAL } from '@/lib/constants';
import { useRecentStore } from '@/store/recent.store';
import { useUiStore } from '@/store/ui.store';
import { useWorkspaceStore } from '@/store/workspace.store';

/** Shortcut list shown in the cheat sheet (keep in sync with the handler below). */
export const SHORTCUT_GROUPS = [
  {
    title: 'General',
    items: [
      { keys: ['Ctrl', 'K'], label: 'Command palette' },
      { keys: ['/'], label: 'Focus search' },
      { keys: ['?'], label: 'Show this cheat sheet' },
      { keys: ['Esc'], label: 'Close dialog, clear selection' },
    ],
  },
  {
    title: 'Go to',
    items: [
      { keys: ['G', 'B'], label: 'Board (last opened project)' },
      { keys: ['G', 'I'], label: 'Inbox' },
      { keys: ['G', 'A'], label: 'Analytics' },
      { keys: ['G', 'O'], label: 'Overview' },
      { keys: ['G', 'M'], label: 'Members' },
    ],
  },
  {
    title: 'Tasks',
    items: [
      { keys: ['C'], label: 'Create task (on a board)' },
      { keys: ['E'], label: 'Edit title (task open)' },
      { keys: ['A'], label: 'Assign (task open)' },
      { keys: ['P'], label: 'Set priority (task open)' },
      { keys: ['S'], label: 'Set status (task open)' },
      { keys: ['Shift', 'Click'], label: 'Select several cards' },
    ],
  },
];

const FIELD_KEYS = { e: 'title', a: 'assignee', p: 'priority', s: 'status' };
const CHORD_TIMEOUT_MS = 1000;

function isTyping(target) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

/** Keyboard-first navigation. Single-key shortcuts are ignored while typing in a field. */
export function GlobalShortcuts() {
  const router = useRouter();

  useEffect(() => {
    let chordTimer = null;
    let awaitingChord = false;

    const clearChord = () => {
      awaitingChord = false;
      clearTimeout(chordTimer);
    };

    function lastBoardHref() {
      const recent = useRecentStore.getState().items.find((i) => i.type === 'project');
      const first = useWorkspaceStore.getState().projects[0];
      return recent?.href ?? (first ? `/dashboard/projects/${first.id}` : null);
    }

    function goTo(key) {
      const routes = {
        i: '/dashboard/inbox',
        a: '/dashboard/analytics',
        o: '/dashboard',
        m: '/dashboard/settings/members',
        b: lastBoardHref(),
      };
      if (key === 'b' && !routes.b) return toast.info('Create a project first');
      if (routes[key]) router.push(routes[key]);
    }

    function onKeyDown(event) {
      const ui = useUiStore.getState();

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        ui.setPaletteOpen(!ui.paletteOpen);
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey || isTyping(event.target)) return;
      // A modal/menu is open: leave the keys to it (except Escape, which it handles itself).
      if (document.querySelector('[role="menu"]')) return;

      const key = event.key.toLowerCase();

      if (awaitingChord) {
        clearChord();
        if (['b', 'i', 'a', 'o', 'm'].includes(key)) {
          event.preventDefault();
          goTo(key);
        }
        return;
      }

      if (event.key === '?') {
        event.preventDefault();
        ui.openModal(MODAL.SHORTCUTS);
      } else if (event.key === '/') {
        const input = document.getElementById(SEARCH_INPUT_ID);
        if (input) {
          event.preventDefault();
          input.focus();
        }
      } else if (key === 'g') {
        awaitingChord = true;
        chordTimer = setTimeout(clearChord, CHORD_TIMEOUT_MS);
      } else if (key === 'c') {
        if (window.location.pathname.startsWith('/dashboard/projects/')) {
          event.preventDefault();
          ui.openModal(MODAL.CREATE_TASK);
        } else {
          toast.info('Open a board to create a task');
        }
      } else if (FIELD_KEYS[key] && document.querySelector('[data-task-drawer]')) {
        const field = document.querySelector(
          `[data-task-drawer] [data-field="${FIELD_KEYS[key]}"]`,
        );
        if (field && !field.disabled) {
          event.preventDefault();
          field.focus();
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      clearChord();
    };
  }, [router]);

  return null;
}

'use client';

import dynamic from 'next/dynamic';
import { MODAL } from '@/lib/constants';
import { useUiStore } from '@/store/ui.store';

const lazy = (loader, name) => dynamic(() => loader().then((m) => m[name]), { ssr: false });
const CreateWorkspaceModal = lazy(
  () => import('@/components/modals/create-workspace-modal'),
  'CreateWorkspaceModal',
);
const CreateProjectModal = lazy(
  () => import('@/components/modals/create-project-modal'),
  'CreateProjectModal',
);
const InviteModal = lazy(() => import('@/components/modals/invite-modal'), 'InviteModal');
const ShortcutsModal = lazy(() => import('@/components/modals/shortcuts-modal'), 'ShortcutsModal');

/** Renders whichever global modal is open (see useUiStore.openModal); each loads on first use. */
export function ModalHost() {
  const modal = useUiStore((s) => s.modal);
  const closeModal = useUiStore((s) => s.closeModal);
  const onOpenChange = (open) => !open && closeModal();

  return (
    <>
      {modal === MODAL.CREATE_WORKSPACE && (
        <CreateWorkspaceModal open onOpenChange={onOpenChange} />
      )}
      {modal === MODAL.CREATE_PROJECT && <CreateProjectModal open onOpenChange={onOpenChange} />}
      {modal === MODAL.INVITE && <InviteModal open onOpenChange={onOpenChange} />}
      {modal === MODAL.SHORTCUTS && <ShortcutsModal open onOpenChange={onOpenChange} />}
    </>
  );
}

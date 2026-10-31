'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useWorkspaceStore } from '@/store/workspace.store';

export function CreateWorkspaceModal({ open, onOpenChange }) {
  const router = useRouter();
  const createWorkspace = useWorkspaceStore((s) => s.createWorkspace);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (name.trim().length < 2) return setError('Name must be at least 2 characters');
    setError('');
    setLoading(true);
    try {
      const workspace = await createWorkspace(name.trim());
      toast.success(`Workspace "${workspace.name}" created`);
      setName('');
      onOpenChange(false);
      router.push('/dashboard');
    } catch {
      // The API client already reported the failure.
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Create workspace"
      description="A workspace holds your projects and teammates. You become its owner."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="create-workspace-form" loading={loading}>
            Create workspace
          </Button>
        </>
      }
    >
      <form id="create-workspace-form" onSubmit={handleSubmit} noValidate>
        <FormField label="Workspace name" error={error} required>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Studio"
            maxLength={50}
          />
        </FormField>
      </form>
    </Modal>
  );
}

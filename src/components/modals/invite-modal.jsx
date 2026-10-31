'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMyRole } from '@/hooks/useMyRole';
import { api } from '@/lib/api';
import { ROLE_LABELS, Role } from '@/lib/constants';
import { useUiStore } from '@/store/ui.store';
import { useWorkspaceStore } from '@/store/workspace.store';

function RoleSelect({ value, onChange, myRole }) {
  return (
    <FormField label="Role">
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value={Role.MEMBER}>{ROLE_LABELS[Role.MEMBER]}</option>
        <option value={Role.VIEWER}>{ROLE_LABELS[Role.VIEWER]}</option>
        {myRole === Role.OWNER && <option value={Role.ADMIN}>{ROLE_LABELS[Role.ADMIN]}</option>}
      </Select>
    </FormField>
  );
}

/** Creates a single-use, expiring link. The raw link is displayed once; only a hash is stored. */
function LinkForm({ workspaceId, myRole, onDone }) {
  const [role, setRole] = useState(Role.MEMBER);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = email.trim();
    if (trimmed && !/^\S+@\S+\.\S+$/.test(trimmed)) return setError('Enter a valid email address');
    setError('');
    setLoading(true);
    try {
      const res = await api.post(`/workspaces/${workspaceId}/invites`, {
        role,
        email: trimmed || null,
      });
      const { invite, link: created } = res.data.data;
      useUiStore.getState().rememberInviteLink(invite.id, created);
      useUiStore.getState().bumpMembersVersion();
      setLink(created);
    } catch {
      // The API client already reported the failure.
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Invite link copied');
    } catch {
      toast.error('Could not copy. Select the link and copy it manually.');
    }
  }

  if (link) {
    return (
      <div className="flex flex-col gap-3">
        <FormField
          label="Invite link"
          hint="Single use, expires in 7 days. It will not be shown again."
        >
          <Input
            readOnly
            value={link}
            onFocus={(e) => e.target.select()}
            className="font-mono text-xs"
          />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onDone}>
            Done
          </Button>
          <Button onClick={copy}>
            {copied ? (
              <Check aria-hidden className="size-4" />
            ) : (
              <Copy aria-hidden className="size-4" />
            )}
            {copied ? 'Copied' : 'Copy link'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <RoleSelect value={role} onChange={setRole} myRole={myRole} />
      <FormField
        label="Restrict to an email (optional)"
        error={error}
        hint="Only this address can use the link."
      >
        <Input
          type="email"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teammate@company.com"
        />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          Create invite link
        </Button>
      </div>
    </form>
  );
}

/** Adds someone who already has a TeamSync account, straight away. */
function AddForm({ workspaceId, myRole, onDone }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(Role.MEMBER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address');
    setError('');
    setLoading(true);
    try {
      await api.post(`/workspaces/${workspaceId}/members`, { email: email.trim(), role });
      toast.success(`${email.trim()} was added to the workspace`);
      useUiStore.getState().bumpMembersVersion();
      onDone();
    } catch {
      // The API client already reported the failure.
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormField label="Email" error={error} required>
        <Input
          type="email"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teammate@company.com"
        />
      </FormField>
      <RoleSelect value={role} onChange={setRole} myRole={myRole} />
      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          Add to workspace
        </Button>
      </div>
    </form>
  );
}

export function InviteModal({ open, onOpenChange }) {
  const workspaceId = useWorkspaceStore((s) => s.currentId);
  const myRole = useMyRole();
  const close = () => onOpenChange(false);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Invite people"
      description="Share a link, or add someone who already has an account."
    >
      <Tabs defaultValue="link">
        <TabsList>
          <TabsTrigger value="link">Invite link</TabsTrigger>
          <TabsTrigger value="existing">Add existing user</TabsTrigger>
        </TabsList>
        <TabsContent value="link">
          <LinkForm workspaceId={workspaceId} myRole={myRole} onDone={close} />
        </TabsContent>
        <TabsContent value="existing">
          <AddForm workspaceId={workspaceId} myRole={myRole} onDone={close} />
        </TabsContent>
      </Tabs>
    </Modal>
  );
}

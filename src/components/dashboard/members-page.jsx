'use client';

import { Trash2, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { InvitesPanel } from '@/components/dashboard/invites-panel';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { api } from '@/lib/api';
import { MODAL, ROLE_LABELS, Role, SocketEvent } from '@/lib/constants';
import { Action, can } from '@/lib/permissions';
import { connectSocket, emitWithAck, getSocket } from '@/lib/socket';
import { timeAgo } from '@/lib/utils';
import { useUiStore } from '@/store/ui.store';
import { selectCurrentWorkspace, useWorkspaceStore } from '@/store/workspace.store';

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

const gridClasses = 'md:grid-cols-[minmax(0,1.6fr)_140px_110px_110px_44px]';

/** Roles the caller may assign to `member`, mirroring the API rules. */
function roleOptions(myRole, member) {
  if (myRole === Role.OWNER) return Object.values(Role);
  if (myRole === Role.ADMIN && [Role.MEMBER, Role.VIEWER].includes(member.role)) {
    return [Role.MEMBER, Role.VIEWER];
  }
  return [];
}

export function MembersPage() {
  const workspace = useWorkspaceStore(selectCurrentWorkspace);
  const workspaceId = workspace?.id;
  const status = useWorkspaceStore((s) => s.status);
  const openModal = useUiStore((s) => s.openModal);
  const membersVersion = useUiStore((s) => s.membersVersion);
  const bump = useUiStore((s) => s.bumpMembersVersion);
  const [members, setMembers] = useState(null);
  const [me, setMe] = useState({ userId: null, role: null });
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    api
      .get(`/workspaces/${workspaceId}/members`)
      .then((res) => {
        if (cancelled) return;
        setMembers(res.data.data.members);
        setMe({ userId: res.data.data.currentUserId, role: res.data.data.role });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [workspaceId, membersVersion]);

  // Someone else changed the roster: refetch.
  useEffect(() => {
    if (!workspaceId) return;
    const socket = connectSocket();
    const join = () => emitWithAck('workspace:join', workspaceId);
    socket.on('connect', join);
    socket.on(SocketEvent.MEMBERS_CHANGED, bump);
    if (socket.connected) join();
    return () => {
      socket.off('connect', join);
      getSocket().off(SocketEvent.MEMBERS_CHANGED, bump);
    };
  }, [workspaceId, bump]);

  if (status === 'ready' && !workspace) {
    return (
      <EmptyState
        icon={UserPlus}
        title="No workspace yet"
        description="Create a workspace to manage members and roles."
      />
    );
  }

  if (!workspace || !members) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-12 rounded-card" />
        <Skeleton className="h-12 rounded-card" />
        <Skeleton className="h-12 rounded-card" />
      </div>
    );
  }

  const canInvite = can(me.role, Action.MANAGE_INVITES);

  /** Mirrors the API rules for what to render; the API enforces them regardless. */
  const canRemove = (member) =>
    member.userId === me.userId ||
    me.role === Role.OWNER ||
    (me.role === Role.ADMIN && [Role.MEMBER, Role.VIEWER].includes(member.role));

  async function changeRole(member, role) {
    try {
      const res = await api.patch(`/workspaces/${workspace.id}/members/${member.userId}/role`, {
        role,
      });
      setMembers(res.data.data.members);
      toast.success(`${member.name} is now ${ROLE_LABELS[role].toLowerCase()}`);
    } catch {
      // The API client toasts the reason (for example "keep at least one owner").
    }
  }

  async function removeMember(member) {
    const res = await api.delete(`/workspaces/${workspace.id}/members/${member.userId}`);
    toast.success(
      member.userId === me.userId ? 'You left the workspace' : `${member.name} was removed`,
    );
    if (member.userId === me.userId) {
      await useWorkspaceStore.getState().fetchWorkspaces();
      return;
    }
    setMembers(res.data.data.members);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-base">
            {workspace.name}{' '}
            <span className="font-normal text-muted">· {members.length} members</span>
          </h2>
          <p className="max-w-xl text-xs text-muted">
            Owners manage everyone. Admins manage members and viewers. Nobody can change their own
            role, and a workspace always keeps at least one owner.
          </p>
        </div>
        {canInvite && (
          <Button onClick={() => openModal(MODAL.INVITE)}>
            <UserPlus aria-hidden className="size-4" /> Invite
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        <div
          className={`hidden gap-3 border-b border-border px-4 py-2 text-xs font-medium text-subtle md:grid ${gridClasses}`}
        >
          <span>Member</span>
          <span>Role</span>
          <span>Joined</span>
          <span>Last active</span>
          <span className="sr-only">Actions</span>
        </div>
        <ul>
          {members.map((member) => {
            const options = member.userId === me.userId ? [] : roleOptions(me.role, member);
            return (
              <li
                key={member.userId}
                className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-b border-border px-4 py-3 last:border-b-0 ${gridClasses}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={member.name} src={member.image ?? undefined} size="md" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate font-medium">
                      <span className="truncate">{member.name}</span>
                      {member.userId === me.userId && <Badge>You</Badge>}
                    </p>
                    <p className="truncate text-xs text-muted">{member.email}</p>
                  </div>
                </div>

                <div className="order-3 col-span-2 flex items-center gap-3 md:order-none md:col-span-1">
                  <Select
                    aria-label={`Role of ${member.name}`}
                    value={member.role}
                    disabled={options.length === 0}
                    onChange={(e) => changeRole(member, e.target.value)}
                    className="w-full md:w-[126px]"
                  >
                    {Object.values(Role).map((role) => (
                      <option
                        key={role}
                        value={role}
                        disabled={!options.includes(role) && role !== member.role}
                      >
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </Select>
                  <span className="text-xs text-muted md:hidden">
                    Joined {dateFormat.format(new Date(member.joinedAt))}
                  </span>
                </div>

                <span className="hidden text-xs text-muted md:block">
                  {dateFormat.format(new Date(member.joinedAt))}
                </span>
                <span className="hidden text-xs text-muted md:block">
                  {member.lastActiveAt ? timeAgo(member.lastActiveAt) : 'Never'}
                </span>

                <div className="flex justify-end">
                  {canRemove(member) && (
                    <Tooltip
                      content={member.userId === me.userId ? 'Leave workspace' : 'Remove member'}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={
                          member.userId === me.userId ? 'Leave workspace' : `Remove ${member.name}`
                        }
                        onClick={() => setRemoving(member)}
                      >
                        <Trash2 aria-hidden className="size-4" strokeWidth={1.5} />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {canInvite && <InvitesPanel workspaceId={workspace.id} />}

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={
          removing?.userId === me.userId ? 'Leave this workspace?' : `Remove ${removing?.name}?`
        }
        description={
          removing?.userId === me.userId
            ? 'You will lose access to its projects and tasks.'
            : 'They will lose access to this workspace and its projects.'
        }
        confirmLabel={removing?.userId === me.userId ? 'Leave' : 'Remove'}
        destructive
        onConfirm={() => removeMember(removing).catch(() => undefined)}
      />
    </div>
  );
}

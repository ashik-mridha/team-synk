'use client';

import { Copy, Link2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { api } from '@/lib/api';
import { ROLE_LABELS } from '@/lib/constants';
import { timeAgo } from '@/lib/utils';
import { useUiStore } from '@/store/ui.store';

/** Pending invites with revoke. Copy works for links created in this session (tokens are hashed). */
export function InvitesPanel({ workspaceId }) {
  const [invites, setInvites] = useState([]);
  const version = useUiStore((s) => s.membersVersion);
  const links = useUiStore((s) => s.inviteLinks);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/workspaces/${workspaceId}/invites`, { silent: true })
      .then((res) => !cancelled && setInvites(res.data.data.invites))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [workspaceId, version]);

  async function revoke(invite) {
    await api.delete(`/workspaces/${workspaceId}/invites/${invite.id}`);
    setInvites((list) => list.filter((i) => i.id !== invite.id));
    toast.success('Invite revoked');
  }

  async function copy(link) {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Invite link copied');
    } catch {
      toast.error('Could not copy the link');
    }
  }

  if (invites.length === 0) return null;

  return (
    <section aria-label="Pending invites" className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">
        Pending invites <span className="font-normal text-muted">· {invites.length}</span>
      </h3>
      <Card className="overflow-hidden">
        <ul>
          {invites.map((invite) => (
            <li
              key={invite.id}
              className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0"
            >
              <Link2 aria-hidden className="size-4 text-muted" strokeWidth={1.5} />
              <span className="min-w-0 flex-1 truncate text-sm">
                {invite.email ?? 'Anyone with the link'}
              </span>
              <Badge>{ROLE_LABELS[invite.role]}</Badge>
              <span className="text-xs text-muted">expires {timeAgo(invite.expiresAt)}</span>
              <Tooltip
                content={
                  links[invite.id]
                    ? 'Copy invite link'
                    : 'The link is only shown when created. Revoke and create a new one.'
                }
              >
                <span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Copy invite link"
                    disabled={!links[invite.id]}
                    onClick={() => copy(links[invite.id])}
                  >
                    <Copy aria-hidden className="size-4" strokeWidth={1.5} />
                  </Button>
                </span>
              </Tooltip>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Revoke invite"
                onClick={() => revoke(invite).catch(() => undefined)}
              >
                <X aria-hidden className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

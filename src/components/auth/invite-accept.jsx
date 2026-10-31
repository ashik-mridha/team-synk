'use client';

import { MailX, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Logo } from '@/components/layout/logo';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { ROLE_LABELS } from '@/lib/constants';
import { useWorkspaceStore } from '@/store/workspace.store';

/** Public landing page for an invite link: preview, then sign in or join. */
export function InviteAccept() {
  const { token } = useParams();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [invite, setInvite] = useState(null);
  const [invalid, setInvalid] = useState(false);
  const [joining, setJoining] = useState(false);
  const next = encodeURIComponent(`/invite/${token}`);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/invites/${token}`, { silent: true })
      .then((res) => !cancelled && setInvite(res.data.data))
      .catch(() => !cancelled && setInvalid(true));
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function join() {
    setJoining(true);
    try {
      const res = await api.post(`/invites/${token}/accept`);
      toast.success(`Welcome to ${res.data.data.workspace.name}`);
      await useWorkspaceStore.getState().fetchWorkspaces();
      await useWorkspaceStore.getState().selectWorkspace(res.data.data.workspace.id);
      router.replace('/dashboard');
    } catch {
      setJoining(false);
    }
  }

  return (
    <div className="pt-safe pb-safe flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <Logo />
      {invalid ? (
        <EmptyState
          icon={MailX}
          title="This invite is no longer valid"
          description="The link was already used, revoked or has expired. Ask for a new one."
          className="w-full max-w-md"
          action={
            <Link href="/dashboard" className={buttonVariants({ variant: 'outline' })}>
              Go to dashboard
            </Link>
          }
        />
      ) : !invite || isPending ? (
        <Skeleton className="h-52 w-full max-w-md rounded-card" />
      ) : (
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-5 pt-8 text-center sm:pt-8">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary-text">
              <UsersRound aria-hidden className="size-6" strokeWidth={1.5} />
            </span>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl">Join {invite.workspaceName}</h1>
              <p className="text-sm text-muted">
                You have been invited as {ROLE_LABELS[invite.role].toLowerCase()}.
              </p>
            </div>
            {session ? (
              <Button size="lg" className="w-full" loading={joining} onClick={join}>
                Join workspace
              </Button>
            ) : (
              <div className="flex w-full flex-col gap-2">
                <Link href={`/register?next=${next}`} className={buttonVariants({ size: 'lg' })}>
                  Create an account to join
                </Link>
                <Link
                  href={`/login?next=${next}`}
                  className={buttonVariants({ variant: 'outline', size: 'lg' })}
                >
                  I already have an account
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

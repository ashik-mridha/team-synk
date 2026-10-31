'use client';

import {
  Check,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Settings,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useMounted } from '@/hooks/useMounted';
import { authClient } from '@/lib/auth-client';
import { loginUrl } from '@/lib/redirect';
import { useWorkspaceStore } from '@/store/workspace.store';

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function UserMenu() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  if (isPending) return <Skeleton className="size-7 rounded-full" />;

  if (!user) {
    return (
      <Link href={loginUrl('/dashboard')} className={buttonVariants({ size: 'sm' })}>
        Sign in
      </Link>
    );
  }

  async function handleLogout() {
    // The session is cleared locally even if the request fails.
    await authClient.signOut().catch(() => undefined);
    useWorkspaceStore.getState().reset();
    // Hard navigation so AuthGuard's own redirect cannot add a stale ?next=.
    window.location.replace('/login');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:size-8">
        <Avatar name={user.name} src={user.image ?? undefined} size="sm" online />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar name={user.name} src={user.image ?? undefined} size="md" />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-sm font-medium">
              <span className="truncate">{user.name}</span>
              {user.role === 'admin' && <Badge tone="primary">Admin</Badge>}
            </p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push('/dashboard/settings')}>
          <UserIcon aria-hidden /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push('/dashboard/settings')}>
          <Settings aria-hidden /> Settings
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="flex items-center gap-2.5">
              <Palette aria-hidden className="size-4 text-muted" /> Theme
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
            {themes.map(({ value, label, icon: Icon }) => (
              <DropdownMenuItem key={value} onSelect={() => setTheme(value)}>
                <Icon aria-hidden />
                <span className="flex-1">{label}</span>
                {mounted && theme === value && <Check aria-hidden className="text-primary-text" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
          <LogOut aria-hidden /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

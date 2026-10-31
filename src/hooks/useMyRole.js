import { authClient } from '@/lib/auth-client';
import { selectCurrentWorkspace, useWorkspaceStore } from '@/store/workspace.store';

/** The signed-in user's role in the current workspace (null when there is none). */
export function useMyRole() {
  const { data: session } = authClient.useSession();
  const workspace = useWorkspaceStore(selectCurrentWorkspace);
  return workspace?.members.find((m) => m.userId === session?.user.id)?.role ?? null;
}

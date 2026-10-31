'use client';

import { PasswordForm } from '@/components/dashboard/password-form';
import { ProfileForm } from '@/components/dashboard/profile-form';
import { authClient } from '@/lib/auth-client';

export function SettingsContent() {
  const { data: session } = authClient.useSession();
  if (!session) return null;

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      <ProfileForm user={session.user} />
      <PasswordForm />
    </div>
  );
}

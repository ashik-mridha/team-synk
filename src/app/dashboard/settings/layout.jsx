import { SettingsNav } from '@/components/dashboard/settings-nav';

export default function SettingsLayout({ children }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl">Settings</h1>
        <p className="text-muted">Manage your profile, security and workspace members.</p>
      </div>
      <SettingsNav />
      {children}
    </div>
  );
}

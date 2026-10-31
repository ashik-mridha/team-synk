'use client';

import { SidebarContent } from '@/components/layout/sidebar-content';
import { Drawer } from '@/components/ui/drawer';
import { useUiStore } from '@/store/ui.store';

export function MobileNav() {
  const open = useUiStore((s) => s.mobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNavOpen);

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      side="left"
      title="Navigation"
      hideHeader
      className="bg-sidebar sm:max-w-xs"
    >
      <div className="-mx-5 -mt-2">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </div>
    </Drawer>
  );
}

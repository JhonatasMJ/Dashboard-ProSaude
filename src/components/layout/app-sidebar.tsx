import logo from "@/assets/logo.svg";
import { SidebarNavItem } from "@/components/layout/sidebar-nav-item";
import { SidebarUserMenu } from "@/components/layout/sidebar-user-menu";
import { dashboardNavItems } from "@/config/navigation";
import { APP_VERSION } from "@/shared/constants/app-version";

export function AppSidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-white">
      <div className="flex justify-center border-b border-border px-4 py-4">
        <img
          src={logo}
          alt="ProSaúde"
          className="h-9 w-auto max-w-[150px] object-contain"
        />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-2">
        {dashboardNavItems.map((item) => (
          <SidebarNavItem key={item.href} item={item} />
        ))}
      </nav>
      <div className="border-t border-border px-2 py-2 flex justify-center">
      <p className="px-2 pt-2 text-center text-[11px] tabular-nums text-muted-foreground">
          v{APP_VERSION}
        </p>
        
      </div>

      <div className="border-t border-border px-2 py-2">
        <SidebarUserMenu />
      </div>
    </aside>
  );
}

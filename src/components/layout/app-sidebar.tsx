import { X } from "lucide-react";
import logo from "@/assets/logo.svg";
import { SidebarNavItem } from "@/components/layout/sidebar-nav-item";
import { SidebarUserMenu } from "@/components/layout/sidebar-user-menu";
import { Button } from "@/components/ui/button";
import { getDashboardNavItems } from "@/config/navigation";
import { useAuth } from "@/contexts/auth.context";
import { APP_VERSION } from "@/shared/constants/app-version";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const { user } = useAuth();
  const navItems = getDashboardNavItems(user?.role);

  return (
    <>
      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-svh w-[min(100vw-3rem,16rem)] flex-col border-r border-border bg-white shadow-lg transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-60 lg:shrink-0 lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative flex min-h-[3.75rem] items-center justify-center border-b border-border px-4 py-4">
          <img
            src={logo}
            alt="ProSaúde"
            className="h-9 w-auto max-w-[150px] object-contain"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 lg:hidden"
            aria-label="Fechar menu"
            onClick={onClose}
          >
            <X className="size-5" />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-2">
          {navItems.map((item) => (
            <SidebarNavItem key={item.href} item={item} onNavigate={onClose} />
          ))}
        </nav>

        <div className="flex justify-center border-t border-border px-2 py-2">
          <p className="px-2 pt-2 text-center text-[11px] tabular-nums text-muted-foreground">
            v{APP_VERSION}
          </p>
        </div>

        <div className="border-t border-border px-2 py-2">
          <SidebarUserMenu />
        </div>
      </aside>
    </>
  );
}

import { X } from "lucide-react";
import logo from "@/assets/logo.svg";
import { SidebarNavItem } from "@/components/layout/SidebarNavItem";
import { SidebarUserMenu } from "@/components/layout/SidebarUserMenu";
import { Button } from "@/components/ui/Button";
import { getDashboardNavSections } from "@/config/navigation";
import { useAuth } from "@/contexts/auth.context";
import { APP_VERSION } from "@/shared/constants/app-version";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const { user } = useAuth();
  const navSections = getDashboardNavSections(user?.role);

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

        <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 py-2">
          {navSections.map((section, sectionIndex) => (
            <div key={section.label ?? `section-${sectionIndex}`} className="space-y-1">
              {section.label ? (
                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {section.label}
                </p>
              ) : null}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    onNavigate={onClose}
                  />
                ))}
              </div>
            </div>
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

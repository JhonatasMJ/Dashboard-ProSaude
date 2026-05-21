import { NavLink } from "react-router-dom";
import { SidebarIconBox } from "@/components/layout/sidebar-icon-box";
import { useAnimatedIconHover } from "@/components/layout/sidebar-animated-icon";
import type { NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

const NAV_ICON_SIZE = 18;

interface SidebarNavItemProps {
  item: NavItem;
}

export function SidebarNavItem({ item }: SidebarNavItemProps) {
  const { iconRef, rowHandlers } = useAnimatedIconHover();

  return (
    <NavLink
      to={item.href}
      end={item.end}
      {...rowHandlers}
      className={({ isActive }) =>
        cn(
                "group/nav flex items-center gap-2 rounded-md px-1.5 py-1.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-foreground hover:bg-primary/5"
        )
      }
    >
      {({ isActive }) => (
        <>
          <SidebarIconBox active={isActive}>
            <item.icon ref={iconRef} size={NAV_ICON_SIZE} />
          </SidebarIconBox>
          {item.title}
        </>
      )}
    </NavLink>
  );
}

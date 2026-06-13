import type { ReactNode } from "react";
import { SidebarIconBox } from "@/components/layout/SidebarIconBox";
import { useAnimatedIconHover } from "@/components/layout/SidebarAnimatedIcon";
import type { AnimatedIcon } from "@/config/navigation";
import { DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/utils";

interface SidebarMenuItemProps {
  icon: AnimatedIcon;
  children: ReactNode;
  variant?: "default" | "destructive";
  onClick?: () => void;
}

export function SidebarMenuItem({
  icon: Icon,
  children,
  variant = "default",
  onClick,
}: SidebarMenuItemProps) {
  const { iconRef, rowHandlers } = useAnimatedIconHover();
  const isDestructive = variant === "destructive";

  return (
    <DropdownMenuItem
      variant={variant}
      onClick={onClick}
      {...rowHandlers}
      className={cn(
        "group/item gap-2 rounded-md px-2 py-1.5",
        isDestructive
          ? undefined
          : "focus:bg-primary/10 focus:text-primary"
      )}
    >
      <SidebarIconBox
        highlightOnHover
        className={
          isDestructive
            ? "group-hover/item:bg-destructive/10 group-hover/item:text-destructive group-focus/item:bg-destructive/10 group-focus/item:text-destructive"
            : undefined
        }
      >
        <Icon ref={iconRef} size={16} />
      </SidebarIconBox>
      {children}
    </DropdownMenuItem>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SidebarIconBoxProps {
  active?: boolean;
  highlightOnHover?: boolean;
  children: ReactNode;
  className?: string;
}

export function SidebarIconBox({
  active = false,
  highlightOnHover = false,
  children,
  className,
}: SidebarIconBoxProps) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md transition-colors",
        active
          ? "text-primary"
          : "text-muted-foreground group-hover/nav:text-primary/80",
        highlightOnHover &&
          "group-hover/item:bg-primary/15 group-hover/item:text-primary group-focus/item:bg-primary/15 group-focus/item:text-primary",
        className
      )}
    >
      {children}
    </span>
  );
}

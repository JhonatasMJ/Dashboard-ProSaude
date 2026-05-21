import type { ComponentType, HTMLAttributes, RefAttributes } from "react";
import type { AnimatedIconHandle } from "@/components/layout/sidebar-animated-icon";
import { FileTextIcon } from "@/components/ui/file-text";
import { HomeIcon } from "@/components/ui/home";
import { StethoscopeIcon } from "@/components/ui/stethoscope";

export type AnimatedIcon = ComponentType<
  { size?: number; className?: string } & HTMLAttributes<HTMLDivElement> &
    RefAttributes<AnimatedIconHandle>
>;

export interface NavItem {
  title: string;
  href: string;
  icon: AnimatedIcon;
  end?: boolean;
}

export const dashboardNavItems: NavItem[] = [
  {
    title: "Início",
    href: "/dashboard",
    icon: HomeIcon,
    end: true,
  },
  {
    title: "Empresas",
    href: "/dashboard/empresas",
    icon: FileTextIcon,
  },
  {
    title: "Exames",
    href: "/dashboard/exames",
    icon: StethoscopeIcon,
  },
];

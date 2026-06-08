import type { ComponentType, HTMLAttributes, RefAttributes } from "react";
import type { AnimatedIconHandle } from "@/components/layout/sidebar-animated-icon";
import type { UserRole } from "@/shared/interfaces/https/authenticate-response";
import { canManageUsers } from "@/shared/helpers/user-permissions.helper";
import { FileTextIcon } from "@/components/ui/file-text";
import { HomeIcon } from "@/components/ui/home";
import { LayoutGridIcon } from "@/components/ui/layout-grid";
import { SettingsIcon } from "@/components/ui/settings";
import { StethoscopeIcon } from "@/components/ui/stethoscope";
import { UsersIcon } from "@/components/ui/users";
import { WalletIcon } from "@/components/ui/wallet";

export type AnimatedIcon = ComponentType<
  { size?: number; className?: string } & HTMLAttributes<HTMLDivElement> &
    RefAttributes<AnimatedIconHandle>
>;

export interface NavItem {
  title: string;
  href: string;
  icon: AnimatedIcon;
  end?: boolean;
  /** Visível apenas para administradores */
  adminOnly?: boolean;
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
    title: "Contas",
    href: "/dashboard/contas",
    icon: WalletIcon,
  },
  {
    title: "Exames",
    href: "/dashboard/exames",
    icon: StethoscopeIcon,
  },
  {
    title: "Funcionários",
    href: "/dashboard/funcionarios",
    icon: UsersIcon,
  },
  {
    title: "Vínculos",
    href: "/dashboard/vinculos",
    icon: LayoutGridIcon,
  },
  {
    title: "Usuários",
    href: "/dashboard/usuarios",
    icon: SettingsIcon,
    adminOnly: true,
  },
];

export function getDashboardNavItems(
  role: UserRole | null | undefined
): NavItem[] {
  return dashboardNavItems.filter(
    (item) => !item.adminOnly || canManageUsers(role)
  );
}

import type { ComponentType, HTMLAttributes, RefAttributes } from "react";
import type { AnimatedIconHandle } from "@/components/layout/sidebar-animated-icon";
import type { UserRole } from "@/shared/interfaces/https/authenticate-response";
import { canManageUsers } from "@/shared/helpers/user-permissions.helper";
import { ClipboardCheckIcon } from "@/components/ui/clipboard-check";
import { FileTextIcon } from "@/components/ui/file-text";
import { HomeIcon } from "@/components/ui/home";
import { LayoutGridIcon } from "@/components/ui/layout-grid";
import { SettingsIcon } from "@/components/ui/settings";
import { StethoscopeIcon } from "@/components/ui/stethoscope";
import { TriangleAlertIcon } from "@/components/ui/triangle-alert";
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
    href: "/dashboard/companies",
    icon: FileTextIcon,
  },
  {
    title: "Contas",
    href: "/dashboard/accounts",
    icon: WalletIcon,
  },
  {
    title: "Exames",
    href: "/dashboard/exams",
    icon: StethoscopeIcon,
  },
  {
    title: "Riscos Ocupacionais",
    href: "/dashboard/occupational-risks",
    icon: TriangleAlertIcon,
  },
  {
    title: "Funcionários",
    href: "/dashboard/employees",
    icon: UsersIcon,
  },
  {
    title: "Vínculos",
    href: "/dashboard/employee-exams",
    icon: LayoutGridIcon,
  },
  {
    title: "Emissão de ASO",
    href: "/dashboard/asos",
    icon: ClipboardCheckIcon,
  },
  {
    title: "Usuários",
    href: "/dashboard/users",
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

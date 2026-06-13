import type { ComponentType, HTMLAttributes, RefAttributes } from "react";
import type { AnimatedIconHandle } from "@/components/layout/SidebarAnimatedIcon";
import type { UserRole } from "@/shared/interfaces/https/authenticate-response";
import { canManageUsers } from "@/shared/helpers/user.helper";
import { ClipboardCheckIcon } from "@/components/ui/ClipboardCheck";
import { FileTextIcon } from "@/components/ui/FileText";
import { HomeIcon } from "@/components/ui/Home";
import { LayoutGridIcon } from "@/components/ui/LayoutGrid";
import { SettingsIcon } from "@/components/ui/Settings";
import { StethoscopeIcon } from "@/components/ui/Stethoscope";
import { TriangleAlertIcon } from "@/components/ui/TriangleAlert";
import { UsersIcon } from "@/components/ui/Users";
import { WalletIcon } from "@/components/ui/Wallet";

export type AnimatedIcon = ComponentType<
  { size?: number; className?: string } & HTMLAttributes<HTMLDivElement> &
    RefAttributes<AnimatedIconHandle>
>;

export interface NavItem {
  title: string;
  href: string;
  icon: AnimatedIcon;
  end?: boolean;
  adminOnly?: boolean;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export const dashboardNavSections: NavSection[] = [
  {
    items: [
      {
        title: "Início",
        href: "/dashboard",
        icon: HomeIcon,
        end: true,
      },
    ],
  },
  {
    label: "Cadastros",
    items: [
      {
        title: "Empresas",
        href: "/dashboard/companies",
        icon: FileTextIcon,
      },
      {
        title: "Funcionários",
        href: "/dashboard/employees",
        icon: UsersIcon,
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
    ],
  },
  {
    label: "Operacional",
    items: [
      {
        title: "Contas",
        href: "/dashboard/accounts",
        icon: WalletIcon,
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
    ],
  },
  {
    label: "Administração",
    items: [
      {
        title: "Usuários",
        href: "/dashboard/users",
        icon: SettingsIcon,
        adminOnly: true,
      },
    ],
  },
];

export function getDashboardNavSections(
  role: UserRole | null | undefined
): NavSection[] {
  return dashboardNavSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.adminOnly || canManageUsers(role)
      ),
    }))
    .filter((section) => section.items.length > 0);
}

/** @deprecated Use getDashboardNavSections */
export function getDashboardNavItems(
  role: UserRole | null | undefined
): NavItem[] {
  return getDashboardNavSections(role).flatMap((section) => section.items);
}

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "@/components/confirm-modal";
import { SidebarMenuItem } from "@/components/layout/sidebar-menu-item";
import { LayoutGridIcon } from "@/components/ui/layout-grid";
import { LogoutIcon } from "@/components/ui/logout";
import { MessageCircleIcon } from "@/components/ui/message-circle";
import { SettingsIcon } from "@/components/ui/settings";
import { UsersIcon } from "@/components/ui/users";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth.context";
import { getUserInitials } from "@/shared/helpers/user-initials.helper";
import { cn } from "@/lib/utils";

export function SidebarUserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLogoutModalOpen(false);
    navigate("/", { replace: true });
  };

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "group/nav flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left outline-none",
            "transition-colors hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/30"
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
            {getUserInitials(user.name)}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
            {user.name}
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="top"
          align="start"
          sideOffset={6}
          className="w-52 p-1"
        >
          <SidebarMenuItem icon={SettingsIcon}>Configurações</SidebarMenuItem>
          <SidebarMenuItem icon={LayoutGridIcon}>Plano</SidebarMenuItem>
          <SidebarMenuItem icon={MessageCircleIcon}>
            Feedback e Bugs
          </SidebarMenuItem>
          <SidebarMenuItem icon={UsersIcon}>Comunidade</SidebarMenuItem>
          <DropdownMenuSeparator className="my-1" />
          <SidebarMenuItem
            icon={LogoutIcon}
            variant="destructive"
            onClick={() => setLogoutModalOpen(true)}
          >
            Sair
          </SidebarMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmModal
        open={logoutModalOpen}
        onOpenChange={setLogoutModalOpen}
        title="Sair da conta"
        description={
          <>
            Tem certeza que deseja encerrar sua sessão
            {user.name ? (
              <>
                {" "}
                como <strong>{user.name}</strong>
              </>
            ) : null}
            ? Será necessário fazer login novamente para acessar o painel.
          </>
        }
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        confirmVariant="destructive"
        onConfirm={handleLogout}
      />
    </>
  );
}

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "@/components/ConfirmModal";
import { SidebarMenuItem } from "@/components/layout/SidebarMenuItem";
import { LogoutIcon } from "@/components/ui/Logout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
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
            "group/nav flex w-full cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 text-left outline-none",
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

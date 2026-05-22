import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ButtonAnimatedIcon } from "@/components/button-animated-icon";
import { DeleteModal } from "@/components/delete-modal";
import { UserFormSheet } from "@/components/users/user-form-sheet";
import { Button } from "@/components/ui/button";
import { DeleteIcon } from "@/components/ui/delete";
import { PlusIcon } from "@/components/ui/plus";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useButtonAnimatedIcon } from "@/hooks/use-button-animated-icon";
import { useAuth } from "@/contexts/auth.context";
import { useUsers } from "@/contexts/users-context";
import { cn } from "@/lib/utils";
import { TABLE_PAGE_SIZE } from "@/shared/constants/app.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formatDateBr } from "@/shared/helpers/date.helper";
import { formatUserRole } from "@/shared/helpers/user-role.helper";
import type { IUser } from "@/shared/interfaces/https/user";

function UsersTableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: TABLE_PAGE_SIZE }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 px-5 py-4"
        >
          <div className="h-4 w-40 flex-1 rounded-md bg-muted" />
          <div className="hidden h-4 w-48 rounded-md bg-muted md:block" />
          <div className="hidden h-4 w-24 rounded-md bg-muted lg:block" />
          <div className="h-8 w-10 rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}

function UserRow({
  user,
  rowIndex,
  isCurrentUser,
  onDelete,
}: {
  user: IUser;
  rowIndex: number;
  isCurrentUser: boolean;
  onDelete: (user: IUser) => void;
}) {
  const deleteIcon = useButtonAnimatedIcon();
  const isEven = rowIndex % 2 === 0;

  return (
    <TableRow
      className={cn(
        "border-border/60 transition-colors",
        isEven
          ? "bg-background hover:bg-muted/40"
          : "bg-muted/30 hover:bg-muted/50"
      )}
    >
      <TableCell className="px-5 py-4">
        <p className="truncate font-medium text-foreground">{user.name}</p>
      </TableCell>
      <TableCell className="hidden px-5 py-4 text-sm text-muted-foreground md:table-cell">
        {user.email}
      </TableCell>
      <TableCell className="hidden px-5 py-4 text-sm text-foreground lg:table-cell">
        {formatUserRole(user.role)}
      </TableCell>
      <TableCell className="hidden px-5 py-4 text-sm text-muted-foreground xl:table-cell">
        {formatDateBr(user.createdAt)}
      </TableCell>
      <TableCell className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          {!isCurrentUser ? (
            <Button
              variant="ghost"
              size="icon-lg"
              className="rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
              aria-label={`Excluir ${user.name}`}
              onClick={() => onDelete(user)}
              {...deleteIcon.rowHandlers}
            >
              <ButtonAnimatedIcon
                icon={DeleteIcon}
                iconRef={deleteIcon.iconRef}
                size={16}
                className="text-destructive"
              />
            </Button>
          ) : (
            <span
              className="text-xs text-muted-foreground"
              title="Você não pode excluir sua própria conta"
            >
              —
            </span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function UsersTable() {
  const { user: currentUser } = useAuth();
  const {
    users,
    meta,
    isLoading,
    error,
    refetch,
    deleteUser,
    isSubmitting,
    nameFilter,
    setNameFilter,
    setPage,
  } = useUsers();
  const [formOpen, setFormOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<IUser | null>(null);
  const plusIconHeader = useButtonAnimatedIcon();
  const plusIconEmpty = useButtonAnimatedIcon();

  const totalCount = meta?.total ?? 0;
  const hasActiveFilter = nameFilter.trim().length > 0;
  const isEmptyList = !isLoading && !error && users.length === 0;

  const openCreate = () => {
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingUser) return;

    try {
      await deleteUser(deletingUser.id);
      toast.success("Usuário excluído com sucesso.");
      setDeletingUser(null);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Não foi possível excluir o usuário.")
      );
    }
  };

  return (
    <>
      <Card className="gap-0 overflow-hidden rounded-sm border border-border bg-white py-0 shadow-sm ring-0">
        <div className="flex flex-col gap-4 border-b border-border bg-muted/20 px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Usuários</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Gerencie quem pode acessar o dashboard.
                {!isLoading && !error && meta && (
                  <>
                    {" "}
                    <span className="font-medium text-foreground/70">
                      · {totalCount}{" "}
                      {totalCount === 1 ? "usuário" : "usuários"}
                    </span>
                  </>
                )}
              </p>
            </div>
            <Button
              className="shrink-0 rounded-md py-4.5"
              size="lg"
              onClick={openCreate}
              {...plusIconHeader.rowHandlers}
            >
              <ButtonAnimatedIcon
                icon={PlusIcon}
                iconRef={plusIconHeader.iconRef}
                size={16}
              />
              Novo usuário
            </Button>
          </div>

          <div className="relative max-w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="h-10 rounded-md pl-10"
              aria-label="Buscar usuário por nome"
            />
          </div>
        </div>

        {isLoading && <UsersTableSkeleton />}

        {!isLoading && error && (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-md"
              onClick={() => refetch()}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {isEmptyList && !hasActiveFilter && (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                Nenhum usuário cadastrado
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Cadastre o primeiro usuário com acesso ao painel.
              </p>
            </div>
            <Button
              className="mt-1 rounded-md py-4.5"
              onClick={openCreate}
              {...plusIconEmpty.rowHandlers}
            >
              <ButtonAnimatedIcon
                icon={PlusIcon}
                iconRef={plusIconEmpty.iconRef}
                size={16}
              />
              Novo usuário
            </Button>
          </div>
        )}

        {isEmptyList && hasActiveFilter && (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <p className="font-medium text-foreground">
              Nenhum usuário encontrado
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Não há resultados para &quot;{nameFilter.trim()}&quot;. Tente outro
              nome.
            </p>
          </div>
        )}

        {!isLoading && !error && users.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-border/80 bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Nome
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase md:table-cell">
                    E-mail
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell">
                    Perfil
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase xl:table-cell">
                    Cadastro
                  </TableHead>
                  <TableHead className="h-11 px-5 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <UserRow
                    key={user.id}
                    rowIndex={index}
                    user={user}
                    isCurrentUser={currentUser?.id === user.id}
                    onDelete={setDeletingUser}
                  />
                ))}
              </TableBody>
            </Table>

            {meta && (
              <Pagination
                meta={meta}
                disabled={isLoading || isSubmitting}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>

      <UserFormSheet open={formOpen} onOpenChange={setFormOpen} />

      <DeleteModal
        open={!!deletingUser}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null);
        }}
        title="Excluir usuário"
        description={
          <>
            Tem certeza que deseja excluir{" "}
            <strong>{deletingUser?.name}</strong>? O acesso ao painel será
            revogado e esta ação não pode ser desfeita.
          </>
        }
        isLoading={isSubmitting}
        onConfirm={handleDelete}
      />
    </>
  );
}

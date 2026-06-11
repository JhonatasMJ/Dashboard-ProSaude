import { useState } from "react";
import { toast } from "sonner";
import { ButtonAnimatedIcon } from "@/components/button-animated-icon";
import {
  DataTable,
  DataTableSearchFilter,
  DATA_TABLE_CELL_CLASS,
  DATA_TABLE_HEAD_CLASS,
  DATA_TABLE_HEADER_ROW_CLASS,
  getDataTableRowClassName,
} from "@/components/data-table";
import { DeleteModal } from "@/components/delete-modal";
import { UserFormSheet } from "@/components/users/user-form-sheet";
import { Button } from "@/components/ui/button";
import { DeleteIcon } from "@/components/ui/delete";
import { PlusIcon } from "@/components/ui/plus";
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
import { useUsers } from "@/contexts/users.context";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formatDateBr } from "@/shared/helpers/date.helper";
import { formatUserRole } from "@/shared/helpers/user-role.helper";
import type { IUser } from "@/shared/interfaces/https/user";

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

  return (
    <TableRow className={getDataTableRowClassName(rowIndex)}>
      <TableCell className={DATA_TABLE_CELL_CLASS}>
        <p className="truncate font-medium text-foreground">{user.name}</p>
      </TableCell>
      <TableCell className="hidden text-sm text-muted-foreground md:table-cell px-5 py-4">
        {user.email}
      </TableCell>
      <TableCell className="hidden text-sm text-foreground lg:table-cell px-5 py-4">
        {formatUserRole(user.role)}
      </TableCell>
      <TableCell className="hidden text-sm text-muted-foreground xl:table-cell px-5 py-4">
        {formatDateBr(user.createdAt)}
      </TableCell>
      <TableCell className={DATA_TABLE_CELL_CLASS}>
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
    <DataTable
      title="Usuários"
      description={
        <>
          Gerencie quem pode acessar o dashboard.
          {!isLoading && !error && meta ? (
            <>
              {" "}
              <span className="font-medium text-foreground/70">
                · {totalCount} {totalCount === 1 ? "usuário" : "usuários"}
              </span>
            </>
          ) : null}
        </>
      }
      headerActions={
        <Button
          className="shrink-0 rounded-md py-4.5"
          size="lg"
          onClick={() => setFormOpen(true)}
          {...plusIconHeader.rowHandlers}
        >
          <ButtonAnimatedIcon icon={PlusIcon} iconRef={plusIconHeader.iconRef} size={16} />
          Novo usuário
        </Button>
      }
      filters={
        <DataTableSearchFilter
          value={nameFilter}
          onChange={setNameFilter}
          ariaLabel="Buscar usuário por nome"
        />
      }
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      isEmpty={isEmptyList}
      hasActiveFilters={hasActiveFilter}
      emptyState={{
        title: "Nenhum usuário cadastrado",
        description: "Cadastre o primeiro usuário com acesso ao painel.",
        action: (
          <Button
            className="mt-1 rounded-md py-4.5"
            onClick={() => setFormOpen(true)}
            {...plusIconEmpty.rowHandlers}
          >
            <ButtonAnimatedIcon icon={PlusIcon} iconRef={plusIconEmpty.iconRef} size={16} />
            Novo usuário
          </Button>
        ),
      }}
      filteredEmptyState={{
        title: "Nenhum usuário encontrado",
        description: (
          <>
            Não há resultados para &quot;{nameFilter.trim()}&quot;. Tente outro nome.
          </>
        ),
      }}
      skeletonColumns={3}
      overlays={
        <>
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
      }
    >
      <>
        <Table>
          <TableHeader>
            <TableRow className={DATA_TABLE_HEADER_ROW_CLASS}>
              <TableHead className={DATA_TABLE_HEAD_CLASS}>Nome</TableHead>
              <TableHead className={`hidden md:table-cell ${DATA_TABLE_HEAD_CLASS}`}>
                E-mail
              </TableHead>
              <TableHead className={`hidden lg:table-cell ${DATA_TABLE_HEAD_CLASS}`}>
                Perfil
              </TableHead>
              <TableHead className={`hidden xl:table-cell ${DATA_TABLE_HEAD_CLASS}`}>
                Cadastro
              </TableHead>
              <TableHead className={`text-right ${DATA_TABLE_HEAD_CLASS}`}>
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

        {meta ? (
          <Pagination
            meta={meta}
            disabled={isLoading || isSubmitting}
            onPageChange={setPage}
          />
        ) : null}
      </>
    </DataTable>
  );
}

import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AccountStatusBadge } from "@/components/accounts/account-status-badge";
import { AccountStatusFilterSelect } from "@/components/accounts/account-status-filter-select";
import { AccountFormSheet } from "@/components/accounts/account-form-sheet";
import { ButtonAnimatedIcon } from "@/components/button-animated-icon";
import { DatePickerLabel } from "@/components/date-picker-label";
import {
  DataTable,
  DataTableRowActions,
  DATA_TABLE_CELL_CLASS,
  DATA_TABLE_HEAD_CLASS,
  DATA_TABLE_HEADER_ROW_CLASS,
  getDataTableRowClassName,
} from "@/components/data-table";
import { DeleteModal } from "@/components/delete-modal";
import { Button } from "@/components/ui/button";
import { FileTextIcon } from "@/components/ui/file-text";
import { PlusIcon } from "@/components/ui/plus";
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
import { useCrudSheetState } from "@/hooks/use-crud-sheet-state";
import { useAccounts } from "@/contexts/accounts.context";
import { cn } from "@/lib/utils";
import {
  FILTER_FIELD_LABEL_CLASS,
  FILTER_FIELD_WRAPPER_CLASS,
  FILTER_GRID_CLASS,
  FILTER_GRID_ITEM_CLASS,
  FILTER_INPUT_CLASS,
} from "@/shared/constants/filter-field.constants";
import {
  buildAccountsFilterSummary,
  fetchAccountsForReport,
  generateAccountsReportPdf,
} from "@/pdf";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formatDateBr } from "@/shared/helpers/date.helper";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";
import type { IAccount } from "@/shared/interfaces/https/account";

function AccountRow({
  account,
  rowIndex,
  onEdit,
  onDelete,
}: {
  account: IAccount;
  rowIndex: number;
  onEdit: (account: IAccount) => void;
  onDelete: (account: IAccount) => void;
}) {
  return (
    <TableRow className={getDataTableRowClassName(rowIndex)}>
      <TableCell className={DATA_TABLE_CELL_CLASS}>
        <AccountStatusBadge status={account.status} />
      </TableCell>
      <TableCell className={DATA_TABLE_CELL_CLASS}>
        <p className="truncate font-medium text-foreground">{account.name}</p>
      </TableCell>
      <TableCell className={cn(DATA_TABLE_CELL_CLASS, "text-sm font-medium text-foreground")}>
        {formatCurrency(account.amount)}
      </TableCell>
      <TableCell className={cn(DATA_TABLE_CELL_CLASS, "hidden whitespace-nowrap text-sm text-muted-foreground md:table-cell")}>
        {formatDateBr(account.dueDate)}
      </TableCell>
      <TableCell className={cn(DATA_TABLE_CELL_CLASS, "hidden whitespace-nowrap text-sm text-muted-foreground lg:table-cell")}>
        {account.paidAt ? formatDateBr(account.paidAt) : "—"}
      </TableCell>
      <TableCell className={cn(DATA_TABLE_CELL_CLASS, "w-[88px]")}>
        <DataTableRowActions
          size="compact"
          editLabel={`Editar ${account.name}`}
          deleteLabel={`Excluir ${account.name}`}
          onEdit={() => onEdit(account)}
          onDelete={() => onDelete(account)}
        />
      </TableCell>
    </TableRow>
  );
}

export function AccountsTable() {
  const {
    accounts,
    meta,
    isLoading,
    isSubmitting,
    error,
    refetch,
    deleteAccount,
    nameFilter,
    setNameFilter,
    statusFilter,
    setStatusFilter,
    dueDateFromFilter,
    setDueDateFromFilter,
    dueDateToFilter,
    setDueDateToFilter,
    paidAtFromFilter,
    setPaidAtFromFilter,
    paidAtToFilter,
    setPaidAtToFilter,
    exportListParams,
    setPage,
  } = useAccounts();
  const {
    formOpen,
    editingItem: editingAccount,
    deletingItem: deletingAccount,
    setDeletingItem: setDeletingAccount,
    openCreate,
    openEdit,
    handleFormOpenChange,
  } = useCrudSheetState<IAccount>();
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const plusIconHeader = useButtonAnimatedIcon();
  const plusIconEmpty = useButtonAnimatedIcon();
  const pdfIcon = useButtonAnimatedIcon();

  const totalCount = meta?.total ?? 0;
  const hasActiveFilters =
    nameFilter.trim().length > 0 ||
    statusFilter.length > 0 ||
    dueDateFromFilter.length > 0 ||
    dueDateToFilter.length > 0 ||
    paidAtFromFilter.length > 0 ||
    paidAtToFilter.length > 0;
  const isEmptyList = !isLoading && !error && accounts.length === 0;

  const handleExportPdf = async () => {
    setIsExportingPdf(true);

    try {
      const reportAccounts = await fetchAccountsForReport(exportListParams);

      if (reportAccounts.length === 0) {
        toast.error("Nenhuma conta encontrada para os filtros selecionados.");
        return;
      }

      const filterSummary = buildAccountsFilterSummary(exportListParams);
      await generateAccountsReportPdf(reportAccounts, { filterSummary });
      toast.success("Relatório PDF gerado com sucesso.");
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Não foi possível gerar o relatório PDF.")
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;

    try {
      await deleteAccount(deletingAccount.id);
      toast.success("Conta excluída com sucesso.");
      setDeletingAccount(null);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Não foi possível excluir a conta.")
      );
    }
  };

  return (
    <DataTable
      title="Contas"
      description={
        <>
          Gerencie contas a pagar e receber com filtros por status e datas.
          {!isLoading && !error && meta ? (
            <>
              {" "}
              <span className="font-medium text-foreground/70">
                · {totalCount} {totalCount === 1 ? "conta" : "contas"}
              </span>
            </>
          ) : null}
        </>
      }
      headerActions={
        <>
          <Button
            className="rounded-md bg-secondary py-4.5 text-secondary-foreground hover:bg-secondary/90"
            size="lg"
            onClick={handleExportPdf}
            disabled={isLoading || isExportingPdf}
            {...pdfIcon.rowHandlers}
          >
            <ButtonAnimatedIcon
              icon={FileTextIcon}
              iconRef={pdfIcon.iconRef}
              size={16}
              className="text-secondary-foreground"
            />
            {isExportingPdf ? "Gerando PDF..." : "Gerar PDF"}
          </Button>
          <Button
            className="rounded-md py-4.5"
            size="lg"
            onClick={openCreate}
            {...plusIconHeader.rowHandlers}
          >
            <ButtonAnimatedIcon icon={PlusIcon} iconRef={plusIconHeader.iconRef} size={16} />
            Nova conta
          </Button>
        </>
      }
      filters={
        <div className={FILTER_GRID_CLASS}>
          <div className={cn(FILTER_GRID_ITEM_CLASS, FILTER_FIELD_WRAPPER_CLASS)}>
            <label htmlFor="account-name-filter" className={FILTER_FIELD_LABEL_CLASS}>
              Nome
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="account-name-filter"
                type="search"
                placeholder="Buscar por nome..."
                value={nameFilter}
                onChange={(event) => setNameFilter(event.target.value)}
                className={FILTER_INPUT_CLASS}
              />
            </div>
          </div>
          <AccountStatusFilterSelect
            className={FILTER_GRID_ITEM_CLASS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <DatePickerLabel
            className={FILTER_GRID_ITEM_CLASS}
            id="account-due-date-from"
            label="Vencimento (de)"
            value={dueDateFromFilter}
            onChange={setDueDateFromFilter}
            placeholder="Data inicial"
            compact
          />
          <DatePickerLabel
            className={FILTER_GRID_ITEM_CLASS}
            id="account-due-date-to"
            label="Vencimento (até)"
            value={dueDateToFilter}
            onChange={setDueDateToFilter}
            placeholder="Data final"
            compact
          />
          <DatePickerLabel
            className={FILTER_GRID_ITEM_CLASS}
            id="account-paid-at-from"
            label="Pagamento (de)"
            value={paidAtFromFilter}
            onChange={setPaidAtFromFilter}
            placeholder="Data inicial"
            compact
          />
          <DatePickerLabel
            className={FILTER_GRID_ITEM_CLASS}
            id="account-paid-at-to"
            label="Pagamento (até)"
            value={paidAtToFilter}
            onChange={setPaidAtToFilter}
            placeholder="Data final"
            compact
          />
        </div>
      }
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      isEmpty={isEmptyList}
      hasActiveFilters={hasActiveFilters}
      emptyState={{
        title: "Nenhuma conta cadastrada",
        description: "Comece registrando a primeira conta do sistema.",
        action: (
          <Button className="mt-1 rounded-md py-4.5" onClick={openCreate} {...plusIconEmpty.rowHandlers}>
            <ButtonAnimatedIcon icon={PlusIcon} iconRef={plusIconEmpty.iconRef} size={16} />
            Nova conta
          </Button>
        ),
      }}
      filteredEmptyState={{
        title: "Nenhuma conta encontrada",
        description: "Ajuste os filtros e tente novamente.",
      }}
      skeletonColumns={4}
      overlays={
        <>
          <AccountFormSheet
            open={formOpen}
            onOpenChange={handleFormOpenChange}
            account={editingAccount}
          />
          <DeleteModal
            open={!!deletingAccount}
            onOpenChange={(open) => {
              if (!open) setDeletingAccount(null);
            }}
            title="Excluir conta"
            description={
              <>
                Tem certeza que deseja excluir a conta{" "}
                <strong>{deletingAccount?.name}</strong>? Esta ação não pode ser
                desfeita.
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
              <TableHead className={DATA_TABLE_HEAD_CLASS}>Status</TableHead>
              <TableHead className={DATA_TABLE_HEAD_CLASS}>Nome</TableHead>
              <TableHead className={DATA_TABLE_HEAD_CLASS}>Valor</TableHead>
              <TableHead className={`hidden md:table-cell ${DATA_TABLE_HEAD_CLASS}`}>
                Vencimento
              </TableHead>
              <TableHead className={`hidden lg:table-cell ${DATA_TABLE_HEAD_CLASS}`}>
                Pagamento
              </TableHead>
              <TableHead className={`text-right ${DATA_TABLE_HEAD_CLASS}`}>
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account, index) => (
              <AccountRow
                key={account.id}
                rowIndex={index}
                account={account}
                onEdit={openEdit}
                onDelete={setDeletingAccount}
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

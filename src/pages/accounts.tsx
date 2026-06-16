import { Search } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AccountForm } from "@/components/Forms/AccountForm";
import { ButtonAnimatedIcon } from "@/components/ButtonAnimatedIcon";
import { DatePickerLabel } from "@/components/DatePickerLabel";
import {
  DataTable,
  DataTableRowActions,
  DATA_TABLE_CELL_CLASS,
  DATA_TABLE_HEAD_CLASS,
  DATA_TABLE_HEADER_ROW_CLASS,
  getDataTableRowClassName,
} from "@/components/data-table";
import { DeleteModal } from "@/components/DeleteModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { FormSheet } from "@/components/FormSheet";
import { Button } from "@/components/ui/Button";
import { FileTextIcon } from "@/components/ui/FileText";
import { PlusIcon } from "@/components/ui/Plus";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Pagination } from "@/components/ui/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { useAccounts } from "@/contexts/accounts.context";
import { useButtonAnimatedIcon } from "@/hooks/use-button-animated-icon";
import { useCrudSheetState } from "@/hooks/use-crud-sheet-state";
import { cn } from "@/lib/utils";
import type { AccountFormData } from "@/schemas/account.schema";
import {
  FILTER_FIELD_LABEL_CLASS,
  FILTER_FIELD_WRAPPER_CLASS,
  FILTER_GRID_CLASS,
  FILTER_GRID_ITEM_CLASS,
  FILTER_INPUT_CLASS,
  FILTER_SELECT_TRIGGER_CLASS,
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
import {
  ACCOUNT_STATUS_LABELS,
  type AccountStatus,
} from "@/shared/types/account-status.types";

const ACCOUNT_FORM_ID = "account-form";
const ALL_ACCOUNT_STATUS_FILTER_VALUE = "all";

const STATUS_STYLES: Record<AccountStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  OVERDUE: "bg-red-100 text-red-800",
};

function AccountStatusBadge({ status }: { status: AccountStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
        STATUS_STYLES[status]
      )}
    >
      {ACCOUNT_STATUS_LABELS[status]}
    </span>
  );
}

function AccountStatusFilterSelect({
  value,
  onChange,
  disabled = false,
  className,
  id = "account-status-filter",
}: {
  value: AccountStatus | "";
  onChange: (value: AccountStatus | "") => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}) {
  const items = useMemo(
    () => [
      { value: ALL_ACCOUNT_STATUS_FILTER_VALUE, label: "Todos os status" },
      ...(
        Object.entries(ACCOUNT_STATUS_LABELS) as [AccountStatus, string][]
      ).map(([status, label]) => ({
        value: status,
        label,
      })),
    ],
    []
  );

  const selectValue = value || ALL_ACCOUNT_STATUS_FILTER_VALUE;

  return (
    <div className={cn(FILTER_FIELD_WRAPPER_CLASS, className)}>
      <Label htmlFor={id} className={FILTER_FIELD_LABEL_CLASS}>
        Status
      </Label>
      <Select
        value={selectValue}
        onValueChange={(next) =>
          onChange(
            next === ALL_ACCOUNT_STATUS_FILTER_VALUE || !next
              ? ""
              : (next as AccountStatus)
          )
        }
        items={items}
        disabled={disabled}
      >
        <SelectTrigger id={id} className={FILTER_SELECT_TRIGGER_CLASS}>
          <SelectValue placeholder="Todos os status" className="truncate" />
        </SelectTrigger>
        <SelectContent align="start">
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              <span className="block truncate">{item.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function AccountRow({
  account,
  rowIndex,
  onEdit,
  onDelete,
  isSelected,
  onToggleSelect,
}: {
  account: IAccount;
  rowIndex: number;
  onEdit: (account: IAccount) => void;
  onDelete: (account: IAccount) => void;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  return (
    <TableRow className={getDataTableRowClassName(rowIndex)}>
      <TableCell className={DATA_TABLE_CELL_CLASS}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect()}
          aria-label={`Selecionar conta ${account.name}`}
        />
      </TableCell>
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

function AccountFormSheet({
  open,
  onOpenChange,
  account,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: IAccount | null;
}) {
  const { createAccount, updateAccount, isSubmitting } = useAccounts();
  const isEditing = !!account;

  const handleSubmit = async (data: AccountFormData) => {
    try {
      if (isEditing && account) {
        await updateAccount(account.id, data);
        toast.success("Conta atualizada com sucesso.");
      } else {
        await createAccount(data);
        toast.success("Conta cadastrada com sucesso.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEditing
            ? "Não foi possível atualizar a conta."
            : "Não foi possível cadastrar a conta."
        )
      );
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar conta" : "Nova conta"}
      description={
        isEditing
          ? "Atualize os dados da conta selecionada."
          : "Preencha os campos para cadastrar uma nova conta."
      }
      formId={ACCOUNT_FORM_ID}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? "Salvar alterações" : "Cadastrar conta"}
    >
      <AccountForm
        key={account?.id ?? "new"}
        formId={ACCOUNT_FORM_ID}
        variant="sheet"
        defaultValues={account ?? undefined}
        isSubmitting={isSubmitting}
        submitLabel={isEditing ? "Salvar alterações" : "Cadastrar conta"}
        onSubmit={handleSubmit}
      />
    </FormSheet>
  );
}

export default function AccountsPage() {
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
    bulkPayAccounts,
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

  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [bulkPaidAt, setBulkPaidAt] = useState("");
  const [isBulkPaying, setIsBulkPaying] = useState(false);
  const [isBulkPayModalOpen, setIsBulkPayModalOpen] = useState(false);

  const totalCount = meta?.total ?? 0;
  const hasActiveFilters =
    nameFilter.trim().length > 0 ||
    statusFilter.length > 0 ||
    dueDateFromFilter.length > 0 ||
    dueDateToFilter.length > 0 ||
    paidAtFromFilter.length > 0 ||
    paidAtToFilter.length > 0;
  const isEmptyList = !isLoading && !error && accounts.length === 0;

  const visibleIds = accounts.map((account) => account.id);
  const isAllSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedAccountIds.includes(id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedAccountIds((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedAccountIds((prev) => [
        ...prev,
        ...visibleIds.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

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

  const handleBulkPay = async () => {
    if (!selectedAccountIds.length) {
      toast.error("Selecione pelo menos uma conta para marcar como paga.");
      return;
    }

    if (!bulkPaidAt) return;

    setIsBulkPaying(true);
    try {
      await bulkPayAccounts(selectedAccountIds, bulkPaidAt);
      toast.success("Contas marcadas como pagas com sucesso.");
      setSelectedAccountIds([]);
      setIsBulkPayModalOpen(false);
      setBulkPaidAt("");
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          "Não foi possível marcar as contas selecionadas como pagas."
        )
      );
    } finally {
      setIsBulkPaying(false);
    }
  };

  return (
    <PageLayout
      title="Contas"
      description="Liste, cadastre, edite e exclua contas com filtros por nome, status e datas."
    >
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
          {selectedAccountIds.length > 0 ? (
            <Button
              variant="outline"
              size="lg"
              className="rounded-md py-4.5"
              onClick={() => setIsBulkPayModalOpen(true)}
              disabled={
                isLoading ||
                isSubmitting ||
                !selectedAccountIds.length
              }
            >
              Marcar como pagas
            </Button>
          ) : null}
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
            <ConfirmModal
              open={isBulkPayModalOpen}
              onOpenChange={(open) => {
                setIsBulkPayModalOpen(open);
                if (!open) {
                  setBulkPaidAt("");
                }
              }}
              title="Marcar contas como pagas"
              description={
                <div className="mt-2 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Selecione a data de pagamento que será aplicada às{" "}
                    <span className="font-semibold text-foreground">
                      {selectedAccountIds.length}
                    </span>{" "}
                    conta(s) selecionada(s).
                  </p>
                  <DatePickerLabel
                    id="bulk-paid-at"
                    label="Data de pagamento"
                    value={bulkPaidAt}
                    onChange={setBulkPaidAt}
                    placeholder="Selecione..."
                    compact
                  />
                </div>
              }
              confirmLabel="Confirmar"
              cancelLabel="Cancelar"
              confirmVariant="default"
              isLoading={isBulkPaying}
              onConfirm={handleBulkPay}
            />
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
                <TableHead className={DATA_TABLE_HEAD_CLASS}>
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleToggleSelectAll}
                    aria-label="Selecionar todas as contas visíveis"
                  />
                </TableHead>
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
                  isSelected={selectedAccountIds.includes(account.id)}
                  onToggleSelect={() => handleToggleSelectOne(account.id)}
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
    </PageLayout>
  );
}

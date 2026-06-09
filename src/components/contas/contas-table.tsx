import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ContaStatusBadge } from "@/components/contas/conta-status-badge";
import { ContaStatusFilterSelect } from "@/components/contas/conta-status-filter-select";
import { ContaFormSheet } from "@/components/contas/conta-form-sheet";
import { ButtonAnimatedIcon } from "@/components/button-animated-icon";
import { DatePickerLabel } from "@/components/date-picker-label";
import { DeleteModal } from "@/components/delete-modal";
import { Button } from "@/components/ui/button";
import { DeleteIcon } from "@/components/ui/delete";
import { FileTextIcon } from "@/components/ui/file-text";
import { PlusIcon } from "@/components/ui/plus";
import { SquarePenIcon } from "@/components/ui/square-pen";
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
import { useContas } from "@/contexts/contas.context";
import { cn } from "@/lib/utils";
import { TABLE_PAGE_SIZE } from "@/shared/constants/app.constants";
import {
  FILTER_FIELD_LABEL_CLASS,
  FILTER_FIELD_WRAPPER_CLASS,
  FILTER_GRID_CLASS,
  FILTER_GRID_ITEM_CLASS,
  FILTER_INPUT_CLASS,
} from "@/shared/constants/filter-field.constants";
import {
  buildContasFilterSummary,
  fetchContasForReport,
  generateContasReportPdf,
} from "@/pdf";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formatDateBr } from "@/shared/helpers/date.helper";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";
import type { IConta } from "@/shared/interfaces/https/conta";

const COMPACT_CELL = "px-5 py-4";

function ContasTableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: TABLE_PAGE_SIZE }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 px-5 py-4"
        >
          <div className="h-4 w-40 flex-1 rounded-md bg-muted" />
          <div className="hidden h-4 w-24 rounded-md bg-muted md:block" />
          <div className="hidden h-4 w-28 rounded-md bg-muted lg:block" />
          <div className="h-8 w-16 rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}

function ContaRow({
  conta,
  rowIndex,
  onEdit,
  onDelete,
}: {
  conta: IConta;
  rowIndex: number;
  onEdit: (conta: IConta) => void;
  onDelete: (conta: IConta) => void;
}) {
  const editIcon = useButtonAnimatedIcon();
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
      <TableCell className={COMPACT_CELL}>
        <ContaStatusBadge status={conta.status} />
      </TableCell>
      <TableCell className={COMPACT_CELL}>
        <p className="truncate font-medium text-foreground">{conta.nome}</p>
      </TableCell>
      <TableCell className={cn(COMPACT_CELL, "text-sm font-medium text-foreground")}>
        {formatCurrency(conta.valor)}
      </TableCell>
      <TableCell className={cn(COMPACT_CELL, "hidden whitespace-nowrap text-sm text-muted-foreground md:table-cell")}>
        {formatDateBr(conta.dataVencimento)}
      </TableCell>
      <TableCell className={cn(COMPACT_CELL, "hidden whitespace-nowrap text-sm text-muted-foreground lg:table-cell")}>
        {conta.dataPagamento ? formatDateBr(conta.dataPagamento) : "—"}
      </TableCell>
      <TableCell className={cn(COMPACT_CELL, "w-[88px]")}>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-md bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
            aria-label={`Editar ${conta.nome}`}
            onClick={() => onEdit(conta)}
            {...editIcon.rowHandlers}
          >
            <ButtonAnimatedIcon
              icon={SquarePenIcon}
              iconRef={editIcon.iconRef}
              size={14}
              className="text-primary"
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
            aria-label={`Excluir ${conta.nome}`}
            onClick={() => onDelete(conta)}
            {...deleteIcon.rowHandlers}
          >
            <ButtonAnimatedIcon
              icon={DeleteIcon}
              iconRef={deleteIcon.iconRef}
              size={14}
              className="text-destructive"
            />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ContasTable() {
  const {
    contas,
    meta,
    isLoading,
    isSubmitting,
    error,
    refetch,
    deleteConta,
    nomeFilter,
    setNomeFilter,
    statusFilter,
    setStatusFilter,
    dataVencimentoFromFilter,
    setDataVencimentoFromFilter,
    dataVencimentoToFilter,
    setDataVencimentoToFilter,
    dataPagamentoFromFilter,
    setDataPagamentoFromFilter,
    dataPagamentoToFilter,
    setDataPagamentoToFilter,
    exportListParams,
    setPage,
  } = useContas();

  const [formOpen, setFormOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [editingConta, setEditingConta] = useState<IConta | null>(null);
  const [deletingConta, setDeletingConta] = useState<IConta | null>(null);
  const plusIconHeader = useButtonAnimatedIcon();
  const plusIconEmpty = useButtonAnimatedIcon();
  const pdfIcon = useButtonAnimatedIcon();

  const totalCount = meta?.total ?? 0;
  const hasActiveFilters =
    nomeFilter.trim().length > 0 ||
    statusFilter.length > 0 ||
    dataVencimentoFromFilter.length > 0 ||
    dataVencimentoToFilter.length > 0 ||
    dataPagamentoFromFilter.length > 0 ||
    dataPagamentoToFilter.length > 0;
  const isEmptyList = !isLoading && !error && contas.length === 0;

  const openCreate = () => {
    setEditingConta(null);
    setFormOpen(true);
  };

  const openEdit = (conta: IConta) => {
    setEditingConta(conta);
    setFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingConta(null);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);

    try {
      const reportContas = await fetchContasForReport(exportListParams);

      if (reportContas.length === 0) {
        toast.error("Nenhuma conta encontrada para os filtros selecionados.");
        return;
      }

      const filterSummary = buildContasFilterSummary(exportListParams);

      await generateContasReportPdf(reportContas, { filterSummary });
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
    if (!deletingConta) return;

    try {
      await deleteConta(deletingConta.id);
      toast.success("Conta excluída com sucesso.");
      setDeletingConta(null);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Não foi possível excluir a conta.")
      );
    }
  };

  return (
    <>
      <Card className="gap-0 overflow-hidden rounded-sm border border-border bg-white py-0 shadow-sm ring-0">
        <div className="flex flex-col gap-4 border-b border-border bg-muted/20 px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Contas</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Gerencie contas a pagar e receber com filtros por status e datas.
                {!isLoading && !error && meta && (
                  <>
                    {" "}
                    <span className="font-medium text-foreground/70">
                      · {totalCount} {totalCount === 1 ? "conta" : "contas"}
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
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
                <ButtonAnimatedIcon
                  icon={PlusIcon}
                  iconRef={plusIconHeader.iconRef}
                  size={16}
                />
                Nova conta
              </Button>
            </div>
          </div>

          <div className={FILTER_GRID_CLASS}>
            <div
              className={cn(
                FILTER_GRID_ITEM_CLASS,
                FILTER_FIELD_WRAPPER_CLASS
              )}
            >
              <label
                htmlFor="conta-nome-filter"
                className={FILTER_FIELD_LABEL_CLASS}
              >
                Nome
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="conta-nome-filter"
                  type="search"
                  placeholder="Buscar por nome..."
                  value={nomeFilter}
                  onChange={(e) => setNomeFilter(e.target.value)}
                  className={FILTER_INPUT_CLASS}
                />
              </div>
            </div>

            <ContaStatusFilterSelect
              className={FILTER_GRID_ITEM_CLASS}
              value={statusFilter}
              onChange={setStatusFilter}
            />

            <DatePickerLabel
              className={FILTER_GRID_ITEM_CLASS}
              id="conta-vencimento-from"
              label="Vencimento (de)"
              value={dataVencimentoFromFilter}
              onChange={setDataVencimentoFromFilter}
              placeholder="Data inicial"
              compact
            />

            <DatePickerLabel
              className={FILTER_GRID_ITEM_CLASS}
              id="conta-vencimento-to"
              label="Vencimento (até)"
              value={dataVencimentoToFilter}
              onChange={setDataVencimentoToFilter}
              placeholder="Data final"
              compact
            />

            <DatePickerLabel
              className={FILTER_GRID_ITEM_CLASS}
              id="conta-pagamento-from"
              label="Pagamento (de)"
              value={dataPagamentoFromFilter}
              onChange={setDataPagamentoFromFilter}
              placeholder="Data inicial"
              compact
            />

            <DatePickerLabel
              className={FILTER_GRID_ITEM_CLASS}
              id="conta-pagamento-to"
              label="Pagamento (até)"
              value={dataPagamentoToFilter}
              onChange={setDataPagamentoToFilter}
              placeholder="Data final"
              compact
            />
          </div>
        </div>

        {isLoading && <ContasTableSkeleton />}

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

        {isEmptyList && !hasActiveFilters && (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                Nenhuma conta cadastrada
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Comece registrando a primeira conta do sistema.
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
              Nova conta
            </Button>
          </div>
        )}

        {isEmptyList && hasActiveFilters && (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <p className="font-medium text-foreground">Nenhuma conta encontrada</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Ajuste os filtros e tente novamente.
            </p>
          </div>
        )}

        {!isLoading && !error && contas.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-border/80 bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Status
                  </TableHead>
                  <TableHead className="h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Nome
                  </TableHead>
                  <TableHead className="h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Valor
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase md:table-cell">
                    Vencimento
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell">
                    Pagamento
                  </TableHead>
                  <TableHead className="h-11 px-5 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contas.map((conta, index) => (
                  <ContaRow
                    key={conta.id}
                    rowIndex={index}
                    conta={conta}
                    onEdit={openEdit}
                    onDelete={setDeletingConta}
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

      <ContaFormSheet
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        conta={editingConta}
      />

      <DeleteModal
        open={!!deletingConta}
        onOpenChange={(open) => {
          if (!open) setDeletingConta(null);
        }}
        title="Excluir conta"
        description={
          <>
            Tem certeza que deseja excluir a conta{" "}
            <strong>{deletingConta?.nome}</strong>? Esta ação não pode ser
            desfeita.
          </>
        }
        isLoading={isSubmitting}
        onConfirm={handleDelete}
      />
    </>
  );
}

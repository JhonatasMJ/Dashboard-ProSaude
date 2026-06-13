import { useState } from "react";
import { toast } from "sonner";
import { AsoFormSheet } from "@/components/asos/aso-form-sheet";
import { AsoTypeBadge } from "@/components/asos/aso-type-badge";
import { AsoTypeFilterSelect } from "@/components/asos/aso-type-filter-select";
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
import { EmployeeFilterSelect } from "@/components/employee-exams/employee-filter-select";
import { Button } from "@/components/ui/button";
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
import { useAsos } from "@/contexts/asos.context";
import { useButtonAnimatedIcon } from "@/hooks/use-button-animated-icon";
import { useCrudSheetState } from "@/hooks/use-crud-sheet-state";
import { cn } from "@/lib/utils";
import { buildAsoPdfData, generateAsoPdf } from "@/pdf";
import {
  FILTER_GRID_CLASS,
  FILTER_GRID_ITEM_CLASS,
} from "@/shared/constants/filter-field.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formatDateBr } from "@/shared/helpers/date.helper";
import { truncateText } from "@/shared/helpers/truncate-text.helper";
import type { IAso } from "@/shared/interfaces/https/aso";

const COMPANY_MAX_LENGTH = 22;

function formatItemsSummary(items: { name?: string; description?: string }[]) {
  if (items.length === 0) return "—";

  const first = items[0].name ?? items[0].description ?? "";
  if (items.length === 1) {
    return truncateText(first, 28);
  }

  return `${truncateText(first, 20)} +${items.length - 1}`;
}

function AsoRow({
  aso,
  rowIndex,
  onEdit,
  onDelete,
  onDownload,
  isDownloading,
}: {
  aso: IAso;
  rowIndex: number;
  onEdit: (aso: IAso) => void;
  onDelete: (aso: IAso) => void;
  onDownload: (aso: IAso) => void;
  isDownloading: boolean;
}) {
  return (
    <TableRow className={getDataTableRowClassName(rowIndex)}>
      <TableCell className={DATA_TABLE_CELL_CLASS}>
        <AsoTypeBadge type={aso.type} />
      </TableCell>
      <TableCell
        className={cn(
          DATA_TABLE_CELL_CLASS,
          "whitespace-nowrap text-sm text-foreground"
        )}
      >
        {formatDateBr(aso.date)}
      </TableCell>
      <TableCell className={cn(DATA_TABLE_CELL_CLASS, "max-w-[160px]")}>
        <p className="truncate text-sm font-medium text-foreground">
          {aso.employee.name}
        </p>
        <p
          className="truncate text-xs text-muted-foreground"
          title={aso.employee.company.name}
        >
          {truncateText(aso.employee.company.name, COMPANY_MAX_LENGTH)}
        </p>
      </TableCell>
      <TableCell
        className={cn(DATA_TABLE_CELL_CLASS, "hidden max-w-[140px] sm:table-cell")}
        title={aso.exams.map((exam) => exam.name).join(", ")}
      >
        <p className="truncate text-sm text-foreground">
          {formatItemsSummary(aso.exams)}
        </p>
        <p className="text-xs text-muted-foreground">
          {aso.exams.length}{" "}
          {aso.exams.length === 1 ? "exame" : "exames"}
        </p>
      </TableCell>
      <TableCell
        className={cn(DATA_TABLE_CELL_CLASS, "hidden max-w-[140px] md:table-cell")}
        title={aso.occupationalRisks
          .map((risk) => risk.description)
          .join(", ")}
      >
        <p className="truncate text-sm text-foreground">
          {formatItemsSummary(aso.occupationalRisks)}
        </p>
        <p className="text-xs text-muted-foreground">
          {aso.occupationalRisks.length}{" "}
          {aso.occupationalRisks.length === 1 ? "risco" : "riscos"}
        </p>
      </TableCell>
      <TableCell className={cn(DATA_TABLE_CELL_CLASS, "w-[88px]")}>
        <DataTableRowActions
          editLabel={`Editar ASO de ${aso.employee.name}`}
          deleteLabel={`Excluir ASO de ${aso.employee.name}`}
          downloadLabel={`Baixar ASO de ${aso.employee.name}`}
          onEdit={() => onEdit(aso)}
          onDelete={() => onDelete(aso)}
          onDownload={() => onDownload(aso)}
          isDownloading={isDownloading}
          showDownload
        />
      </TableCell>
    </TableRow>
  );
}

export function AsosTable() {
  const {
    asos,
    meta,
    employees,
    isLoading,
    isLoadingFilters,
    isSubmitting,
    error,
    refetch,
    refetchFilterOptions,
    deleteAso,
    employeeIdFilter,
    setEmployeeIdFilter,
    typeFilter,
    setTypeFilter,
    dateFromFilter,
    setDateFromFilter,
    dateToFilter,
    setDateToFilter,
    setPage,
  } = useAsos();

  const {
    formOpen,
    editingItem: editingAso,
    deletingItem: deletingAso,
    setDeletingItem: setDeletingAso,
    openCreate,
    openEdit,
    handleFormOpenChange,
  } = useCrudSheetState<IAso>();
  const [downloadingAsoId, setDownloadingAsoId] = useState<string | null>(null);
  const plusIconHeader = useButtonAnimatedIcon();
  const plusIconEmpty = useButtonAnimatedIcon();

  const totalCount = meta?.total ?? 0;
  const hasActiveFilters =
    employeeIdFilter.length > 0 ||
    typeFilter.length > 0 ||
    dateFromFilter.length > 0 ||
    dateToFilter.length > 0;
  const isEmptyList = !isLoading && !error && asos.length === 0;
  const canCreate = employees.length > 0;

  const handleOpenCreate = () => {
    void refetchFilterOptions();
    openCreate();
  };

  const handleOpenEdit = (aso: IAso) => {
    void refetchFilterOptions();
    openEdit(aso);
  };

  const handleDelete = async () => {
    if (!deletingAso) return;

    try {
      await deleteAso(deletingAso.id);
      toast.success("ASO excluído com sucesso.");
      setDeletingAso(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível excluir o ASO."));
    }
  };

  const handleDownload = async (aso: IAso) => {
    setDownloadingAsoId(aso.id);

    try {
      const pdfData = await buildAsoPdfData(aso, employees);
      await generateAsoPdf(pdfData);
      toast.success("ASO baixado com sucesso.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível gerar o PDF do ASO."));
    } finally {
      setDownloadingAsoId(null);
    }
  };

  return (
    <DataTable
      title="Emissão de ASO"
      description={
        <>
          Emita e gerencie atestados de saúde ocupacional.
          {!isLoading && !error && meta ? (
            <>
              {" "}
              <span className="font-medium text-foreground/70">
                · {totalCount} {totalCount === 1 ? "ASO" : "ASOs"}
              </span>
            </>
          ) : null}
        </>
      }
      headerActions={
        <Button
          className="rounded-md py-4.5"
          size="lg"
          onClick={handleOpenCreate}
          disabled={!canCreate || isLoadingFilters}
          {...plusIconHeader.rowHandlers}
        >
          <ButtonAnimatedIcon
            icon={PlusIcon}
            iconRef={plusIconHeader.iconRef}
            size={16}
          />
          Emitir ASO
        </Button>
      }
      filters={
        <div className={FILTER_GRID_CLASS}>
          <EmployeeFilterSelect
            className={FILTER_GRID_ITEM_CLASS}
            value={employeeIdFilter}
            onChange={setEmployeeIdFilter}
            employees={employees}
            disabled={isLoadingFilters}
          />
          <AsoTypeFilterSelect
            className={FILTER_GRID_ITEM_CLASS}
            value={typeFilter}
            onChange={setTypeFilter}
            disabled={isLoadingFilters}
          />
          <DatePickerLabel
            className={FILTER_GRID_ITEM_CLASS}
            id="aso-date-from"
            label="Data (de)"
            value={dateFromFilter}
            onChange={setDateFromFilter}
            placeholder="Selecione a data inicial"
            disabled={isLoadingFilters}
            compact
          />
          <DatePickerLabel
            className={FILTER_GRID_ITEM_CLASS}
            id="aso-date-to"
            label="Data (até)"
            value={dateToFilter}
            onChange={setDateToFilter}
            placeholder="Selecione a data final"
            disabled={isLoadingFilters}
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
        title: "Nenhum ASO emitido",
        description: "Comece emitindo o primeiro atestado de saúde ocupacional.",
        action: (
          <Button
            className="mt-1 rounded-md py-4.5"
            onClick={handleOpenCreate}
            disabled={!canCreate || isLoadingFilters}
            {...plusIconEmpty.rowHandlers}
          >
            <ButtonAnimatedIcon
              icon={PlusIcon}
              iconRef={plusIconEmpty.iconRef}
              size={16}
            />
            Emitir ASO
          </Button>
        ),
      }}
      filteredEmptyState={{
        title: "Nenhum ASO encontrado",
        description: "Ajuste os filtros e tente novamente.",
      }}
      skeletonColumns={6}
      overlays={
        <>
          <AsoFormSheet
            open={formOpen}
            onOpenChange={handleFormOpenChange}
            aso={editingAso}
          />
          <DeleteModal
            open={!!deletingAso}
            onOpenChange={(open) => {
              if (!open) setDeletingAso(null);
            }}
            title="Excluir ASO"
            description={
              <>
                Tem certeza que deseja excluir o ASO de{" "}
                <strong>{deletingAso?.employee.name}</strong> (
                {deletingAso ? formatDateBr(deletingAso.date) : ""})? Esta ação
                não pode ser desfeita.
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
              <TableHead className={DATA_TABLE_HEAD_CLASS}>Tipo</TableHead>
              <TableHead className={DATA_TABLE_HEAD_CLASS}>Data</TableHead>
              <TableHead className={DATA_TABLE_HEAD_CLASS}>Funcionário</TableHead>
              <TableHead
                className={cn(DATA_TABLE_HEAD_CLASS, "hidden sm:table-cell")}
              >
                Exames
              </TableHead>
              <TableHead
                className={cn(DATA_TABLE_HEAD_CLASS, "hidden md:table-cell")}
              >
                Riscos
              </TableHead>
              <TableHead className={`text-right ${DATA_TABLE_HEAD_CLASS}`}>
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {asos.map((aso, index) => (
              <AsoRow
                key={aso.id}
                rowIndex={index}
                aso={aso}
                onEdit={handleOpenEdit}
                onDelete={setDeletingAso}
                onDownload={handleDownload}
                isDownloading={downloadingAsoId === aso.id}
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

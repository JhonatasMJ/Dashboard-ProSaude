import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { ButtonAnimatedIcon } from "@/components/button-animated-icon";
import { EmployeeExamFormSheet } from "@/components/employee-exams/employee-exam-form-sheet";
import { EmployeeFilterSelect } from "@/components/employee-exams/employee-filter-select";
import { ExamCatalogFilterSelect } from "@/components/employee-exams/exam-catalog-filter-select";
import { PaymentStatusFilterSelect } from "@/components/employee-exams/payment-status-filter-select";
import { CompanyFilterSelect } from "@/components/exams/company-filter-select";
import {
  DataTable,
  DataTableRowActions,
  DATA_TABLE_COMPACT_CELL_CLASS,
  getDataTableRowClassName,
} from "@/components/data-table";
import { DeleteModal } from "@/components/delete-modal";
import { Button } from "@/components/ui/button";
import { FileTextIcon } from "@/components/ui/file-text";
import { PlusIcon } from "@/components/ui/plus";
import { DatePickerLabel } from "@/components/date-picker-label";
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
import { useEmployeeExams } from "@/contexts/employee-exams.context";
import {
  buildEmployeeExamsFilterSummary,
  fetchEmployeeExamsForReport,
  generateEmployeeExamsReportPdf,
} from "@/pdf";
import { cn } from "@/lib/utils";
import {
  FILTER_FIELD_LABEL_CLASS,
  FILTER_FIELD_WRAPPER_CLASS,
  FILTER_GRID_CLASS,
  FILTER_GRID_ITEM_CLASS,
  FILTER_INPUT_CLASS,
} from "@/shared/constants/filter-field.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formatDateBr } from "@/shared/helpers/date.helper";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";
import { truncateText } from "@/shared/helpers/truncate-text.helper";
import type { IEmployeeExam } from "@/shared/interfaces/https/employee-exam";

const COMPANY_MAX_LENGTH = 22;

function LinkRow({
  link,
  rowIndex,
  onEdit,
  onDelete,
}: {
  link: IEmployeeExam;
  rowIndex: number;
  onEdit: (link: IEmployeeExam) => void;
  onDelete: (link: IEmployeeExam) => void;
}) {
  return (
    <TableRow className={getDataTableRowClassName(rowIndex)}>
      <TableCell className={DATA_TABLE_COMPACT_CELL_CLASS}>
        <PaymentStatusBadge status={link.paymentStatus ?? "PENDING"} />
      </TableCell>
      <TableCell className={cn(DATA_TABLE_COMPACT_CELL_CLASS, "whitespace-nowrap text-xs text-muted-foreground")}>
        {link.paidAt ? formatDateBr(link.paidAt) : "—"}
      </TableCell>
      <TableCell className={cn(DATA_TABLE_COMPACT_CELL_CLASS, "max-w-[140px]")}>
        <p className="truncate text-sm font-medium text-foreground">
          {link.employee.name}
        </p>
        <p
          className="truncate text-xs text-muted-foreground"
          title={link.employee.company.name}
        >
          {truncateText(link.employee.company.name, COMPANY_MAX_LENGTH)}
        </p>
      </TableCell>
      <TableCell className={cn(DATA_TABLE_COMPACT_CELL_CLASS, "hidden max-w-[160px] sm:table-cell")}>
        <p className="truncate text-sm text-foreground" title={link.exam.name}>
          {link.exam.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(link.exam.price)}
        </p>
      </TableCell>
      <TableCell className={cn(DATA_TABLE_COMPACT_CELL_CLASS, "hidden whitespace-nowrap text-xs text-foreground md:table-cell")}>
        {formatDateBr(link.examDate)}
        {link.examTime ? (
          <>
            <span className="mx-1 text-muted-foreground">·</span>
            {link.examTime}
          </>
        ) : null}
      </TableCell>
      <TableCell
        className={cn(
          DATA_TABLE_COMPACT_CELL_CLASS,
          "hidden max-w-[120px] truncate text-xs text-muted-foreground lg:table-cell"
        )}
        title={link.professionalName}
      >
        {link.professionalName}
      </TableCell>
      <TableCell
        className={cn(
          DATA_TABLE_COMPACT_CELL_CLASS,
          "hidden text-xs font-medium xl:table-cell",
          link.exam.profit >= 0 ? "text-primary" : "text-destructive"
        )}
      >
        {formatCurrency(link.exam.profit)}
      </TableCell>
      <TableCell className={cn(DATA_TABLE_COMPACT_CELL_CLASS, "w-[88px]")}>
        <DataTableRowActions
          size="compact"
          editLabel={`Editar vínculo de ${link.employee.name}`}
          deleteLabel={`Excluir vínculo de ${link.employee.name}`}
          onEdit={() => onEdit(link)}
          onDelete={() => onDelete(link)}
        />
      </TableCell>
    </TableRow>
  );
}

export function EmployeeExamsTable() {
  const {
    links,
    meta,
    companies,
    employees,
    exams,
    isLoading,
    isLoadingFilters,
    error,
    refetch,
    refetchFilterOptions,
    deleteLink,
    isSubmitting,
    professionalNameFilter,
    setProfessionalNameFilter,
    companyIdFilter,
    setCompanyIdFilter,
    employeeIdFilter,
    setEmployeeIdFilter,
    examIdFilter,
    setExamIdFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    examDateFromFilter,
    setExamDateFromFilter,
    examDateToFilter,
    setExamDateToFilter,
    exportListParams,
    setPage,
  } = useEmployeeExams();

  const {
    formOpen,
    editingItem: editingLink,
    deletingItem: deletingLink,
    setDeletingItem: setDeletingLink,
    openCreate,
    openEdit,
    handleFormOpenChange,
  } = useCrudSheetState<IEmployeeExam>();
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const plusIconHeader = useButtonAnimatedIcon();
  const plusIconEmpty = useButtonAnimatedIcon();
  const pdfIcon = useButtonAnimatedIcon();

  const totalCount = meta?.total ?? 0;
  const hasActiveFilters =
    professionalNameFilter.trim().length > 0 ||
    companyIdFilter.length > 0 ||
    employeeIdFilter.length > 0 ||
    examIdFilter.length > 0 ||
    paymentStatusFilter.length > 0 ||
    examDateFromFilter.length > 0 ||
    examDateToFilter.length > 0;
  const isEmptyList = !isLoading && !error && links.length === 0;
  const canCreate = employees.length > 0 && exams.length > 0;

  const handleOpenCreate = () => {
    void refetchFilterOptions();
    openCreate();
  };

  const handleOpenEdit = (link: IEmployeeExam) => {
    void refetchFilterOptions();
    openEdit(link);
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);

    try {
      const reportLinks = await fetchEmployeeExamsForReport(exportListParams);

      if (reportLinks.length === 0) {
        toast.error("Nenhum vínculo encontrado para os filtros selecionados.");
        return;
      }

      const filterSummary = buildEmployeeExamsFilterSummary(exportListParams, {
        companies,
        employees,
        exams,
      });

      await generateEmployeeExamsReportPdf(reportLinks, { filterSummary });
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
    if (!deletingLink) return;

    try {
      await deleteLink(deletingLink.id);
      toast.success("Vínculo excluído com sucesso.");
      setDeletingLink(null);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Não foi possível excluir o vínculo.")
      );
    }
  };

  return (
    <DataTable
      title="Vínculos"
      description={
        <>
          Funcionários vinculados a exames do catálogo.
          {!isLoading && !error && meta ? (
            <>
              {" "}
              <span className="font-medium text-foreground/70">
                · {totalCount} {totalCount === 1 ? "vínculo" : "vínculos"}
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
            disabled={isLoading || isLoadingFilters || isExportingPdf}
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
            onClick={handleOpenCreate}
            disabled={!canCreate || isLoadingFilters}
            {...plusIconHeader.rowHandlers}
          >
            <ButtonAnimatedIcon icon={PlusIcon} iconRef={plusIconHeader.iconRef} size={16} />
            Novo vínculo
          </Button>
        </>
      }
      filters={
        <div className={FILTER_GRID_CLASS}>
          <div className={cn(FILTER_GRID_ITEM_CLASS, FILTER_FIELD_WRAPPER_CLASS)}>
            <label htmlFor="link-professional-filter" className={FILTER_FIELD_LABEL_CLASS}>
              Profissional
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="link-professional-filter"
                type="search"
                placeholder="Nome do profissional..."
                value={professionalNameFilter}
                onChange={(event) => setProfessionalNameFilter(event.target.value)}
                className={FILTER_INPUT_CLASS}
              />
            </div>
          </div>
          <PaymentStatusFilterSelect
            className={FILTER_GRID_ITEM_CLASS}
            value={paymentStatusFilter}
            onChange={setPaymentStatusFilter}
            disabled={isLoadingFilters}
          />
          <CompanyFilterSelect
            className={FILTER_GRID_ITEM_CLASS}
            value={companyIdFilter}
            onChange={setCompanyIdFilter}
            companies={companies}
            disabled={isLoadingFilters}
          />
          <EmployeeFilterSelect
            className={FILTER_GRID_ITEM_CLASS}
            value={employeeIdFilter}
            onChange={setEmployeeIdFilter}
            employees={employees}
            disabled={isLoadingFilters}
          />
          <ExamCatalogFilterSelect
            className={FILTER_GRID_ITEM_CLASS}
            value={examIdFilter}
            onChange={setExamIdFilter}
            exams={exams}
            disabled={isLoadingFilters}
          />
          <DatePickerLabel
            className={FILTER_GRID_ITEM_CLASS}
            id="link-date-from"
            label="Data do exame (de)"
            value={examDateFromFilter}
            onChange={setExamDateFromFilter}
            placeholder="Selecione a data inicial"
            disabled={isLoadingFilters}
            compact
          />
          <DatePickerLabel
            className={FILTER_GRID_ITEM_CLASS}
            id="link-date-to"
            label="Data do exame (até)"
            value={examDateToFilter}
            onChange={setExamDateToFilter}
            placeholder="Selecione a data final"
            disabled={isLoadingFilters}
            compact
          />
        </div>
      }
      warning={
        !canCreate && !isLoadingFilters ? (
          <p className="text-sm text-amber-700">
            {employees.length === 0 && exams.length === 0
              ? "Cadastre funcionários e exames no catálogo antes de criar vínculos."
              : employees.length === 0
                ? "Cadastre pelo menos um funcionário antes de criar vínculos."
                : "Cadastre pelo menos um exame no catálogo antes de criar vínculos."}
          </p>
        ) : null
      }
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      isEmpty={isEmptyList}
      hasActiveFilters={hasActiveFilters}
      emptyState={{
        title: "Nenhum vínculo cadastrado",
        description: canCreate
          ? "Comece registrando o primeiro vínculo funcionário–exame."
          : "Cadastre funcionários e exames para poder criar vínculos.",
        action: canCreate ? (
          <Button className="mt-1 rounded-md py-4.5" onClick={handleOpenCreate} {...plusIconEmpty.rowHandlers}>
            <ButtonAnimatedIcon icon={PlusIcon} iconRef={plusIconEmpty.iconRef} size={16} />
            Novo vínculo
          </Button>
        ) : undefined,
      }}
      filteredEmptyState={{
        title: "Nenhum vínculo encontrado",
        description: "Ajuste os filtros e tente novamente.",
      }}
      skeletonColumns={4}
      overlays={
        <>
          <EmployeeExamFormSheet
            open={formOpen}
            onOpenChange={handleFormOpenChange}
            link={editingLink}
          />
          <DeleteModal
            open={!!deletingLink}
            onOpenChange={(open) => {
              if (!open) setDeletingLink(null);
            }}
            title="Excluir vínculo"
            description={
              <>
                Tem certeza que deseja excluir o vínculo de{" "}
                <strong>{deletingLink?.employee.name}</strong> com o exame{" "}
                <strong>{deletingLink?.exam.name}</strong>? Esta ação não pode ser
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
            <TableRow className="border-border/80 bg-muted/40 hover:bg-muted/40">
              <TableHead className={cn(DATA_TABLE_COMPACT_CELL_CLASS, "h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase")}>
                Status
              </TableHead>
              <TableHead className={cn(DATA_TABLE_COMPACT_CELL_CLASS, "h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase")}>
                Pago em
              </TableHead>
              <TableHead className={cn(DATA_TABLE_COMPACT_CELL_CLASS, "h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase")}>
                Funcionário
              </TableHead>
              <TableHead className={cn(DATA_TABLE_COMPACT_CELL_CLASS, "hidden h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:table-cell")}>
                Exame
              </TableHead>
              <TableHead className={cn(DATA_TABLE_COMPACT_CELL_CLASS, "hidden h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase md:table-cell")}>
                Data
              </TableHead>
              <TableHead className={cn(DATA_TABLE_COMPACT_CELL_CLASS, "hidden h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell")}>
                Profissional
              </TableHead>
              <TableHead className={cn(DATA_TABLE_COMPACT_CELL_CLASS, "hidden h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase xl:table-cell")}>
                Lucro
              </TableHead>
              <TableHead className={cn(DATA_TABLE_COMPACT_CELL_CLASS, "h-9 w-[88px] text-right text-[11px] font-semibold tracking-wide text-muted-foreground uppercase")}>
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link, index) => (
              <LinkRow
                key={link.id}
                rowIndex={index}
                link={link}
                onEdit={handleOpenEdit}
                onDelete={setDeletingLink}
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

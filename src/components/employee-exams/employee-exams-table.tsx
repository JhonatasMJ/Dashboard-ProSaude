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
import { DeleteModal } from "@/components/delete-modal";
import { Button } from "@/components/ui/button";
import { DeleteIcon } from "@/components/ui/delete";
import { FileTextIcon } from "@/components/ui/file-text";
import { PlusIcon } from "@/components/ui/plus";
import { SquarePenIcon } from "@/components/ui/square-pen";
import { DatePickerLabel } from "@/components/date-picker-label";
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
import { useEmployeeExams } from "@/contexts/employee-exams-context";
import {
  buildEmployeeExamsFilterSummary,
  fetchEmployeeExamsForReport,
  generateEmployeeExamsReportPdf,
} from "@/pdf";
import { cn } from "@/lib/utils";
import { TABLE_PAGE_SIZE } from "@/shared/constants/app.constants";
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

const COMPACT_CELL = "px-3 py-2.5";
const COMPANY_MAX_LENGTH = 22;

function EmployeeExamsTableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: TABLE_PAGE_SIZE }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 px-5 py-4"
        >
          <div className="h-4 w-40 flex-1 rounded-md bg-muted" />
          <div className="hidden h-4 w-28 rounded-md bg-muted md:block" />
          <div className="hidden h-4 w-32 rounded-md bg-muted lg:block" />
          <div className="h-8 w-16 rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}

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
        <PaymentStatusBadge status={link.paymentStatus ?? "PENDING"} />
      </TableCell>
      <TableCell className={cn(COMPACT_CELL, "whitespace-nowrap text-xs text-muted-foreground")}>
        {link.paidAt ? formatDateBr(link.paidAt) : "—"}
      </TableCell>
      <TableCell className={cn(COMPACT_CELL, "max-w-[140px]")}>
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
      <TableCell className={cn(COMPACT_CELL, "hidden max-w-[160px] sm:table-cell")}>
        <p className="truncate text-sm text-foreground" title={link.exam.name}>
          {link.exam.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(link.exam.price)}
        </p>
      </TableCell>
      <TableCell className={cn(COMPACT_CELL, "hidden whitespace-nowrap text-xs text-foreground md:table-cell")}>
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
          COMPACT_CELL,
          "hidden max-w-[120px] truncate text-xs text-muted-foreground lg:table-cell"
        )}
        title={link.professionalName}
      >
        {link.professionalName}
      </TableCell>
      <TableCell
        className={cn(
          COMPACT_CELL,
          "hidden text-xs font-medium xl:table-cell",
          link.exam.profit >= 0 ? "text-primary" : "text-destructive"
        )}
      >
        {formatCurrency(link.exam.profit)}
      </TableCell>
      <TableCell className={cn(COMPACT_CELL, "w-[88px]")}>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-md bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
            aria-label={`Editar vínculo de ${link.employee.name}`}
            onClick={() => onEdit(link)}
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
            aria-label={`Excluir vínculo de ${link.employee.name}`}
            onClick={() => onDelete(link)}
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

  const [formOpen, setFormOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [editingLink, setEditingLink] = useState<IEmployeeExam | null>(null);
  const [deletingLink, setDeletingLink] = useState<IEmployeeExam | null>(null);
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

  const openCreate = () => {
    void refetchFilterOptions();
    setEditingLink(null);
    setFormOpen(true);
  };

  const openEdit = (link: IEmployeeExam) => {
    void refetchFilterOptions();
    setEditingLink(link);
    setFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingLink(null);
    }
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
    <>
      <Card className="gap-0 overflow-hidden rounded-sm border border-border bg-white py-0 shadow-sm ring-0">
        <div className="flex flex-col gap-4 border-b border-border bg-muted/20 px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Vínculos</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Funcionários vinculados a exames do catálogo.
                {!isLoading && !error && meta && (
                  <>
                    {" "}
                    <span className="font-medium text-foreground/70">
                      · {totalCount}{" "}
                      {totalCount === 1 ? "vínculo" : "vínculos"}
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
                onClick={openCreate}
                disabled={!canCreate || isLoadingFilters}
                {...plusIconHeader.rowHandlers}
              >
                <ButtonAnimatedIcon
                  icon={PlusIcon}
                  iconRef={plusIconHeader.iconRef}
                  size={16}
                />
                Novo vínculo
              </Button>
            </div>
          </div>

          <div className={FILTER_GRID_CLASS}>
            <div className={cn(FILTER_GRID_ITEM_CLASS, FILTER_FIELD_WRAPPER_CLASS)}>
              <label
                htmlFor="link-professional-filter"
                className={FILTER_FIELD_LABEL_CLASS}
              >
                Profissional
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="link-professional-filter"
                  type="search"
                  placeholder="Nome do profissional..."
                  value={professionalNameFilter}
                  onChange={(e) => setProfessionalNameFilter(e.target.value)}
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

          {!canCreate && !isLoadingFilters && (
            <p className="text-sm text-amber-700">
              {employees.length === 0 && exams.length === 0
                ? "Cadastre funcionários e exames no catálogo antes de criar vínculos."
                : employees.length === 0
                  ? "Cadastre pelo menos um funcionário antes de criar vínculos."
                  : "Cadastre pelo menos um exame no catálogo antes de criar vínculos."}
            </p>
          )}
        </div>

        {isLoading && <EmployeeExamsTableSkeleton />}

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
                Nenhum vínculo cadastrado
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {canCreate
                  ? "Comece registrando o primeiro vínculo funcionário–exame."
                  : "Cadastre funcionários e exames para poder criar vínculos."}
              </p>
            </div>
            {canCreate && (
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
                Novo vínculo
              </Button>
            )}
          </div>
        )}

        {isEmptyList && hasActiveFilters && (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <p className="font-medium text-foreground">
              Nenhum vínculo encontrado
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Ajuste os filtros e tente novamente.
            </p>
          </div>
        )}

        {!isLoading && !error && links.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-border/80 bg-muted/40 hover:bg-muted/40">
                  <TableHead className={cn(COMPACT_CELL, "h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase")}>
                    Status
                  </TableHead>
                  <TableHead className={cn(COMPACT_CELL, "h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase")}>
                    Pago em
                  </TableHead>
                  <TableHead className={cn(COMPACT_CELL, "h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase")}>
                    Funcionário
                  </TableHead>
                  <TableHead className={cn(COMPACT_CELL, "hidden h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:table-cell")}>
                    Exame
                  </TableHead>
                  <TableHead className={cn(COMPACT_CELL, "hidden h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase md:table-cell")}>
                    Data
                  </TableHead>
                  <TableHead className={cn(COMPACT_CELL, "hidden h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell")}>
                    Profissional
                  </TableHead>
                  <TableHead className={cn(COMPACT_CELL, "hidden h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase xl:table-cell")}>
                    Lucro
                  </TableHead>
                  <TableHead className={cn(COMPACT_CELL, "h-9 w-[88px] text-right text-[11px] font-semibold tracking-wide text-muted-foreground uppercase")}>
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
                    onEdit={openEdit}
                    onDelete={setDeletingLink}
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
  );
}

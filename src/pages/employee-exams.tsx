import { Search } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ButtonAnimatedIcon } from "@/components/ButtonAnimatedIcon";
import { CompanyFilterSelect } from "@/components/CompanyFilterSelect";
import { EmployeeFilterSelect } from "@/components/EmployeeFilterSelect";
import { EmployeeExamForm } from "@/components/Forms/EmployeeExamForm";
import {
  DataTable,
  DataTableRowActions,
  DATA_TABLE_COMPACT_CELL_CLASS,
  DATA_TABLE_HEAD_CLASS,
  DATA_TABLE_HEADER_ROW_CLASS,
  getDataTableRowClassName,
} from "@/components/data-table";
import { DeleteModal } from "@/components/DeleteModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { FormSheet } from "@/components/FormSheet";
import { DatePickerLabel } from "@/components/DatePickerLabel";
import { Button } from "@/components/ui/Button";
import { FileTextIcon } from "@/components/ui/FileText";
import { Label } from "@/components/ui/Label";
import { PlusIcon } from "@/components/ui/Plus";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
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
import { useButtonAnimatedIcon } from "@/hooks/use-button-animated-icon";
import { useCrudSheetState } from "@/hooks/use-crud-sheet-state";
import { useEmployeeExams } from "@/contexts/employee-exams.context";
import { cn } from "@/lib/utils";
import {
  buildEmployeeExamsFilterSummary,
  fetchEmployeeExamsForReport,
  generateEmployeeExamsReportPdf,
  resolveEmployeeExamsReportExamValueMode,
} from "@/pdf";
import type { EmployeeExamFormData } from "@/schemas/employee-exam.schema";
import {
  FILTER_FIELD_LABEL_CLASS,
  FILTER_FIELD_WRAPPER_CLASS,
  FILTER_GRID_CLASS,
  FILTER_GRID_ITEM_CLASS,
  FILTER_INPUT_CLASS,
  FILTER_SEARCHABLE_SELECT_CLASS,
  FILTER_SELECT_TRIGGER_CLASS,
} from "@/shared/constants/filter-field.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formatDateBr } from "@/shared/helpers/date.helper";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";
import { truncateText } from "@/shared/helpers/search-text.helper";
import type { IEmployeeExam } from "@/shared/interfaces/https/employee-exam";
import type { PaymentStatus } from "@/shared/types/payment-status.types";

const EMPLOYEE_EXAM_FORM_ID = "employee-exam-form";
const COMPANY_MAX_LENGTH = 22;
const ALL_PAYMENT_STATUS_FILTER_VALUE = "all";
const ALL_EXAMS_FILTER_VALUE = "all";

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const isPaid = status === "PAID";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
        isPaid
          ? "bg-emerald-100 text-emerald-800"
          : "bg-amber-100 text-amber-800"
      )}
    >
      {isPaid ? "Pago" : "Pendente"}
    </span>
  );
}

function PaymentStatusFilterSelect({
  value,
  onChange,
  disabled = false,
  className,
  id = "link-payment-status-filter",
}: {
  value: PaymentStatus | "";
  onChange: (value: PaymentStatus | "") => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}) {
  const items = useMemo(
    () => [
      { value: ALL_PAYMENT_STATUS_FILTER_VALUE, label: "Todos os status" },
      { value: "PENDING", label: "Pendente" },
      { value: "PAID", label: "Pago" },
    ],
    []
  );

  const selectValue = value || ALL_PAYMENT_STATUS_FILTER_VALUE;

  return (
    <div className={cn(FILTER_FIELD_WRAPPER_CLASS, className)}>
      <Label htmlFor={id} className={FILTER_FIELD_LABEL_CLASS}>
        Status
      </Label>
      <Select
        value={selectValue}
        onValueChange={(next) =>
          onChange(
            next === ALL_PAYMENT_STATUS_FILTER_VALUE || !next
              ? ""
              : (next as PaymentStatus)
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

function ExamCatalogFilterSelect({
  value,
  onChange,
  exams,
  disabled = false,
  className,
}: {
  value: string;
  onChange: (examId: string) => void;
  exams: { id: string; name: string }[];
  disabled?: boolean;
  className?: string;
}) {
  const items = useMemo(
    () => [
      { value: ALL_EXAMS_FILTER_VALUE, label: "Todos os exames" },
      ...exams.map((exam) => ({
        value: exam.id,
        label: exam.name,
      })),
    ],
    [exams]
  );

  const selectValue = value || ALL_EXAMS_FILTER_VALUE;

  return (
    <div className={cn(FILTER_FIELD_WRAPPER_CLASS, className)}>
      <Label htmlFor="link-exam-filter" className={FILTER_FIELD_LABEL_CLASS}>
        Exame
      </Label>
      <SearchableSelect
        id="link-exam-filter"
        value={selectValue}
        onValueChange={(next) =>
          onChange(next === ALL_EXAMS_FILTER_VALUE || !next ? "" : String(next))
        }
        options={items}
        placeholder="Todos os exames"
        searchPlaceholder="Buscar exame..."
        disabled={disabled}
        className={FILTER_SEARCHABLE_SELECT_CLASS}
      />
    </div>
  );
}

function LinkRow({
  link,
  rowIndex,
  onEdit,
  onDelete,
  isSelected,
  onToggleSelect,
}: {
  link: IEmployeeExam;
  rowIndex: number;
  onEdit: (link: IEmployeeExam) => void;
  onDelete: (link: IEmployeeExam) => void;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  return (
    <TableRow className={getDataTableRowClassName(rowIndex)}>
      <TableCell className={cn(DATA_TABLE_COMPACT_CELL_CLASS, "w-[44px]")}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect()}
          aria-label={`Selecionar vínculo de ${link.employee.name}`}
        />
      </TableCell>
      <TableCell className={DATA_TABLE_COMPACT_CELL_CLASS}>
        <PaymentStatusBadge status={link.paymentStatus ?? "PENDING"} />
      </TableCell>
      <TableCell
        className={cn(
          DATA_TABLE_COMPACT_CELL_CLASS,
          "whitespace-nowrap text-xs text-muted-foreground"
        )}
      >
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
      <TableCell
        className={cn(
          DATA_TABLE_COMPACT_CELL_CLASS,
          "hidden max-w-[160px] sm:table-cell"
        )}
      >
        <p className="truncate text-sm text-foreground" title={link.exam.name}>
          {link.exam.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(link.exam.price)}
        </p>
      </TableCell>
      <TableCell
        className={cn(
          DATA_TABLE_COMPACT_CELL_CLASS,
          "hidden whitespace-nowrap text-xs text-foreground md:table-cell"
        )}
      >
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

function EmployeeExamFormSheet({
  open,
  onOpenChange,
  link,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link?: IEmployeeExam | null;
}) {
  const { createLink, updateLink, isSubmitting, employees } = useEmployeeExams();
  const isEditing = !!link;

  const handleSubmit = async (data: EmployeeExamFormData) => {
    try {
      if (isEditing && link) {
        await updateLink(link.id, data);
        toast.success("Vínculo atualizado com sucesso.");
      } else {
        await createLink(data);
        const count = data.examIds.length;
        toast.success(
          count === 1
            ? "Vínculo cadastrado com sucesso."
            : `${count} vínculos cadastrados com sucesso.`
        );
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEditing
            ? "Não foi possível atualizar o vínculo."
            : "Não foi possível cadastrar o vínculo."
        )
      );
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar vínculo" : "Novo vínculo"}
      description={
        isEditing
          ? "Atualize funcionário, exame, profissional e data/hora."
          : "Vincule um funcionário a um ou mais exames do catálogo na mesma data e hora."
      }
      formId={EMPLOYEE_EXAM_FORM_ID}
      isSubmitting={isSubmitting}
      isSubmitDisabled={employees.length === 0}
      submitLabel={isEditing ? "Salvar alterações" : "Cadastrar vínculo(s)"}
    >
      <EmployeeExamForm
        key={link?.id ?? "new"}
        formId={EMPLOYEE_EXAM_FORM_ID}
        variant="sheet"
        defaultValues={link ?? undefined}
        employees={employees}
        isSubmitting={isSubmitting}
        submitLabel={isEditing ? "Salvar alterações" : "Cadastrar vínculo"}
        onSubmit={handleSubmit}
      />
    </FormSheet>
  );
}

export default function EmployeeExamsPage() {
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
    bulkPayLinks,
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

  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);
  const [bulkPaidAt, setBulkPaidAt] = useState("");
  const [isBulkPaying, setIsBulkPaying] = useState(false);
  const [isBulkPayModalOpen, setIsBulkPayModalOpen] = useState(false);

  const visibleIds = links.map((link) => link.id);
  const isAllSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedLinkIds.includes(id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLinkIds((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedLinkIds((prev) => [
        ...prev,
        ...visibleIds.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedLinkIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
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

      await generateEmployeeExamsReportPdf(reportLinks, {
        filterSummary,
        examValueMode: resolveEmployeeExamsReportExamValueMode(exportListParams),
        includeProfessionalColumn: Boolean(exportListParams.professionalName?.trim()),
      });
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

  const handleBulkPay = async () => {
    if (!selectedLinkIds.length) {
      toast.error("Selecione pelo menos um vínculo para marcar como pago.");
      return;
    }

    if (!bulkPaidAt) return;

    setIsBulkPaying(true);
    try {
      await bulkPayLinks(selectedLinkIds, bulkPaidAt);
      toast.success("Vínculos marcados como pagos com sucesso.");
      setSelectedLinkIds([]);
      setIsBulkPayModalOpen(false);
      setBulkPaidAt("");
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          "Não foi possível marcar os vínculos selecionados como pagos."
        )
      );
    } finally {
      setIsBulkPaying(false);
    }
  };

  return (
    <PageLayout
      title="Vínculos"
      description="Registre e consulte os exames realizados por cada funcionário."
    >
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
          {selectedLinkIds.length > 0 ? (
            <Button
              variant="outline"
              size="lg"
              className="rounded-md py-4.5"
              onClick={() => setIsBulkPayModalOpen(true)}
              disabled={isLoading || isSubmitting || isLoadingFilters}
            >
              Marcar como pagos
            </Button>
          ) : null}
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
              <ButtonAnimatedIcon
                icon={PlusIcon}
                iconRef={plusIconHeader.iconRef}
                size={16}
              />
              Novo vínculo
            </Button>
          </>
        }
        filters={
          <div className={FILTER_GRID_CLASS}>
            <div
              className={cn(FILTER_GRID_ITEM_CLASS, FILTER_FIELD_WRAPPER_CLASS)}
            >
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
                  onChange={(event) =>
                    setProfessionalNameFilter(event.target.value)
                  }
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
            <Button
              className="mt-1 rounded-md py-4.5"
              onClick={handleOpenCreate}
              {...plusIconEmpty.rowHandlers}
            >
              <ButtonAnimatedIcon
                icon={PlusIcon}
                iconRef={plusIconEmpty.iconRef}
                size={16}
              />
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
            <ConfirmModal
              open={isBulkPayModalOpen}
              onOpenChange={(open) => {
                setIsBulkPayModalOpen(open);
                if (!open) {
                  setBulkPaidAt("");
                }
              }}
              title="Marcar vínculos como pagos"
              description={
                <div className="mt-2 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Selecione a data de pagamento que será aplicada aos{" "}
                    <span className="font-semibold text-foreground">
                      {selectedLinkIds.length}
                    </span>{" "}
                    vínculo(s) selecionado(s).
                  </p>
                  <DatePickerLabel
                    id="bulk-link-paid-at"
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
                  <strong>{deletingLink?.exam.name}</strong>? Esta ação não pode
                  ser desfeita.
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
                <TableHead className={cn(DATA_TABLE_HEAD_CLASS, "px-3")}>
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleToggleSelectAll}
                    aria-label="Selecionar todos os vínculos visíveis"
                  />
                </TableHead>
                <TableHead
                  className={cn(
                    DATA_TABLE_COMPACT_CELL_CLASS,
                    "h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
                  )}
                >
                  Status
                </TableHead>
                <TableHead
                  className={cn(
                    DATA_TABLE_COMPACT_CELL_CLASS,
                    "h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
                  )}
                >
                  Pago em
                </TableHead>
                <TableHead
                  className={cn(
                    DATA_TABLE_COMPACT_CELL_CLASS,
                    "h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
                  )}
                >
                  Funcionário
                </TableHead>
                <TableHead
                  className={cn(
                    DATA_TABLE_COMPACT_CELL_CLASS,
                    "hidden h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:table-cell"
                  )}
                >
                  Exame
                </TableHead>
                <TableHead
                  className={cn(
                    DATA_TABLE_COMPACT_CELL_CLASS,
                    "hidden h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase md:table-cell"
                  )}
                >
                  Data
                </TableHead>
                <TableHead
                  className={cn(
                    DATA_TABLE_COMPACT_CELL_CLASS,
                    "hidden h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell"
                  )}
                >
                  Profissional
                </TableHead>
                <TableHead
                  className={cn(
                    DATA_TABLE_COMPACT_CELL_CLASS,
                    "hidden h-9 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase xl:table-cell"
                  )}
                >
                  Lucro
                </TableHead>
                <TableHead
                  className={cn(
                    DATA_TABLE_COMPACT_CELL_CLASS,
                    "h-9 w-[88px] text-right text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
                  )}
                >
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
                  isSelected={selectedLinkIds.includes(link.id)}
                  onToggleSelect={() => handleToggleSelectOne(link.id)}
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

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AsoForm } from "@/components/Forms/AsoForm";
import { ButtonAnimatedIcon } from "@/components/ButtonAnimatedIcon";
import { DatePickerLabel } from "@/components/DatePickerLabel";
import { EmployeeFilterSelect } from "@/components/EmployeeFilterSelect";
import {
  DataTable,
  DataTableRowActions,
  DATA_TABLE_CELL_CLASS,
  DATA_TABLE_HEAD_CLASS,
  DATA_TABLE_HEADER_ROW_CLASS,
  getDataTableRowClassName,
} from "@/components/data-table";
import { DeleteModal } from "@/components/DeleteModal";
import { FormSheet } from "@/components/FormSheet";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { PlusIcon } from "@/components/ui/Plus";
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
import { useAsos } from "@/contexts/asos.context";
import { useButtonAnimatedIcon } from "@/hooks/use-button-animated-icon";
import { useCrudSheetState } from "@/hooks/use-crud-sheet-state";
import { cn } from "@/lib/utils";
import { generateAsoPdf } from "@/pdf/generate-aso-pdf";
import type { AsoFormData } from "@/schemas/aso.schema";
import {
  FILTER_FIELD_LABEL_CLASS,
  FILTER_FIELD_WRAPPER_CLASS,
  FILTER_GRID_CLASS,
  FILTER_GRID_ITEM_CLASS,
  FILTER_SELECT_TRIGGER_CLASS,
} from "@/shared/constants/filter-field.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formatDateBr } from "@/shared/helpers/date.helper";
import { truncateText } from "@/shared/helpers/truncate-text.helper";
import type { IAso } from "@/shared/interfaces/https/aso";
import {
  ASO_TYPE_LABELS,
  type AsoType,
} from "@/shared/interfaces/https/aso";

const ASO_FORM_ID = "aso-form";
const COMPANY_MAX_LENGTH = 22;
const ALL_ASO_TYPE_FILTER_VALUE = "all";

const TYPE_BADGE_STYLES: Record<AsoType, string> = {
  ADMISSIONAL: "bg-emerald-100 text-emerald-800",
  PERIODICO: "bg-sky-100 text-sky-800",
  RETORNO_AO_TRABALHO: "bg-amber-100 text-amber-900",
  MUDANCA_DE_RISCO: "bg-violet-100 text-violet-800",
  MONITORACAO_PONTUAL: "bg-orange-100 text-orange-800",
  DEMISSIONAL: "bg-red-100 text-red-800",
};

function formatItemsSummary(items: { name?: string; description?: string }[]) {
  if (items.length === 0) return "—";

  const first = items[0].name ?? items[0].description ?? "";
  if (items.length === 1) {
    return truncateText(first, 28);
  }

  return `${truncateText(first, 20)} +${items.length - 1}`;
}

function AsoTypeBadge({ type }: { type: AsoType }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
        TYPE_BADGE_STYLES[type]
      )}
    >
      {ASO_TYPE_LABELS[type]}
    </span>
  );
}

function AsoTypeFilterSelect({
  value,
  onChange,
  disabled = false,
  className,
}: {
  value: AsoType | "";
  onChange: (value: AsoType | "") => void;
  disabled?: boolean;
  className?: string;
}) {
  const items = useMemo(
    () => [
      { value: ALL_ASO_TYPE_FILTER_VALUE, label: "Todos os tipos" },
      ...(Object.entries(ASO_TYPE_LABELS) as [AsoType, string][]).map(
        ([type, label]) => ({ value: type, label })
      ),
    ],
    []
  );

  const selectValue = value || ALL_ASO_TYPE_FILTER_VALUE;

  return (
    <div className={cn(FILTER_FIELD_WRAPPER_CLASS, className)}>
      <Label htmlFor="aso-type-filter" className={FILTER_FIELD_LABEL_CLASS}>
        Tipo de ASO
      </Label>
      <Select
        value={selectValue}
        onValueChange={(next) =>
          onChange(
            next === ALL_ASO_TYPE_FILTER_VALUE || !next
              ? ""
              : (next as AsoType)
          )
        }
        items={items}
        disabled={disabled}
      >
        <SelectTrigger id="aso-type-filter" className={FILTER_SELECT_TRIGGER_CLASS}>
          <SelectValue placeholder="Todos os tipos" className="truncate" />
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

function AsoFormSheet({
  open,
  onOpenChange,
  aso,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aso?: IAso | null;
}) {
  const {
    createAso,
    updateAso,
    isSubmitting,
    employees,
    occupationalRisks,
  } = useAsos();
  const isEditing = !!aso;

  const handleSubmit = async (data: AsoFormData) => {
    try {
      if (isEditing && aso) {
        await updateAso(aso.id, data);
        toast.success("ASO atualizado com sucesso.");
      } else {
        await createAso(data);
        toast.success("ASO emitido com sucesso.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEditing
            ? "Não foi possível atualizar o ASO."
            : "Não foi possível emitir o ASO."
        )
      );
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar ASO" : "Emitir ASO"}
      description={
        isEditing
          ? "Atualize os dados do atestado de saúde ocupacional selecionado."
          : "Preencha os campos para emitir um novo atestado de saúde ocupacional."
      }
      formId={ASO_FORM_ID}
      isSubmitting={isSubmitting}
      isSubmitDisabled={employees.length === 0}
      submitLabel={isEditing ? "Salvar alterações" : "Emitir ASO"}
    >
      <AsoForm
        key={aso?.id ?? "new"}
        formId={ASO_FORM_ID}
        variant="sheet"
        defaultValues={aso ?? undefined}
        employees={employees}
        occupationalRisks={occupationalRisks}
        isSubmitting={isSubmitting}
        submitLabel={isEditing ? "Salvar alterações" : "Emitir ASO"}
        onSubmit={handleSubmit}
      />
    </FormSheet>
  );
}

export default function AsosPage() {
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
      await generateAsoPdf(aso, employees);
      toast.success("ASO baixado com sucesso.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível gerar o PDF do ASO."));
    } finally {
      setDownloadingAsoId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-1 text-3xl font-bold tracking-tight text-foreground">
          Emissão de ASO
          <span className="text-primary">.</span>
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Emita, edite e exclua atestados de saúde ocupacional com exames e
          riscos associados.
        </p>
      </header>

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
          description:
            "Comece emitindo o primeiro atestado de saúde ocupacional.",
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
                  {deletingAso ? formatDateBr(deletingAso.date) : ""})? Esta
                  ação não pode ser desfeita.
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
                <TableHead className={DATA_TABLE_HEAD_CLASS}>
                  Funcionário
                </TableHead>
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
                <TableRow
                  key={aso.id}
                  className={getDataTableRowClassName(index)}
                >
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
                  <TableCell
                    className={cn(DATA_TABLE_CELL_CLASS, "max-w-[160px]")}
                  >
                    <p className="truncate text-sm font-medium text-foreground">
                      {aso.employee.name}
                    </p>
                    <p
                      className="truncate text-xs text-muted-foreground"
                      title={aso.employee.company.name}
                    >
                      {truncateText(
                        aso.employee.company.name,
                        COMPANY_MAX_LENGTH
                      )}
                    </p>
                  </TableCell>
                  <TableCell
                    className={cn(
                      DATA_TABLE_CELL_CLASS,
                      "hidden max-w-[140px] sm:table-cell"
                    )}
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
                    className={cn(
                      DATA_TABLE_CELL_CLASS,
                      "hidden max-w-[140px] md:table-cell"
                    )}
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
                      onEdit={() => handleOpenEdit(aso)}
                      onDelete={() => setDeletingAso(aso)}
                      onDownload={() => handleDownload(aso)}
                      isDownloading={downloadingAsoId === aso.id}
                      showDownload
                    />
                  </TableCell>
                </TableRow>
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
    </div>
  );
}

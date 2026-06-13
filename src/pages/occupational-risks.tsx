import { Search } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { useMemo } from "react";
import { toast } from "sonner";
import { OccupationalRiskForm } from "@/components/Forms/OccupationalRiskForm";
import { ButtonAnimatedIcon } from "@/components/ButtonAnimatedIcon";
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
import { useOccupationalRisks } from "@/contexts/occupational-risks.context";
import { useButtonAnimatedIcon } from "@/hooks/use-button-animated-icon";
import { useCrudSheetState } from "@/hooks/use-crud-sheet-state";
import { cn } from "@/lib/utils";
import type { OccupationalRiskFormData } from "@/schemas/occupational-risk.schema";
import {
  FILTER_FIELD_LABEL_CLASS,
  FILTER_FIELD_WRAPPER_CLASS,
  FILTER_GRID_CLASS,
  FILTER_GRID_ITEM_CLASS,
  FILTER_INPUT_CLASS,
  FILTER_SELECT_TRIGGER_CLASS,
} from "@/shared/constants/filter-field.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import type { IOccupationalRisk } from "@/shared/interfaces/https/occupational-risk";
import {
  OCCUPATIONAL_RISK_CATEGORY_LABELS,
  type OccupationalRiskCategory,
} from "@/shared/types/occupational-risk-category.types";

const OCCUPATIONAL_RISK_FORM_ID = "occupational-risk-form";
const ALL_OCCUPATIONAL_RISK_CATEGORY_FILTER_VALUE = "all";

const CATEGORY_STYLES: Record<OccupationalRiskCategory, string> = {
  FISICOS: "bg-sky-100 text-sky-800",
  QUIMICOS: "bg-violet-100 text-violet-800",
  BIOLOGICOS: "bg-lime-100 text-lime-900",
  ERGONOMICOS: "bg-orange-100 text-orange-800",
  ACIDENTES: "bg-red-100 text-red-800",
};

function OccupationalRiskCategoryBadge({
  category,
}: {
  category: OccupationalRiskCategory;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
        CATEGORY_STYLES[category]
      )}
    >
      {OCCUPATIONAL_RISK_CATEGORY_LABELS[category]}
    </span>
  );
}

function OccupationalRiskCategoryFilterSelect({
  value,
  onChange,
  disabled = false,
  className,
  id = "occupational-risk-category-filter",
}: {
  value: OccupationalRiskCategory | "";
  onChange: (value: OccupationalRiskCategory | "") => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}) {
  const items = useMemo(
    () => [
      {
        value: ALL_OCCUPATIONAL_RISK_CATEGORY_FILTER_VALUE,
        label: "Todas as categorias",
      },
      ...(
        Object.entries(OCCUPATIONAL_RISK_CATEGORY_LABELS) as [
          OccupationalRiskCategory,
          string,
        ][]
      ).map(([category, label]) => ({
        value: category,
        label,
      })),
    ],
    []
  );

  const selectValue = value || ALL_OCCUPATIONAL_RISK_CATEGORY_FILTER_VALUE;

  return (
    <div className={cn(FILTER_FIELD_WRAPPER_CLASS, className)}>
      <Label htmlFor={id} className={FILTER_FIELD_LABEL_CLASS}>
        Categoria
      </Label>
      <Select
        value={selectValue}
        onValueChange={(next) =>
          onChange(
            next === ALL_OCCUPATIONAL_RISK_CATEGORY_FILTER_VALUE || !next
              ? ""
              : (next as OccupationalRiskCategory)
          )
        }
        items={items}
        disabled={disabled}
      >
        <SelectTrigger id={id} className={FILTER_SELECT_TRIGGER_CLASS}>
          <SelectValue placeholder="Todas as categorias" className="truncate" />
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

function RiskRow({
  risk,
  rowIndex,
  onEdit,
  onDelete,
}: {
  risk: IOccupationalRisk;
  rowIndex: number;
  onEdit: (risk: IOccupationalRisk) => void;
  onDelete: (risk: IOccupationalRisk) => void;
}) {
  return (
    <TableRow className={getDataTableRowClassName(rowIndex)}>
      <TableCell className={DATA_TABLE_CELL_CLASS}>
        <OccupationalRiskCategoryBadge category={risk.category} />
      </TableCell>
      <TableCell className={DATA_TABLE_CELL_CLASS}>
        <p className="line-clamp-2 font-medium text-foreground">
          {risk.description}
        </p>
      </TableCell>
      <TableCell className={cn(DATA_TABLE_CELL_CLASS, "w-[88px]")}>
        <DataTableRowActions
          editLabel="Editar risco"
          deleteLabel="Excluir risco"
          onEdit={() => onEdit(risk)}
          onDelete={() => onDelete(risk)}
        />
      </TableCell>
    </TableRow>
  );
}

function OccupationalRiskFormSheet({
  open,
  onOpenChange,
  risk,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk?: IOccupationalRisk | null;
}) {
  const { createRisk, updateRisk, isSubmitting } = useOccupationalRisks();
  const isEditing = !!risk;

  const handleSubmit = async (data: OccupationalRiskFormData) => {
    try {
      if (isEditing && risk) {
        await updateRisk(risk.id, data);
        toast.success("Risco ocupacional atualizado com sucesso.");
      } else {
        await createRisk(data);
        toast.success("Risco ocupacional cadastrado com sucesso.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEditing
            ? "Não foi possível atualizar o risco ocupacional."
            : "Não foi possível cadastrar o risco ocupacional."
        )
      );
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar risco ocupacional" : "Novo risco ocupacional"}
      description={
        isEditing
          ? "Atualize a categoria e a descrição do risco selecionado."
          : "Preencha os campos para cadastrar um novo risco ocupacional."
      }
      formId={OCCUPATIONAL_RISK_FORM_ID}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? "Salvar alterações" : "Cadastrar risco"}
    >
      <OccupationalRiskForm
        key={risk?.id ?? "new"}
        formId={OCCUPATIONAL_RISK_FORM_ID}
        variant="sheet"
        defaultValues={risk ?? undefined}
        isSubmitting={isSubmitting}
        submitLabel={isEditing ? "Salvar alterações" : "Cadastrar risco"}
        onSubmit={handleSubmit}
      />
    </FormSheet>
  );
}

export default function OccupationalRisksPage() {
  const {
    risks,
    meta,
    isLoading,
    isSubmitting,
    error,
    refetch,
    deleteRisk,
    categoryFilter,
    setCategoryFilter,
    descriptionFilter,
    setDescriptionFilter,
    setPage,
  } = useOccupationalRisks();
  const {
    formOpen,
    editingItem: editingRisk,
    deletingItem: deletingRisk,
    setDeletingItem: setDeletingRisk,
    openCreate,
    openEdit,
    handleFormOpenChange,
  } = useCrudSheetState<IOccupationalRisk>();
  const plusIconHeader = useButtonAnimatedIcon();
  const plusIconEmpty = useButtonAnimatedIcon();

  const totalCount = meta?.total ?? 0;
  const hasActiveFilters =
    categoryFilter.length > 0 || descriptionFilter.trim().length > 0;
  const isEmptyList = !isLoading && !error && risks.length === 0;

  const handleDelete = async () => {
    if (!deletingRisk) return;

    try {
      await deleteRisk(deletingRisk.id);
      toast.success("Risco ocupacional excluído com sucesso.");
      setDeletingRisk(null);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Não foi possível excluir o risco ocupacional.")
      );
    }
  };

  return (
    <PageLayout
      title="Riscos Ocupacionais"
      description="Liste, cadastre, edite e exclua riscos ocupacionais por categoria e descrição."
    >
      <DataTable
        title="Riscos ocupacionais"
        description={
          <>
            Cadastre e gerencie riscos por categoria e descrição.
            {!isLoading && !error && meta ? (
              <>
                {" "}
                <span className="font-medium text-foreground/70">
                  · {totalCount} {totalCount === 1 ? "risco" : "riscos"}
                </span>
              </>
            ) : null}
          </>
        }
        headerActions={
          <Button
            className="rounded-md py-4.5"
            size="lg"
            onClick={openCreate}
            {...plusIconHeader.rowHandlers}
          >
            <ButtonAnimatedIcon icon={PlusIcon} iconRef={plusIconHeader.iconRef} size={16} />
            Novo risco
          </Button>
        }
        filters={
          <div className={FILTER_GRID_CLASS}>
            <OccupationalRiskCategoryFilterSelect
              className={FILTER_GRID_ITEM_CLASS}
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
            <div className={cn(FILTER_GRID_ITEM_CLASS, FILTER_FIELD_WRAPPER_CLASS)}>
              <label
                htmlFor="occupational-risk-description-filter"
                className={FILTER_FIELD_LABEL_CLASS}
              >
                Descrição
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="occupational-risk-description-filter"
                  type="search"
                  placeholder="Buscar por descrição..."
                  value={descriptionFilter}
                  onChange={(event) => setDescriptionFilter(event.target.value)}
                  className={FILTER_INPUT_CLASS}
                />
              </div>
            </div>
          </div>
        }
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        isEmpty={isEmptyList}
        hasActiveFilters={hasActiveFilters}
        emptyState={{
          title: "Nenhum risco cadastrado",
          description: "Comece registrando o primeiro risco ocupacional.",
          action: (
            <Button className="mt-1 rounded-md py-4.5" onClick={openCreate} {...plusIconEmpty.rowHandlers}>
              <ButtonAnimatedIcon icon={PlusIcon} iconRef={plusIconEmpty.iconRef} size={16} />
              Novo risco
            </Button>
          ),
        }}
        filteredEmptyState={{
          title: "Nenhum risco encontrado",
          description: "Ajuste os filtros e tente novamente.",
        }}
        skeletonColumns={3}
        overlays={
          <>
            <OccupationalRiskFormSheet
              open={formOpen}
              onOpenChange={handleFormOpenChange}
              risk={editingRisk}
            />
            <DeleteModal
              open={!!deletingRisk}
              onOpenChange={(open) => {
                if (!open) setDeletingRisk(null);
              }}
              title="Excluir risco ocupacional"
              description={
                <>
                  Tem certeza que deseja excluir o risco{" "}
                  <strong>{deletingRisk?.description}</strong>? Esta ação não pode
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
                <TableHead className={DATA_TABLE_HEAD_CLASS}>Categoria</TableHead>
                <TableHead className={DATA_TABLE_HEAD_CLASS}>Descrição</TableHead>
                <TableHead className={`text-right ${DATA_TABLE_HEAD_CLASS}`}>
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.map((risk, index) => (
                <RiskRow
                  key={risk.id}
                  rowIndex={index}
                  risk={risk}
                  onEdit={openEdit}
                  onDelete={setDeletingRisk}
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

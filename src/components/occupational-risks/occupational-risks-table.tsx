import { Search } from "lucide-react";
import { toast } from "sonner";
import { ButtonAnimatedIcon } from "@/components/button-animated-icon";
import {
  DataTable,
  DataTableRowActions,
  DATA_TABLE_CELL_CLASS,
  DATA_TABLE_HEAD_CLASS,
  DATA_TABLE_HEADER_ROW_CLASS,
  getDataTableRowClassName,
} from "@/components/data-table";
import { DeleteModal } from "@/components/delete-modal";
import { OccupationalRiskCategoryBadge } from "@/components/occupational-risks/occupational-risk-category-badge";
import { OccupationalRiskCategoryFilterSelect } from "@/components/occupational-risks/occupational-risk-category-filter-select";
import { OccupationalRiskFormSheet } from "@/components/occupational-risks/occupational-risk-form-sheet";
import { Button } from "@/components/ui/button";
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
import { useOccupationalRisks } from "@/contexts/occupational-risks.context";
import { cn } from "@/lib/utils";
import {
  FILTER_FIELD_LABEL_CLASS,
  FILTER_FIELD_WRAPPER_CLASS,
  FILTER_GRID_CLASS,
  FILTER_GRID_ITEM_CLASS,
  FILTER_INPUT_CLASS,
} from "@/shared/constants/filter-field.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import type { IOccupationalRisk } from "@/shared/interfaces/https/occupational-risk";

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

export function OccupationalRisksTable() {
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
  );
}

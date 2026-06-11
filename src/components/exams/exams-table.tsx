import { Search } from "lucide-react";
import { toast } from "sonner";
import { ButtonAnimatedIcon } from "@/components/button-animated-icon";
import { CompanyFilterSelect } from "@/components/exams/company-filter-select";
import { ExamFormSheet } from "@/components/exams/exam-form-sheet";
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
import { useExams } from "@/contexts/exams.context";
import { cn } from "@/lib/utils";
import {
  FILTER_FIELD_LABEL_CLASS,
  FILTER_FIELD_WRAPPER_CLASS,
  FILTER_INPUT_CLASS,
} from "@/shared/constants/filter-field.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";
import type { IExam } from "@/shared/interfaces/https/exam";

function ExamRow({
  exam,
  rowIndex,
  onEdit,
  onDelete,
}: {
  exam: IExam;
  rowIndex: number;
  onEdit: (exam: IExam) => void;
  onDelete: (exam: IExam) => void;
}) {
  return (
    <TableRow className={getDataTableRowClassName(rowIndex)}>
      <TableCell className={DATA_TABLE_CELL_CLASS}>
        <p className="truncate font-medium text-foreground">{exam.name}</p>
      </TableCell>
      <TableCell className="hidden text-sm text-muted-foreground md:table-cell px-5 py-4">
        {exam.company.name}
      </TableCell>
      <TableCell className="hidden text-sm font-medium text-foreground lg:table-cell px-5 py-4">
        {formatCurrency(exam.price)}
      </TableCell>
      <TableCell className="hidden text-sm text-muted-foreground xl:table-cell px-5 py-4">
        {formatCurrency(exam.cost)}
      </TableCell>
      <TableCell
        className={cn(
          "hidden text-sm font-medium 2xl:table-cell px-5 py-4",
          exam.profit >= 0 ? "text-primary" : "text-destructive"
        )}
      >
        {formatCurrency(exam.profit)}
      </TableCell>
      <TableCell className="hidden max-w-[200px] truncate text-sm text-muted-foreground 2xl:table-cell px-5 py-4">
        {exam.notes || "—"}
      </TableCell>
      <TableCell className={DATA_TABLE_CELL_CLASS}>
        <DataTableRowActions
          editLabel={`Editar ${exam.name}`}
          deleteLabel={`Excluir ${exam.name}`}
          onEdit={() => onEdit(exam)}
          onDelete={() => onDelete(exam)}
        />
      </TableCell>
    </TableRow>
  );
}

export function ExamsTable() {
  const {
    exams,
    meta,
    isLoading,
    error,
    refetch,
    deleteExam,
    isSubmitting,
    nameFilter,
    companyIdFilter,
    companies,
    isLoadingFilters,
    setNameFilter,
    setCompanyIdFilter,
    setPage,
  } = useExams();

  const {
    formOpen,
    editingItem: editingExam,
    deletingItem: deletingExam,
    setDeletingItem: setDeletingExam,
    openCreate,
    openEdit,
    handleFormOpenChange,
  } = useCrudSheetState<IExam>();
  const plusIconHeader = useButtonAnimatedIcon();
  const plusIconEmpty = useButtonAnimatedIcon();

  const totalCount = meta?.total ?? 0;
  const hasActiveFilters =
    nameFilter.trim().length > 0 || companyIdFilter.length > 0;
  const isEmptyList = !isLoading && !error && exams.length === 0;
  const canCreate = companies.length > 0;

  const handleDelete = async () => {
    if (!deletingExam) return;

    try {
      await deleteExam(deletingExam.id);
      toast.success("Exame excluído com sucesso.");
      setDeletingExam(null);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Não foi possível excluir o exame.")
      );
    }
  };

  return (
    <DataTable
      title="Exames"
      description={
        <>
          Exames por empresa, com preços e custos próprios.
          {!isLoading && !error && meta ? (
            <>
              {" "}
              <span className="font-medium text-foreground/70">
                · {totalCount} {totalCount === 1 ? "exame" : "exames"}
              </span>
            </>
          ) : null}
        </>
      }
      headerActions={
        <Button
          className="shrink-0 rounded-md py-4.5"
          size="lg"
          onClick={openCreate}
          disabled={isLoading || !canCreate}
          {...plusIconHeader.rowHandlers}
        >
          <ButtonAnimatedIcon icon={PlusIcon} iconRef={plusIconHeader.iconRef} size={16} />
          Novo exame
        </Button>
      }
      filters={
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <CompanyFilterSelect
            className="lg:w-64 lg:shrink-0"
            value={companyIdFilter}
            onChange={setCompanyIdFilter}
            companies={companies}
            disabled={isLoadingFilters}
          />
          <div className={cn(FILTER_FIELD_WRAPPER_CLASS, "min-w-0 flex-1")}>
            <label htmlFor="exam-name-filter" className={FILTER_FIELD_LABEL_CLASS}>
              Buscar exame
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="exam-name-filter"
                type="search"
                placeholder="Nome do exame..."
                value={nameFilter}
                onChange={(event) => setNameFilter(event.target.value)}
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
        title: "Nenhum exame cadastrado",
        description:
          companies.length === 0
            ? "Cadastre uma empresa antes de incluir exames."
            : "Comece adicionando o primeiro exame.",
        action: canCreate ? (
          <Button className="mt-1 rounded-md py-4.5" onClick={openCreate} {...plusIconEmpty.rowHandlers}>
            <ButtonAnimatedIcon icon={PlusIcon} iconRef={plusIconEmpty.iconRef} size={16} />
            Novo exame
          </Button>
        ) : undefined,
      }}
      filteredEmptyState={{
        title: "Nenhum exame encontrado",
        description: "Ajuste o filtro de busca e tente novamente.",
      }}
      skeletonColumns={4}
      overlays={
        <>
          <ExamFormSheet
            open={formOpen}
            onOpenChange={handleFormOpenChange}
            exam={editingExam}
          />
          <DeleteModal
            open={!!deletingExam}
            onOpenChange={(open) => {
              if (!open) setDeletingExam(null);
            }}
            title="Excluir exame"
            description={
              <>
                Tem certeza que deseja excluir{" "}
                <strong>{deletingExam?.name}</strong>? Esta ação não pode ser
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
              <TableHead className={DATA_TABLE_HEAD_CLASS}>Exame</TableHead>
              <TableHead className={`hidden md:table-cell ${DATA_TABLE_HEAD_CLASS}`}>Empresa</TableHead>
              <TableHead className={`hidden lg:table-cell ${DATA_TABLE_HEAD_CLASS}`}>Preço</TableHead>
              <TableHead className={`hidden xl:table-cell ${DATA_TABLE_HEAD_CLASS}`}>Custo</TableHead>
              <TableHead className={`hidden 2xl:table-cell ${DATA_TABLE_HEAD_CLASS}`}>Lucro</TableHead>
              <TableHead className={`hidden 2xl:table-cell ${DATA_TABLE_HEAD_CLASS}`}>Observações</TableHead>
              <TableHead className={`text-right ${DATA_TABLE_HEAD_CLASS}`}>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam, index) => (
              <ExamRow
                key={exam.id}
                rowIndex={index}
                exam={exam}
                onEdit={openEdit}
                onDelete={setDeletingExam}
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

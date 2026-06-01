import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ButtonAnimatedIcon } from "@/components/button-animated-icon";
import { CompanyFilterSelect } from "@/components/exams/company-filter-select";
import { ExamFormSheet } from "@/components/exams/exam-form-sheet";
import { DeleteModal } from "@/components/delete-modal";
import { Button } from "@/components/ui/button";
import { DeleteIcon } from "@/components/ui/delete";
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
import { useExams } from "@/contexts/exams-context";
import { cn } from "@/lib/utils";
import { TABLE_PAGE_SIZE } from "@/shared/constants/app.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";
import type { IExam } from "@/shared/interfaces/https/exam";

function ExamsTableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: TABLE_PAGE_SIZE }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 px-5 py-4"
        >
          <div className="h-4 w-40 flex-1 rounded-md bg-muted" />
          <div className="hidden h-4 w-32 rounded-md bg-muted md:block" />
          <div className="hidden h-4 w-20 rounded-md bg-muted lg:block" />
          <div className="h-8 w-16 rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}

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
      <TableCell className="px-5 py-4">
        <p className="truncate font-medium text-foreground">{exam.name}</p>
      </TableCell>
      <TableCell className="hidden px-5 py-4 text-sm text-muted-foreground md:table-cell">
        {exam.company.name}
      </TableCell>
      <TableCell className="hidden px-5 py-4 text-sm font-medium text-foreground lg:table-cell">
        {formatCurrency(exam.price)}
      </TableCell>
      <TableCell className="hidden px-5 py-4 text-sm text-muted-foreground xl:table-cell">
        {formatCurrency(exam.cost)}
      </TableCell>
      <TableCell
        className={cn(
          "hidden px-5 py-4 text-sm font-medium 2xl:table-cell",
          exam.profit >= 0 ? "text-primary" : "text-destructive"
        )}
      >
        {formatCurrency(exam.profit)}
      </TableCell>
      <TableCell className="hidden max-w-[200px] truncate px-5 py-4 text-sm text-muted-foreground 2xl:table-cell">
        {exam.notes || "—"}
      </TableCell>
      <TableCell className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon-lg"
            className="rounded-md bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
            aria-label={`Editar ${exam.name}`}
            onClick={() => onEdit(exam)}
            {...editIcon.rowHandlers}
          >
            <ButtonAnimatedIcon
              icon={SquarePenIcon}
              iconRef={editIcon.iconRef}
              size={16}
              className="text-primary"
            />
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            className="rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
            aria-label={`Excluir ${exam.name}`}
            onClick={() => onDelete(exam)}
            {...deleteIcon.rowHandlers}
          >
            <ButtonAnimatedIcon
              icon={DeleteIcon}
              iconRef={deleteIcon.iconRef}
              size={16}
              className="text-destructive"
            />
          </Button>
        </div>
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

  const [formOpen, setFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<IExam | null>(null);
  const [deletingExam, setDeletingExam] = useState<IExam | null>(null);
  const plusIconHeader = useButtonAnimatedIcon();
  const plusIconEmpty = useButtonAnimatedIcon();

  const totalCount = meta?.total ?? 0;
  const hasActiveFilters =
    nameFilter.trim().length > 0 || companyIdFilter.length > 0;
  const isEmptyList = !isLoading && !error && exams.length === 0;
  const canCreate = companies.length > 0;

  const openCreate = () => {
    setEditingExam(null);
    setFormOpen(true);
  };

  const openEdit = (exam: IExam) => {
    setEditingExam(exam);
    setFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingExam(null);
    }
  };

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
    <>
      <Card className="gap-0 overflow-hidden rounded-sm border border-border bg-white py-0 shadow-sm ring-0">
        <div className="flex flex-col gap-4 border-b border-border bg-muted/20 px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Exames</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Exames por empresa, com preços e custos próprios.
                {!isLoading && !error && meta && (
                  <>
                    {" "}
                    <span className="font-medium text-foreground/70">
                      · {totalCount}{" "}
                      {totalCount === 1 ? "exame" : "exames"}
                    </span>
                  </>
                )}
              </p>
            </div>
            <Button
              className="shrink-0 rounded-md py-4.5"
              size="lg"
              onClick={openCreate}
              disabled={isLoading || !canCreate}
              {...plusIconHeader.rowHandlers}
            >
              <ButtonAnimatedIcon
                icon={PlusIcon}
                iconRef={plusIconHeader.iconRef}
                size={16}
              />
              Novo exame
            </Button>
          </div>

          <div className="flex flex-col gap-2.5 lg:flex-row">
            <CompanyFilterSelect
              className="lg:w-72 lg:shrink-0"
              value={companyIdFilter}
              onChange={setCompanyIdFilter}
              companies={companies}
              disabled={isLoadingFilters}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <label
                htmlFor="exam-name-filter"
                className="text-sm font-medium text-foreground"
              >
                Buscar exame
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="exam-name-filter"
                  type="search"
                  placeholder="Nome do exame..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="h-11 rounded-md pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {isLoading && <ExamsTableSkeleton />}

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
                Nenhum exame cadastrado
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {companies.length === 0
                  ? "Cadastre uma empresa antes de incluir exames."
                  : "Comece adicionando o primeiro exame."}
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
                Novo exame
              </Button>
            )}
          </div>
        )}

        {isEmptyList && hasActiveFilters && (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <p className="font-medium text-foreground">
              Nenhum exame encontrado
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Ajuste o filtro de busca e tente novamente.
            </p>
          </div>
        )}

        {!isLoading && !error && exams.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-border/80 bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Exame
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase md:table-cell">
                    Empresa
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell">
                    Preço
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase xl:table-cell">
                    Custo
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase 2xl:table-cell">
                    Lucro
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase 2xl:table-cell">
                    Observações
                  </TableHead>
                  <TableHead className="h-11 px-5 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Ações
                  </TableHead>
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
  );
}

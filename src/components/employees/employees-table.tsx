import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ButtonAnimatedIcon } from "@/components/button-animated-icon";
import { CompanyFilterSelect } from "@/components/exams/company-filter-select";
import { EmployeeFormSheet } from "@/components/employees/employee-form-sheet";
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
import { useEmployees } from "@/contexts/employees.context";
import { cn } from "@/lib/utils";
import { TABLE_PAGE_SIZE } from "@/shared/constants/app.constants";
import {
  FILTER_FIELD_LABEL_CLASS,
  FILTER_FIELD_WRAPPER_CLASS,
  FILTER_INPUT_CLASS,
} from "@/shared/constants/filter-field.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formatCpf } from "@/shared/helpers/cpf.helper";
import { formatAgeFromBirthDate, formatDateBr } from "@/shared/helpers/date.helper";
import type { IEmployee } from "@/shared/interfaces/https/employee";

function EmployeesTableSkeleton() {
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

function EmployeeRow({
  employee,
  rowIndex,
  onEdit,
  onDelete,
}: {
  employee: IEmployee;
  rowIndex: number;
  onEdit: (employee: IEmployee) => void;
  onDelete: (employee: IEmployee) => void;
}) {
  const editIcon = useButtonAnimatedIcon();
  const deleteIcon = useButtonAnimatedIcon();
  const isEven = rowIndex % 2 === 0;
  const ageLabel = formatAgeFromBirthDate(employee.birthDate);

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
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
            employee.active
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {employee.active ? "Ativo" : "Inativo"}
        </span>
      </TableCell>
      <TableCell className="px-5 py-4">
        <p className="truncate font-medium text-foreground">{employee.name}</p>
      </TableCell>
      <TableCell className="hidden px-5 py-4 text-sm text-muted-foreground md:table-cell">
        {formatCpf(employee.documentNumber)}
      </TableCell>
      <TableCell className="hidden px-5 py-4 text-sm text-muted-foreground lg:table-cell">
        {employee.company.name}
      </TableCell>
      <TableCell className="hidden px-5 py-4 text-sm text-muted-foreground xl:table-cell">
        {employee.jobTitle || "—"}
      </TableCell>
      <TableCell className="hidden px-5 py-4 text-sm text-foreground 2xl:table-cell">
        {formatDateBr(employee.birthDate)}
      </TableCell>
      <TableCell className="hidden px-5 py-4 text-sm text-muted-foreground 2xl:table-cell">
        {ageLabel ?? "—"}
      </TableCell>
      <TableCell className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon-lg"
            className="rounded-md bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
            aria-label={`Editar ${employee.name}`}
            onClick={() => onEdit(employee)}
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
            aria-label={`Excluir ${employee.name}`}
            onClick={() => onDelete(employee)}
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

export function EmployeesTable() {
  const {
    employees,
    meta,
    companies,
    isLoading,
    isLoadingFilters,
    error,
    refetch,
    deleteEmployee,
    isSubmitting,
    companyIdFilter,
    setCompanyIdFilter,
    nameFilter,
    setNameFilter,
    setPage,
  } = useEmployees();

  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<IEmployee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<IEmployee | null>(
    null
  );
  const plusIconHeader = useButtonAnimatedIcon();
  const plusIconEmpty = useButtonAnimatedIcon();

  const totalCount = meta?.total ?? 0;
  const hasActiveFilters =
    nameFilter.trim().length > 0 || companyIdFilter.length > 0;
  const isEmptyList = !isLoading && !error && employees.length === 0;
  const canCreate = companies.length > 0;

  const openCreate = () => {
    setEditingEmployee(null);
    setFormOpen(true);
  };

  const openEdit = (employee: IEmployee) => {
    setEditingEmployee(employee);
    setFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingEmployee(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingEmployee) return;

    try {
      await deleteEmployee(deletingEmployee.id);
      toast.success("Funcionário excluído com sucesso.");
      setDeletingEmployee(null);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Não foi possível excluir o funcionário.")
      );
    }
  };

  return (
    <>
      <Card className="gap-0 overflow-hidden rounded-sm border border-border bg-white py-0 shadow-sm ring-0">
        <div className="flex flex-col gap-4 border-b border-border bg-muted/20 px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Funcionários</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Cadastro de funcionários por empresa.
                {!isLoading && !error && meta && (
                  <>
                    {" "}
                    <span className="font-medium text-foreground/70">
                      · {totalCount}{" "}
                      {totalCount === 1 ? "funcionário" : "funcionários"}
                    </span>
                  </>
                )}
              </p>
            </div>
            <Button
              className="shrink-0 rounded-md py-4.5"
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
              Novo funcionário
            </Button>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
            <div className={cn(FILTER_FIELD_WRAPPER_CLASS, "min-w-0 flex-1")}>
              <label
                htmlFor="employee-name-filter"
                className={FILTER_FIELD_LABEL_CLASS}
              >
                Buscar funcionário
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="employee-name-filter"
                  type="search"
                  placeholder="Nome do funcionário..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className={FILTER_INPUT_CLASS}
                />
              </div>
            </div>

            <CompanyFilterSelect
              value={companyIdFilter}
              onChange={setCompanyIdFilter}
              companies={companies}
              disabled={isLoadingFilters}
              className="w-full lg:w-56 lg:shrink-0"
            />

          </div>

          {!canCreate && !isLoadingFilters && (
            <p className="text-sm text-amber-700">
              Cadastre pelo menos uma empresa antes de adicionar funcionários.
            </p>
          )}
        </div>

        {isLoading && <EmployeesTableSkeleton />}

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
                Nenhum funcionário cadastrado
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {canCreate
                  ? "Comece adicionando o primeiro funcionário."
                  : "Cadastre uma empresa para poder adicionar funcionários."}
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
                Novo funcionário
              </Button>
            )}
          </div>
        )}

        {isEmptyList && hasActiveFilters && (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <p className="font-medium text-foreground">
              Nenhum funcionário encontrado
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Ajuste os filtros de busca ou empresa e tente novamente.
            </p>
          </div>
        )}

        {!isLoading && !error && employees.length > 0 && (
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
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase md:table-cell">
                    CPF
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell">
                    Empresa
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase xl:table-cell">
                    Cargo
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase 2xl:table-cell">
                    Nascimento
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase 2xl:table-cell">
                    Idade
                  </TableHead>
                  <TableHead className="h-11 px-5 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee, index) => (
                  <EmployeeRow
                    key={employee.id}
                    rowIndex={index}
                    employee={employee}
                    onEdit={openEdit}
                    onDelete={setDeletingEmployee}
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

      <EmployeeFormSheet
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        employee={editingEmployee}
      />

      <DeleteModal
        open={!!deletingEmployee}
        onOpenChange={(open) => {
          if (!open) setDeletingEmployee(null);
        }}
        title="Excluir funcionário"
        description={
          <>
            Tem certeza que deseja excluir{" "}
            <strong>{deletingEmployee?.name}</strong>? Esta ação não pode ser
            desfeita.
          </>
        }
        isLoading={isSubmitting}
        onConfirm={handleDelete}
      />
    </>
  );
}

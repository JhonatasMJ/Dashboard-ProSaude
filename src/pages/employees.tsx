import { Search } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { toast } from "sonner";
import { ButtonAnimatedIcon } from "@/components/ButtonAnimatedIcon";
import { CompanyFilterSelect } from "@/components/CompanyFilterSelect";
import { EmployeeForm } from "@/components/Forms/EmployeeForm";
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
import { Pagination } from "@/components/ui/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useButtonAnimatedIcon } from "@/hooks/use-button-animated-icon";
import { useCrudSheetState } from "@/hooks/use-crud-sheet-state";
import { useEmployees } from "@/contexts/employees.context";
import { cn } from "@/lib/utils";
import type { EmployeeFormData } from "@/schemas/employee.schema";
import {
  FILTER_FIELD_LABEL_CLASS,
  FILTER_FIELD_WRAPPER_CLASS,
  FILTER_INPUT_CLASS,
} from "@/shared/constants/filter-field.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formatCpf } from "@/shared/helpers/input-masks.helper";
import { formatAgeFromBirthDate, formatDateBr } from "@/shared/helpers/date.helper";
import type { IEmployee } from "@/shared/interfaces/https/employee";

const EMPLOYEE_FORM_ID = "employee-form";

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
  const ageLabel = formatAgeFromBirthDate(employee.birthDate);

  return (
    <TableRow className={getDataTableRowClassName(rowIndex)}>
      <TableCell className={DATA_TABLE_CELL_CLASS}>
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
      <TableCell className={DATA_TABLE_CELL_CLASS}>
        <p className="truncate font-medium text-foreground">{employee.name}</p>
      </TableCell>
      <TableCell className="hidden text-sm text-muted-foreground md:table-cell px-5 py-4">
        {formatCpf(employee.documentNumber)}
      </TableCell>
      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell px-5 py-4">
        {employee.company.name}
      </TableCell>
      <TableCell className="hidden text-sm text-muted-foreground xl:table-cell px-5 py-4">
        {employee.jobTitle || "—"}
      </TableCell>
      <TableCell className="hidden text-sm text-foreground 2xl:table-cell px-5 py-4">
        {formatDateBr(employee.birthDate)}
      </TableCell>
      <TableCell className="hidden text-sm text-muted-foreground 2xl:table-cell px-5 py-4">
        {ageLabel ?? "—"}
      </TableCell>
      <TableCell className={DATA_TABLE_CELL_CLASS}>
        <DataTableRowActions
          editLabel={`Editar ${employee.name}`}
          deleteLabel={`Excluir ${employee.name}`}
          onEdit={() => onEdit(employee)}
          onDelete={() => onDelete(employee)}
        />
      </TableCell>
    </TableRow>
  );
}

function EmployeeFormSheet({
  open,
  onOpenChange,
  employee,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: IEmployee | null;
}) {
  const { createEmployee, updateEmployee, isSubmitting, companies } =
    useEmployees();
  const isEditing = !!employee;

  const handleSubmit = async (data: EmployeeFormData) => {
    try {
      if (isEditing && employee) {
        await updateEmployee(employee.id, data);
        toast.success("Funcionário atualizado com sucesso.");
      } else {
        await createEmployee(data);
        toast.success("Funcionário cadastrado com sucesso.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEditing
            ? "Não foi possível atualizar o funcionário."
            : "Não foi possível cadastrar o funcionário."
        )
      );
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar funcionário" : "Novo funcionário"}
      description={
        isEditing
          ? "Atualize os dados do funcionário."
          : "Cadastre um funcionário vinculado a uma empresa."
      }
      formId={EMPLOYEE_FORM_ID}
      isSubmitting={isSubmitting}
      isSubmitDisabled={companies.length === 0}
      submitLabel={isEditing ? "Salvar alterações" : "Cadastrar funcionário"}
    >
      <EmployeeForm
        key={employee?.id ?? "new"}
        formId={EMPLOYEE_FORM_ID}
        variant="sheet"
        defaultValues={employee ?? undefined}
        companies={companies}
        isSubmitting={isSubmitting}
        submitLabel={isEditing ? "Salvar alterações" : "Cadastrar funcionário"}
        onSubmit={handleSubmit}
      />
    </FormSheet>
  );
}

export default function EmployeesPage() {
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

  const {
    formOpen,
    editingItem: editingEmployee,
    deletingItem: deletingEmployee,
    setDeletingItem: setDeletingEmployee,
    openCreate,
    openEdit,
    handleFormOpenChange,
  } = useCrudSheetState<IEmployee>();
  const plusIconHeader = useButtonAnimatedIcon();
  const plusIconEmpty = useButtonAnimatedIcon();

  const totalCount = meta?.total ?? 0;
  const hasActiveFilters =
    nameFilter.trim().length > 0 || companyIdFilter.length > 0;
  const isEmptyList = !isLoading && !error && employees.length === 0;
  const canCreate = companies.length > 0;

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
    <PageLayout
      title="Funcionários"
      description="Cadastre funcionários por empresa. Os exames realizados são registrados em Vínculos."
    >
      <DataTable
        title="Funcionários"
        description={
          <>
            Cadastro de funcionários por empresa.
            {!isLoading && !error && meta ? (
              <>
                {" "}
                <span className="font-medium text-foreground/70">
                  · {totalCount}{" "}
                  {totalCount === 1 ? "funcionário" : "funcionários"}
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
        }
        filters={
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
                  onChange={(event) => setNameFilter(event.target.value)}
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
        }
        warning={
          !canCreate && !isLoadingFilters ? (
            <p className="text-sm text-amber-700">
              Cadastre pelo menos uma empresa antes de adicionar funcionários.
            </p>
          ) : null
        }
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        isEmpty={isEmptyList}
        hasActiveFilters={hasActiveFilters}
        emptyState={{
          title: "Nenhum funcionário cadastrado",
          description: canCreate
            ? "Comece adicionando o primeiro funcionário."
            : "Cadastre uma empresa para poder adicionar funcionários.",
          action: canCreate ? (
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
          ) : undefined,
        }}
        filteredEmptyState={{
          title: "Nenhum funcionário encontrado",
          description: "Ajuste os filtros de busca ou empresa e tente novamente.",
        }}
        skeletonColumns={4}
        overlays={
          <>
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
                  <strong>{deletingEmployee?.name}</strong>? Esta ação não pode
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
                <TableHead className={DATA_TABLE_HEAD_CLASS}>Status</TableHead>
                <TableHead className={DATA_TABLE_HEAD_CLASS}>Nome</TableHead>
                <TableHead
                  className={`hidden md:table-cell ${DATA_TABLE_HEAD_CLASS}`}
                >
                  CPF
                </TableHead>
                <TableHead
                  className={`hidden lg:table-cell ${DATA_TABLE_HEAD_CLASS}`}
                >
                  Empresa
                </TableHead>
                <TableHead
                  className={`hidden xl:table-cell ${DATA_TABLE_HEAD_CLASS}`}
                >
                  Cargo
                </TableHead>
                <TableHead
                  className={`hidden 2xl:table-cell ${DATA_TABLE_HEAD_CLASS}`}
                >
                  Nascimento
                </TableHead>
                <TableHead
                  className={`hidden 2xl:table-cell ${DATA_TABLE_HEAD_CLASS}`}
                >
                  Idade
                </TableHead>
                <TableHead className={`text-right ${DATA_TABLE_HEAD_CLASS}`}>
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

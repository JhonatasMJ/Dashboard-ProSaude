import { toast } from "sonner";
import { PageLayout } from "@/components/PageLayout";
import { CompanyForm } from "@/components/Forms/CompanyForm";
import { ButtonAnimatedIcon } from "@/components/ButtonAnimatedIcon";
import {
  DataTable,
  DataTableRowActions,
  DataTableSearchFilter,
  DATA_TABLE_CELL_CLASS,
  DATA_TABLE_HEAD_CLASS,
  DATA_TABLE_HEADER_ROW_CLASS,
  getDataTableRowClassName,
} from "@/components/data-table";
import { DeleteModal } from "@/components/DeleteModal";
import { FormSheet } from "@/components/FormSheet";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@/components/ui/Plus";
import { Pagination } from "@/components/ui/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useCompanies } from "@/contexts/companies.context";
import { useButtonAnimatedIcon } from "@/hooks/use-button-animated-icon";
import { useCrudSheetState } from "@/hooks/use-crud-sheet-state";
import type { CompanyFormData } from "@/schemas/company.schema";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formatCnpj } from "@/shared/helpers/input-masks.helper";
import type { ICompany } from "@/shared/interfaces/https/company";

const COMPANY_FORM_ID = "company-form";

function CompanyRow({
  company,
  rowIndex,
  onEdit,
  onDelete,
}: {
  company: ICompany;
  rowIndex: number;
  onEdit: (company: ICompany) => void;
  onDelete: (company: ICompany) => void;
}) {
  return (
    <TableRow className={getDataTableRowClassName(rowIndex)}>
      <TableCell className={DATA_TABLE_CELL_CLASS}>
        <p className="truncate font-medium text-foreground">{company.name}</p>
      </TableCell>
      <TableCell className="hidden font-mono text-sm text-foreground md:table-cell px-5 py-4">
        {formatCnpj(company.taxId)}
      </TableCell>
      <TableCell className="hidden max-w-[220px] truncate text-sm text-muted-foreground lg:table-cell px-5 py-4">
        {company.email || "—"}
      </TableCell>
      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell px-5 py-4">
        {company.city} — {company.state}
      </TableCell>
      <TableCell className={DATA_TABLE_CELL_CLASS}>
        <DataTableRowActions
          editLabel={`Editar ${company.name}`}
          deleteLabel={`Excluir ${company.name}`}
          onEdit={() => onEdit(company)}
          onDelete={() => onDelete(company)}
        />
      </TableCell>
    </TableRow>
  );
}

function CompanyFormSheet({
  open,
  onOpenChange,
  company,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: ICompany | null;
}) {
  const { createCompany, updateCompany, isSubmitting } = useCompanies();
  const isEditing = !!company;

  const handleSubmit = async (data: CompanyFormData) => {
    try {
      if (isEditing && company) {
        await updateCompany(company.id, data);
        toast.success("Empresa atualizada com sucesso.");
      } else {
        await createCompany(data);
        toast.success("Empresa cadastrada com sucesso.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEditing
            ? "Não foi possível atualizar a empresa."
            : "Não foi possível cadastrar a empresa."
        )
      );
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar empresa" : "Nova empresa"}
      description={
        isEditing
          ? "Atualize os dados da empresa selecionada."
          : "Preencha os campos para cadastrar uma nova empresa no sistema."
      }
      formId={COMPANY_FORM_ID}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? "Salvar alterações" : "Cadastrar empresa"}
    >
      <CompanyForm
        key={company?.id ?? "new"}
        formId={COMPANY_FORM_ID}
        variant="sheet"
        defaultValues={company ?? undefined}
        isSubmitting={isSubmitting}
        submitLabel={isEditing ? "Salvar alterações" : "Cadastrar empresa"}
        onSubmit={handleSubmit}
      />
    </FormSheet>
  );
}

export default function CompaniesPage() {
  const {
    companies,
    meta,
    isLoading,
    error,
    refetch,
    deleteCompany,
    isSubmitting,
    nameFilter,
    setNameFilter,
    setPage,
  } = useCompanies();
  const {
    formOpen,
    editingItem: editingCompany,
    deletingItem: deletingCompany,
    setDeletingItem: setDeletingCompany,
    openCreate,
    openEdit,
    handleFormOpenChange,
  } = useCrudSheetState<ICompany>();
  const plusIconHeader = useButtonAnimatedIcon();
  const plusIconEmpty = useButtonAnimatedIcon();

  const totalCount = meta?.total ?? 0;
  const hasActiveFilter = nameFilter.trim().length > 0;
  const isEmptyList = !isLoading && !error && companies.length === 0;

  const handleDelete = async () => {
    if (!deletingCompany) return;

    try {
      await deleteCompany(deletingCompany.id);
      toast.success("Empresa excluída com sucesso.");
      setDeletingCompany(null);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Não foi possível excluir a empresa.")
      );
    }
  };

  const createButton = (
    iconRef: ReturnType<typeof useButtonAnimatedIcon>["iconRef"],
    rowHandlers: ReturnType<typeof useButtonAnimatedIcon>["rowHandlers"]
  ) => (
    <Button
      className="shrink-0 rounded-md py-4.5"
      size="lg"
      onClick={openCreate}
      {...rowHandlers}
    >
      <ButtonAnimatedIcon icon={PlusIcon} iconRef={iconRef} size={16} />
      Nova empresa
    </Button>
  );

  return (
    <PageLayout
      title="Empresas"
      description="Liste, cadastre, edite e exclua empresas vinculadas ao sistema."
    >
      <DataTable
        title="Empresas"
        description={
          <>
            Gerencie o cadastro de empresas da plataforma.
            {!isLoading && !error && meta ? (
              <>
                {" "}
                <span className="font-medium text-foreground/70">
                  · {totalCount} {totalCount === 1 ? "empresa" : "empresas"}
                </span>
              </>
            ) : null}
          </>
        }
        headerActions={createButton(plusIconHeader.iconRef, plusIconHeader.rowHandlers)}
        filters={
          <DataTableSearchFilter
            value={nameFilter}
            onChange={setNameFilter}
            ariaLabel="Buscar empresa por nome"
          />
        }
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        isEmpty={isEmptyList}
        hasActiveFilters={hasActiveFilter}
        emptyState={{
          title: "Nenhuma empresa cadastrada",
          description: "Comece adicionando a primeira empresa ao sistema.",
          action: (
            <Button className="mt-1 rounded-md py-4.5" onClick={openCreate} {...plusIconEmpty.rowHandlers}>
              <ButtonAnimatedIcon icon={PlusIcon} iconRef={plusIconEmpty.iconRef} size={16} />
              Nova empresa
            </Button>
          ),
        }}
        filteredEmptyState={{
          title: "Nenhuma empresa encontrada",
          description: (
            <>
              Não há resultados para &quot;{nameFilter.trim()}&quot;. Tente outro nome.
            </>
          ),
        }}
        skeletonColumns={3}
        overlays={
          <>
            <CompanyFormSheet
              open={formOpen}
              onOpenChange={handleFormOpenChange}
              company={editingCompany}
            />
            <DeleteModal
              open={!!deletingCompany}
              onOpenChange={(open) => {
                if (!open) setDeletingCompany(null);
              }}
              title="Excluir empresa"
              description={
                <>
                  Tem certeza que deseja excluir{" "}
                  <strong>{deletingCompany?.name}</strong>? Esta ação não pode ser
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
                <TableHead className={DATA_TABLE_HEAD_CLASS}>Empresa</TableHead>
                <TableHead className={`hidden md:table-cell ${DATA_TABLE_HEAD_CLASS}`}>
                  CNPJ
                </TableHead>
                <TableHead className={`hidden lg:table-cell ${DATA_TABLE_HEAD_CLASS}`}>
                  E-mail
                </TableHead>
                <TableHead className={`hidden lg:table-cell ${DATA_TABLE_HEAD_CLASS}`}>
                  Cidade
                </TableHead>
                <TableHead className={`text-right ${DATA_TABLE_HEAD_CLASS}`}>
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company, index) => (
                <CompanyRow
                  key={company.id}
                  rowIndex={index}
                  company={company}
                  onEdit={openEdit}
                  onDelete={setDeletingCompany}
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

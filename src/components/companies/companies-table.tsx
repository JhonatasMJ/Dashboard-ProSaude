import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ButtonAnimatedIcon } from "@/components/button-animated-icon";
import { Pagination } from "@/components/ui/pagination";
import { CompanyFormSheet } from "@/components/companies/company-form-sheet";
import { DeleteModal } from "@/components/delete-modal";
import { Button } from "@/components/ui/button";
import { DeleteIcon } from "@/components/ui/delete";
import { PlusIcon } from "@/components/ui/plus";
import { SquarePenIcon } from "@/components/ui/square-pen";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useButtonAnimatedIcon } from "@/hooks/use-button-animated-icon";
import { useCompanies } from "@/contexts/companies-context";
import { cn } from "@/lib/utils";
import { TABLE_PAGE_SIZE } from "@/shared/constants/app.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formatCnpj } from "@/shared/helpers/input-masks.helper";
import type { ICompany } from "@/shared/interfaces/https/company";

function CompaniesTableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: TABLE_PAGE_SIZE }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 px-5 py-4"
        >
          <div className="h-4 w-48 flex-1 rounded-md bg-muted" />
          <div className="hidden h-4 w-28 rounded-md bg-muted md:block" />
          <div className="h-8 w-16 rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}

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
        <p className="truncate font-medium text-foreground">{company.name}</p>
      </TableCell>
      <TableCell className="hidden px-5 py-4 font-mono text-sm text-foreground md:table-cell">
        {formatCnpj(company.taxId)}
      </TableCell>
      <TableCell className="hidden max-w-[220px] truncate px-5 py-4 text-sm text-muted-foreground lg:table-cell">
        {company.email}
      </TableCell>
      <TableCell className="hidden px-5 py-4 text-sm text-muted-foreground lg:table-cell">
        {company.city} — {company.state}
      </TableCell>
      <TableCell className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon-lg"
            className="rounded-md bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
            aria-label={`Editar ${company.name}`}
            onClick={() => onEdit(company)}
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
            aria-label={`Excluir ${company.name}`}
            onClick={() => onDelete(company)}
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

export function CompaniesTable() {
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
  const [formOpen, setFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<ICompany | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<ICompany | null>(null);
  const plusIconHeader = useButtonAnimatedIcon();
  const plusIconEmpty = useButtonAnimatedIcon();

  const totalCount = meta?.total ?? 0;
  const hasActiveFilter = nameFilter.trim().length > 0;
  const isEmptyList = !isLoading && !error && companies.length === 0;

  const openCreate = () => {
    setEditingCompany(null);
    setFormOpen(true);
  };

  const openEdit = (company: ICompany) => {
    setEditingCompany(company);
    setFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingCompany(null);
    }
  };

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

  return (
    <>
      <Card className="gap-0 overflow-hidden rounded-sm border border-border bg-white py-0 shadow-sm ring-0">
        <div className="flex flex-col gap-4 border-b border-border bg-muted/20 px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Empresas</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Gerencie o cadastro de empresas da plataforma.
                {!isLoading && !error && meta && (
                  <>
                    {" "}
                    <span className="font-medium text-foreground/70">
                      · {totalCount}{" "}
                      {totalCount === 1 ? "empresa" : "empresas"}
                    </span>
                  </>
                )}
              </p>
            </div>
            <Button
              className="shrink-0 rounded-md py-4.5"
              size="lg"
              onClick={openCreate}
              {...plusIconHeader.rowHandlers}
            >
              <ButtonAnimatedIcon
                icon={PlusIcon}
                iconRef={plusIconHeader.iconRef}
                size={16}
              />
              Nova empresa
            </Button>
          </div>

          <div className="relative max-w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="h-10 rounded-md pl-10"
              aria-label="Buscar empresa por nome"
            />
          </div>
        </div>

        {isLoading && <CompaniesTableSkeleton />}

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

        {isEmptyList && !hasActiveFilter && (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                Nenhuma empresa cadastrada
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Comece adicionando a primeira empresa ao sistema.
              </p>
            </div>
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
              Nova empresa
            </Button>
          </div>
        )}

        {isEmptyList && hasActiveFilter && (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <p className="font-medium text-foreground">
              Nenhuma empresa encontrada
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Não há resultados para &quot;{nameFilter.trim()}&quot;. Tente outro
              nome.
            </p>
          </div>
        )}

        {!isLoading && !error && companies.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-border/80 bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Empresa
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase md:table-cell">
                    CNPJ
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell">
                    E-mail
                  </TableHead>
                  <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell">
                    Cidade
                  </TableHead>
                  <TableHead className="h-11 px-5 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase">
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
  );
}

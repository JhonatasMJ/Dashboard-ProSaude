import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CompanyFormSheet } from "@/components/companies/company-form-sheet";
import { DeleteModal } from "@/components/delete-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompanies } from "@/hooks/use-companies";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import type { ICompany } from "@/shared/interfaces/https/company";

function CompaniesTableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 px-5 py-4"
        >
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-48 rounded-md bg-muted" />
            <div className="h-3 w-32 rounded-md bg-muted/70" />
          </div>
          <div className="hidden h-4 w-28 rounded-md bg-muted md:block" />
          <div className="h-8 w-16 rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}

function CompanyRow({
  company,
  onEdit,
  onDelete,
}: {
  company: ICompany;
  onEdit: (company: ICompany) => void;
  onDelete: (company: ICompany) => void;
}) {
  return (
    <TableRow className="border-border/80 hover:bg-muted/30">
      <TableCell className="px-5 py-4">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {company.tradeName}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {company.legalName}
          </p>
        </div>
      </TableCell>
      <TableCell className="hidden px-5 py-4 text-sm text-foreground md:table-cell">
        {company.taxId}
      </TableCell>
      <TableCell className="hidden max-w-[220px] truncate px-5 py-4 text-sm text-muted-foreground lg:table-cell">
        {company.email}
      </TableCell>
      <TableCell className="hidden px-5 py-4 text-sm text-muted-foreground xl:table-cell">
        {company.phone}
      </TableCell>
      <TableCell className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-md bg-primary/10 text-primary hover:bg-primary/15"
            aria-label={`Editar ${company.tradeName}`}
            onClick={() => onEdit(company)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-md bg-destructive/10 text-destructive hover:bg-destructive/15"
            aria-label={`Excluir ${company.tradeName}`}
            onClick={() => onDelete(company)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function CompaniesTable() {
  const { companies, isLoading, error, refetch, deleteCompany, isSubmitting } =
    useCompanies();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<ICompany | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<ICompany | null>(null);

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
      <Card className="gap-0 overflow-hidden rounded-md border border-border bg-white py-0 shadow-sm ring-0">
        <div className="flex flex-col gap-4 border-b border-border bg-muted/20 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-foreground">Empresas</h2>
              {!isLoading && !error && (
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {companies.length}{" "}
                  {companies.length === 1 ? "registro" : "registros"}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Gerencie o cadastro de empresas da plataforma.
            </p>
          </div>
          <Button className="shrink-0 rounded-md" onClick={openCreate}>
            <Plus className="size-4" />
            Nova empresa
          </Button>
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

        {!isLoading && !error && companies.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                Nenhuma empresa cadastrada
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Comece adicionando a primeira empresa ao sistema.
              </p>
            </div>
            <Button className="mt-1 rounded-md" onClick={openCreate}>
              <Plus className="size-4" />
              Nova empresa
            </Button>
          </div>
        )}

        {!isLoading && !error && companies.length > 0 && (
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
                <TableHead className="hidden h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase xl:table-cell">
                  Telefone
                </TableHead>
                <TableHead className="h-11 px-5 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <CompanyRow
                  key={company.id}
                  company={company}
                  onEdit={openEdit}
                  onDelete={setDeletingCompany}
                />
              ))}
            </TableBody>
          </Table>
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
            <strong>
              {deletingCompany?.tradeName ?? deletingCompany?.legalName}
            </strong>
            ? Esta ação não pode ser desfeita.
          </>
        }
        isLoading={isSubmitting}
        onConfirm={handleDelete}
      />
    </>
  );
}

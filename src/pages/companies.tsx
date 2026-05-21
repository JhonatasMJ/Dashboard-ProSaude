import { CompaniesTable } from "@/components/companies/companies-table";

export default function CompaniesPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-1 text-3xl font-bold tracking-tight text-foreground">
          Empresas
          <span className="text-primary">.</span>
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Liste, cadastre, edite e exclua empresas vinculadas ao sistema.
        </p>
      </header>

      <CompaniesTable />
    </div>
  );
}

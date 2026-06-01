import { ExamsTable } from "@/components/exams/exams-table";

export default function ExamsPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-1 text-3xl font-bold tracking-tight text-foreground">
          Exames
          <span className="text-primary">.</span>
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Cadastre exames por empresa, com preço, custo e lucro próprios.
        </p>
      </header>

      <ExamsTable />
    </div>
  );
}

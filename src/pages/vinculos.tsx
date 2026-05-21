import { EmployeeExamsTable } from "@/components/employee-exams/employee-exams-table";

export default function VinculosPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-1 text-3xl font-bold tracking-tight text-foreground">
          Vínculos
          <span className="text-primary">.</span>
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Registre e consulte os exames realizados por cada funcionário, com
          profissional, data e hora.
        </p>
      </header>

      <EmployeeExamsTable />
    </div>
  );
}

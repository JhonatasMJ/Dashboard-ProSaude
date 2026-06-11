import { EmployeeExamsTable } from "@/components/employee-exams/employee-exams-table";

export default function EmployeeExamsPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-1 text-3xl font-bold tracking-tight text-foreground">
          Vínculos
          <span className="text-primary">.</span>
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Registre e consulte os exames realizados por cada funcionário. 
        </p>
      </header>

      <EmployeeExamsTable />
    </div>
  );
}

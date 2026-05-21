import { EmployeesTable } from "@/components/employees/employees-table";

export default function EmployeesPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-1 text-3xl font-bold tracking-tight text-foreground">
          Funcionários
          <span className="text-primary">.</span>
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Cadastre funcionários por empresa. Os exames realizados são
          registrados em Vínculos.
        </p>
      </header>

      <EmployeesTable />
    </div>
  );
}

import { SummaryTotalsCard } from "@/components/dashboard/summary-totals-card";

export default function Dashboard() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-1 text-3xl font-bold tracking-tight text-foreground">
          Dashboard
          <span className="text-primary">.</span>
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Visão geral dos totais de empresas, funcionários e exames cadastrados
          na plataforma.
        </p>
      </header>

      <SummaryTotalsCard />
    </div>
  );
}

import { DashboardSummary } from "@/components/dashboard/dashboard-summary";

export default function Dashboard() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-1 text-3xl font-bold tracking-tight text-foreground">
          Dashboard
          <span className="text-primary">.</span>
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Panorama da operação com indicadores, gráficos financeiros e rankings
          em um só lugar.
        </p>
      </header>

      <DashboardSummary />
    </div>
  );
}

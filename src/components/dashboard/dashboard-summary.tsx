import { DashboardKpiRow } from "@/components/dashboard/dashboard-kpi-row";
import { DashboardRankingsSection } from "@/components/dashboard/dashboard-rankings-section";
import { DashboardSecondaryMetrics } from "@/components/dashboard/dashboard-secondary-metrics";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { RecentEmployeeExamsSection } from "@/components/dashboard/recent-employee-exams-section";
import { SummaryFinancialSection } from "@/components/dashboard/summary-financial-section";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/use-dashboard";

export function DashboardSummary() {
  const { summary, isLoading, error, refetch } = useDashboard();

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-5">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">

      <DashboardSection
        title="Indicadores principais"
        description="O que mais importa para o dia a dia"
      >
        <DashboardKpiRow
          totals={summary?.totals}
          financial={summary?.financial}
          isLoading={isLoading}
        />
        <DashboardSecondaryMetrics
          totals={summary?.totals}
          isLoading={isLoading}
        />
      </DashboardSection>

      <DashboardSection
        title="Financeiro"
        description="Visão comparativa e distribuição do mês"
      >
        <SummaryFinancialSection
          financial={summary?.financial}
          isLoading={isLoading}
        />
      </DashboardSection>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <DashboardRankingsSection
            summary={summary ?? undefined}
            isLoading={isLoading}
          />
        </div>
        <div className="xl:col-span-2">
          <RecentEmployeeExamsSection
            items={summary?.recentEmployeeExams}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

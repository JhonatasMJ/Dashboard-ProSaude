import { Link2, TrendingUp, Users, Wallet } from "lucide-react";
import {
  SummaryStatCard,
  SummaryStatCardSkeleton,
} from "@/components/dashboard/summary-stat-card";
import type {
  IDashboardFinancial,
  IDashboardSummaryTotals,
} from "@/shared/interfaces/https/dashboard-summary";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";

interface DashboardKpiRowProps {
  totals?: IDashboardSummaryTotals;
  financial?: IDashboardFinancial;
  isLoading?: boolean;
}

const KPI_SKELETON_COUNT = 4;

export function DashboardKpiRow({
  totals,
  financial,
  isLoading,
}: DashboardKpiRowProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: KPI_SKELETON_COUNT }).map((_, index) => (
          <SummaryStatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!totals || !financial) return null;

  const { thisMonth } = financial;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryStatCard
        title="Lucro no mês"
        description={`Margem ${thisMonth.marginPercent.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% · ${thisMonth.employeeExamCount} vínculos`}
        value={thisMonth.profit}
        icon={TrendingUp}
        valueFormatter={formatCurrency}
      />
      <SummaryStatCard
        title="Receita no mês"
        description="Faturamento do período atual"
        value={thisMonth.revenue}
        icon={Wallet}
        valueFormatter={formatCurrency}
      />
      <SummaryStatCard
        title="Funcionários"
        description={`${totals.employeesActive} ativos · ${totals.employeesInactive} inativos`}
        value={totals.employees}
        icon={Users}
      />
      <SummaryStatCard
        title="Vínculos"
        description={`${totals.employeeExamsThisMonth} registrados neste mês`}
        value={totals.employeeExams}
        icon={Link2}
      />
    </div>
  );
}

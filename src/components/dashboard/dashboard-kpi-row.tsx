import { Link2, Receipt, TrendingUp, Users, Wallet } from "lucide-react";
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

const KPI_SKELETON_COUNT = 5;

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

  const { allTime, thisMonth } = financial;

  const monthActivityHint =
    thisMonth.employeeExamCount > 0
      ? ` · ${thisMonth.employeeExamCount} vínculo(s) neste mês`
      : "";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryStatCard
        title="Lucro"
        description={`Margem ${allTime.marginPercent.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% · ${allTime.employeeExamCount} vínculo(s)${monthActivityHint}`}
        value={allTime.profit}
        icon={TrendingUp}
        valueFormatter={formatCurrency}
      />
      <SummaryStatCard
        title="Receita"
        description={`Faturamento acumulado${monthActivityHint}`}
        value={allTime.revenue}
        icon={Wallet}
        valueFormatter={formatCurrency}
      />
      <SummaryStatCard
        title="Custo"
        description={`Despesas com exames${monthActivityHint}`}
        value={allTime.cost}
        icon={Receipt}
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
        description={`${totals.employeeExamsThisMonth} registrados neste mês · ${totals.employeeExams} no total`}
        value={totals.employeeExams}
        icon={Link2}
      />
    </div>
  );
}

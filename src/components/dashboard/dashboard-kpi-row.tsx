import { Clock, TrendingUp, Users, Wallet } from "lucide-react";
import {
  SummaryStatCard,
  SummaryStatCardSkeleton,
} from "@/components/dashboard/summary-stat-card";
import type {
  IDashboardFinancial,
  IDashboardPayments,
  IDashboardSummaryTotals,
} from "@/shared/interfaces/https/dashboard-summary";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";

interface DashboardKpiRowProps {
  totals?: IDashboardSummaryTotals;
  payments?: IDashboardPayments;
  financial?: IDashboardFinancial;
  isLoading?: boolean;
}

const KPI_SKELETON_COUNT = 4;

export function DashboardKpiRow({
  totals,
  payments,
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

  if (!totals || !payments || !financial) return null;

  const { pending } = payments;
  const period =
    financial.thisMonth.employeeExamCount > 0
      ? financial.thisMonth
      : financial.allTime;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryStatCard
        title="Pendente"
        description={`${pending.count} ${pending.count === 1 ? "vínculo" : "vínculos"} · Lucro ${formatCurrency(pending.profit)}`}
        value={pending.revenue}
        icon={Clock}
        valueFormatter={formatCurrency}
        variant="alert"
      />
      <SummaryStatCard
        title="Lucro total"
        description={`Exames ${formatCurrency(period.examCost)} · Contas ${formatCurrency(period.contaCost)}`}
        value={period.profit}
        icon={TrendingUp}
        valueFormatter={formatCurrency}
      />
      <SummaryStatCard
        title="Funcionários"
        description={`${totals.employeesActive} ativos · ${totals.employeesInactive} inativos`}
        value={totals.employees}
        icon={Users}
      />
      <SummaryStatCard
        title="Contas"
        description={`${totals.employeeExamsThisMonth} vínculos neste mês · ${totals.employeeExams} no total`}
        value={totals.contas}
        icon={Wallet}
      />
    </div>
  );
}

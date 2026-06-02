import { CheckCircle2, Clock, Link2, TrendingUp, Users } from "lucide-react";
import {
  SummaryStatCard,
  SummaryStatCardSkeleton,
} from "@/components/dashboard/summary-stat-card";
import type {
  IDashboardPayments,
  IDashboardSummaryTotals,
} from "@/shared/interfaces/https/dashboard-summary";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";

interface DashboardKpiRowProps {
  totals?: IDashboardSummaryTotals;
  payments?: IDashboardPayments;
  isLoading?: boolean;
}

const KPI_SKELETON_COUNT = 5;

export function DashboardKpiRow({
  totals,
  payments,
  isLoading,
}: DashboardKpiRowProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: KPI_SKELETON_COUNT }).map((_, index) => (
          <SummaryStatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!totals || !payments) return null;

  const { pending, paid, total } = payments;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryStatCard
        title="Pendente"
        description={`${pending.count} ${pending.count === 1 ? "vínculo" : "vínculos"} · Lucro ${formatCurrency(pending.profit)}`}
        value={pending.revenue}
        icon={Clock}
        valueFormatter={formatCurrency}
        variant="alert"
      />
      <SummaryStatCard
        title="Pago"
        description={`${paid.count} ${paid.count === 1 ? "vínculo" : "vínculos"} · Lucro ${formatCurrency(paid.profit)}`}
        value={paid.revenue}
        icon={CheckCircle2}
        valueFormatter={formatCurrency}
      />
      <SummaryStatCard
        title="Lucro total"
        description={`${total.count} vínculos · Custo ${formatCurrency(total.cost)}`}
        value={total.profit}
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
        title="Vínculos"
        description={`${totals.employeeExamsThisMonth} neste mês · ${totals.employeeExams} no total`}
        value={totals.employeeExams}
        icon={Link2}
      />
    </div>
  );
}

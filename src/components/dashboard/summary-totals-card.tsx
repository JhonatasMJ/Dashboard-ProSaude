import { Building2, ClipboardList, Users } from "lucide-react";
import {
  SummaryStatCard,
  SummaryStatCardSkeleton,
} from "@/components/dashboard/summary-stat-card";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/use-dashboard";

const SUMMARY_STATS = [
  {
    key: "companies",
    title: "Empresas cadastradas",
    description: "Total no sistema",
    icon: Building2,
    getValue: (totals: { companies: number }) => totals.companies,
  },
  {
    key: "employees",
    title: "Funcionários cadastrados",
    description: "Total no sistema",
    icon: Users,
    getValue: (totals: { employees: number }) => totals.employees,
  },
  {
    key: "exams",
    title: "Exames cadastrados",
    description: "Total no sistema",
    icon: ClipboardList,
    getValue: (totals: { exams: number }) => totals.exams,
  },
] as const;

export function SummaryTotalsCard() {
  const { summary, isLoading, error, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SUMMARY_STATS.map((stat) => (
          <SummaryStatCardSkeleton key={stat.key} />
        ))}
      </div>
    );
  }

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

  if (!summary) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {SUMMARY_STATS.map((stat) => (
        <SummaryStatCard
          key={stat.key}
          title={stat.title}
          description={stat.description}
          value={stat.getValue(summary.totals)}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}

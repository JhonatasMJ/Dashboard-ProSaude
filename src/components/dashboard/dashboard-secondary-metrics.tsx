import { Card } from "@/components/ui/card";
import type { IDashboardSummaryTotals } from "@/shared/interfaces/https/dashboard-summary";
import { cn } from "@/lib/utils";

const METRICS = [
  { key: "companies", label: "Empresas" },
  { key: "exams", label: "Exames no catálogo" },
  { key: "employeeExams", label: "Vínculos" },
  { key: "employeesWithoutExam", label: "Sem exame vinculado", highlight: true },
  { key: "upcomingExamsNext7Days", label: "Próximos 7 dias", highlight: true },
] as const;

interface DashboardSecondaryMetricsProps {
  totals?: IDashboardSummaryTotals;
  isLoading?: boolean;
}

export function DashboardSecondaryMetrics({
  totals,
  isLoading,
}: DashboardSecondaryMetricsProps) {
  if (isLoading) {
    return (
      <Card className="rounded-md border border-border bg-white py-0 shadow-none">
        <div className="grid animate-pulse gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
          {METRICS.map((metric) => (
            <div key={metric.key} className="space-y-2">
              <div className="h-3 w-24 rounded-md bg-muted/70" />
              <div className="h-7 w-12 rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!totals) return null;

  return (
    <Card className="rounded-md border border-border bg-white py-0 shadow-none">
      <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x">
        {METRICS.map((metric) => {
          const value = totals[metric.key];
          const highlight = "highlight" in metric && metric.highlight;

          return (
            <div
              key={metric.key}
              className={cn(
                "flex flex-col gap-1 px-5 py-4",
                highlight && value > 0 && "bg-amber-50/50"
              )}
            >
              <span className="text-xs font-medium text-muted-foreground">
                {metric.label}
              </span>
              <span
                className={cn(
                  "text-xl font-bold tabular-nums tracking-tight",
                  highlight && value > 0
                    ? "text-amber-800"
                    : "text-foreground"
                )}
              >
                {value.toLocaleString("pt-BR")}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

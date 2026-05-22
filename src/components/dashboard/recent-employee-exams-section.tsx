import { Card } from "@/components/ui/card";
import { formatDateBr } from "@/shared/helpers/date.helper";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";
import type { IDashboardRecentEmployeeExam } from "@/shared/interfaces/https/dashboard-summary";
import { cn } from "@/lib/utils";

const DISPLAY_LIMIT = 5;

interface RecentEmployeeExamsSectionProps {
  items?: IDashboardRecentEmployeeExam[];
  isLoading?: boolean;
}

export function RecentEmployeeExamsSection({
  items,
  isLoading,
}: RecentEmployeeExamsSectionProps) {
  const visibleItems = items?.slice(0, DISPLAY_LIMIT) ?? [];

  return (
    <Card className="gap-0 overflow-hidden rounded-md border border-border bg-white py-0 shadow-none">
      <div className="border-b border-border/60 px-5 py-4">
        <h3 className="font-semibold text-foreground">Atividade recente</h3>
        <p className="text-sm text-muted-foreground">
          Últimos vínculos registrados
        </p>
      </div>

      {isLoading ? (
        <ul className="divide-y divide-border">
          {Array.from({ length: DISPLAY_LIMIT }).map((_, index) => (
            <li key={index} className="flex animate-pulse gap-3 px-5 py-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded-md bg-muted" />
                <div className="h-3 w-1/2 rounded-md bg-muted/70" />
              </div>
            </li>
          ))}
        </ul>
      ) : visibleItems.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          Nenhum vínculo recente.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {visibleItems.map((item, index) => (
            <li
              key={item.id}
              className={cn(
                "flex items-start justify-between gap-4 px-5 py-4",
                index % 2 === 1 && "bg-muted/20"
              )}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate font-medium text-foreground">
                  {item.employee.name}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {item.exam.name}
                  <span className="mx-1.5 text-border">·</span>
                  {item.company.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateBr(item.examDate)}
                  {item.examTime ? ` às ${item.examTime}` : ""}
                  {item.professionalName
                    ? ` · ${item.professionalName}`
                    : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-primary">
                  {formatCurrency(item.profit)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(item.revenue)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

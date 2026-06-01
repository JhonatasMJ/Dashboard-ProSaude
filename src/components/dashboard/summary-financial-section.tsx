import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { DASHBOARD_CHART } from "@/components/dashboard/dashboard-chart-theme";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";
import type { IDashboardFinancial } from "@/shared/interfaces/https/dashboard-summary";

function formatAxisCurrency(value: number) {
  if (Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  }
  if (Math.abs(value) >= 1_000) {
    return `R$ ${(value / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
  }
  return formatCurrency(value);
}

const COMPARISON_METRICS = [
  { key: "receita" as const, label: "Receita" },
  { key: "custo" as const, label: "Custo" },
  { key: "lucro" as const, label: "Lucro" },
];

function buildPeriodComparison(financial: IDashboardFinancial) {
  return COMPARISON_METRICS.map(({ key, label }) => ({
    metric: label,
    todoPeriodo:
      key === "receita"
        ? financial.allTime.revenue
        : key === "custo"
          ? financial.allTime.cost
          : financial.allTime.profit,
    esteMes:
      key === "receita"
        ? financial.thisMonth.revenue
        : key === "custo"
          ? financial.thisMonth.cost
          : financial.thisMonth.profit,
  }));
}

function resolveCompositionPeriod(financial: IDashboardFinancial) {
  if (financial.thisMonth.employeeExamCount > 0) {
    return {
      label: "Mês atual",
      period: financial.thisMonth,
    };
  }

  return {
    label: "Todo o período",
    period: financial.allTime,
  };
}

function buildComposition(financial: IDashboardFinancial) {
  const { period } = resolveCompositionPeriod(financial);
  const { revenue, cost, profit } = period;

  return [
    { name: "Receita", value: Math.max(revenue, 0), color: DASHBOARD_CHART.revenue },
    { name: "Custo", value: Math.max(cost, 0), color: DASHBOARD_CHART.cost },
    { name: "Lucro", value: Math.max(profit, 0), color: DASHBOARD_CHART.profit },
  ].filter((item) => item.value > 0);
}

const PERIOD_LABELS: Record<string, string> = {
  todoPeriodo: "Todo o período",
  esteMes: "Este mês",
};

function FinancialSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="col-span-12 gap-0 rounded-md border border-border bg-white py-0 shadow-none lg:col-span-8">
        <div className="h-[320px] animate-pulse bg-muted/30" />
      </Card>
      <Card className="col-span-12 gap-0 rounded-md border border-border bg-white py-0 shadow-none lg:col-span-4">
        <div className="h-[320px] animate-pulse bg-muted/30" />
      </Card>
    </div>
  );
}

interface SummaryFinancialSectionProps {
  financial?: IDashboardFinancial;
  isLoading?: boolean;
}

export function SummaryFinancialSection({
  financial,
  isLoading,
}: SummaryFinancialSectionProps) {
  if (isLoading) return <FinancialSkeleton />;
  if (!financial) return null;

  const comparisonData = buildPeriodComparison(financial);
  const compositionData = buildComposition(financial);
  const compositionLabel = resolveCompositionPeriod(financial).label;

  return (
    <div className="grid gap-4 lg:grid-cols-12">
        <Card className="col-span-12 gap-0 overflow-hidden rounded-md border border-border bg-white py-0 shadow-none lg:col-span-8">
          <div className="border-b border-border/60 px-5 py-4">
            <h3 className="font-semibold text-foreground">
              Comparativo financeiro
            </h3>
            <p className="text-sm text-muted-foreground">
              Receita, custo e lucro — todo o período vs. mês atual
            </p>
          </div>
          <div className="h-[300px] w-full px-2 py-4 sm:px-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                barGap={4}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="oklch(0.922 0 0)"
                />
                <XAxis
                  dataKey="metric"
                  tick={{ fontSize: 12, fill: "oklch(0.556 0 0)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatAxisCurrency}
                  tick={{ fontSize: 11, fill: "oklch(0.556 0 0)" }}
                  axisLine={false}
                  tickLine={false}
                  width={72}
                />
                <Tooltip
                  cursor={{ fill: "oklch(0.97 0 0)" }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;

                    return (
                      <div className="rounded-md border border-border bg-white px-3 py-2 text-sm shadow-md">
                        {label ? (
                          <p className="mb-1.5 font-medium text-foreground">
                            {label}
                          </p>
                        ) : null}
                        <ul className="space-y-1">
                          {payload.map((entry) => (
                            <li
                              key={String(entry.dataKey)}
                              className="flex justify-between gap-4 tabular-nums"
                            >
                              <span className="text-muted-foreground">
                                {PERIOD_LABELS[String(entry.dataKey)] ??
                                  entry.name}
                              </span>
                              <span className="font-medium text-foreground">
                                {formatCurrency(Number(entry.value))}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  formatter={(value) =>
                    value === "todoPeriodo" ? "Todo o período" : "Este mês"
                  }
                />
                <Bar
                  dataKey="todoPeriodo"
                  name="todoPeriodo"
                  fill={DASHBOARD_CHART.allTime}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
                <Bar
                  dataKey="esteMes"
                  name="esteMes"
                  fill={DASHBOARD_CHART.thisMonth}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="col-span-12 gap-0 overflow-hidden rounded-md border border-border bg-white py-0 shadow-none lg:col-span-4">
          <div className="border-b border-border/60 px-5 py-4">
            <h3 className="font-semibold text-foreground">{compositionLabel}</h3>
            <p className="text-sm text-muted-foreground">
              Distribuição de receita, custo e lucro
            </p>
          </div>
          <div className="flex h-[300px] flex-col items-center justify-center px-4 py-4">
            {compositionData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sem movimentação financeira registrada.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={compositionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {compositionData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(typeof value === "number" ? value : 0)
                    }
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
    </div>
  );
}

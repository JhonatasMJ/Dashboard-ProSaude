import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { DASHBOARD_CHART } from "@/components/dashboard/dashboard-chart-theme";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";
import type { IDashboardSummaryData } from "@/shared/interfaces/https/dashboard-summary";
import { cn } from "@/lib/utils";

const TOP_LIMIT = 5;

type RankingTab =
  | "employees"
  | "links"
  | "revenue"
  | "exams";

const TABS: { id: RankingTab; label: string }[] = [
  { id: "employees", label: "Funcionários" },
  { id: "links", label: "Vínculos" },
  { id: "revenue", label: "Receita" },
  { id: "exams", label: "Exames" },
];

function formatAxisNumber(value: number) {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

function buildChartData(
  summary: IDashboardSummaryData,
  tab: RankingTab
): { name: string; value: number; fill: string }[] {
  switch (tab) {
    case "employees":
      return summary.topCompaniesByEmployees.slice(0, TOP_LIMIT).map((item) => ({
        name: item.name,
        value: item.employeeCount,
        fill: DASHBOARD_CHART.volume,
      }));
    case "links":
      return summary.topCompaniesByEmployeeExams
        .slice(0, TOP_LIMIT)
        .map((item) => ({
          name: item.name,
          value: item.employeeExamCount,
          fill: DASHBOARD_CHART.thisMonth,
        }));
    case "revenue":
      return summary.topCompaniesByRevenue.slice(0, TOP_LIMIT).map((item) => ({
        name: item.name,
        value: item.revenue,
        fill: DASHBOARD_CHART.revenue,
      }));
    case "exams":
      return summary.topExamsByVolume.slice(0, TOP_LIMIT).map((item) => ({
        name: item.name,
        value: item.employeeExamCount,
        fill: DASHBOARD_CHART.cost,
      }));
    default:
      return [];
  }
}

function getValueFormatter(tab: RankingTab) {
  return tab === "revenue"
    ? (value: number) => formatCurrency(value)
    : (value: number) => formatAxisNumber(value);
}

interface DashboardRankingsSectionProps {
  summary?: IDashboardSummaryData;
  isLoading?: boolean;
}

export function DashboardRankingsSection({
  summary,
  isLoading,
}: DashboardRankingsSectionProps) {
  const [tab, setTab] = useState<RankingTab>("revenue");

  if (isLoading) {
    return (
      <Card className="gap-0 overflow-hidden rounded-md border border-border bg-white py-0 shadow-none">
        <div className="h-[360px] animate-pulse bg-muted/30" />
      </Card>
    );
  }

  if (!summary) return null;

  const chartData = buildChartData(summary, tab);
  const formatValue = getValueFormatter(tab);
  const isCurrency = tab === "revenue";

  return (
    <Card className="gap-0 overflow-hidden rounded-md border border-border bg-white py-0 shadow-none">
      <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Rankings</h3>
          <p className="text-sm text-muted-foreground">
            Top {TOP_LIMIT} — selecione a métrica
          </p>
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-muted/40 p-1">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                tab === item.id
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-muted-foreground">
          Nenhum dado disponível para este ranking.
        </p>
      ) : (
        <div className="h-[320px] w-full px-2 py-4 sm:px-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="oklch(0.922 0 0)"
              />
              <XAxis
                type="number"
                tickFormatter={
                  isCurrency
                    ? (v) =>
                        Math.abs(v) >= 1000
                          ? `R$ ${(v / 1000).toFixed(0)}k`
                          : formatCurrency(v)
                    : formatAxisNumber
                }
                tick={{ fontSize: 11, fill: "oklch(0.556 0 0)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 11, fill: "oklch(0.556 0 0)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => [formatValue(value), "Valor"]}
                labelStyle={{ fontWeight: 600 }}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid oklch(0.922 0 0)",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

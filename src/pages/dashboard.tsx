import type { ComponentType, ReactNode } from "react";
import { PageLayout } from "@/components/PageLayout";
import { useState } from "react";
import { Clock, TrendingUp, Users, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useDashboard } from "@/contexts/dashboard.context";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";
import { formatDateBr } from "@/shared/helpers/date.helper";
import type {
  IDashboardFinancial,
  IDashboardPayments,
  IDashboardRecentEmployeeExam,
  IDashboardSummaryData,
  IDashboardSummaryTotals,
} from "@/shared/interfaces/https/dashboard-summary";

const DASHBOARD_CHART = {
  revenue: "#008C1C",
  cost: "#00184A",
  examCost: "#00184A",
  contaCost: "#dc2626",
  profit: "#16a34a",
  allTime: "oklch(0.556 0 0)",
  thisMonth: "#008C1C",
  volume: "#00184A",
  margin: "#008C1C",
} as const;

const formatTotal = (value: number) =>
  value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

function DashboardSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function SummaryStatCard({
  title,
  description,
  value,
  icon: Icon,
  valueFormatter = formatTotal,
  variant = "default",
}: {
  title: string;
  description: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  valueFormatter?: (value: number) => string;
  variant?: "default" | "alert";
}) {
  const isAlert = variant === "alert";

  return (
    <Card
      className={cn(
        "gap-0 rounded-md border bg-white py-0 shadow-none ring-0 transition-shadow hover:shadow-sm",
        isAlert ? "border-amber-200/80 bg-amber-50/40" : "border-border"
      )}
    >
      <div className="flex flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="font-semibold leading-snug text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-md",
              isAlert
                ? "bg-amber-100 text-amber-700"
                : "bg-primary/10 text-primary"
            )}
          >
            <Icon className="size-5" />
          </span>
        </div>
        <p
          className={cn(
            "text-2xl font-bold tracking-tight sm:text-3xl",
            isAlert ? "text-amber-800" : "text-foreground"
          )}
        >
          {valueFormatter(value)}
        </p>
      </div>
    </Card>
  );
}

function SummaryStatCardSkeleton() {
  return (
    <Card className="gap-0 rounded-md border border-border bg-white py-0 shadow-none ring-0">
      <div className="flex animate-pulse flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded-md bg-muted" />
            <div className="h-3 w-24 rounded-md bg-muted/70" />
          </div>
          <div className="size-10 rounded-md bg-muted" />
        </div>
        <div className="h-9 w-28 rounded-md bg-muted" />
      </div>
    </Card>
  );
}

const KPI_SKELETON_COUNT = 4;

function DashboardKpiRow({
  totals,
  payments,
  financial,
  isLoading,
}: {
  totals?: IDashboardSummaryTotals;
  payments?: IDashboardPayments;
  financial?: IDashboardFinancial;
  isLoading?: boolean;
}) {
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

const METRICS = [
  { key: "companies", label: "Empresas" },
  { key: "exams", label: "Exames no catálogo" },
  { key: "employeeExams", label: "Vínculos" },
  { key: "employeesWithoutExam", label: "Sem exame vinculado", highlight: true },
  { key: "upcomingExamsNext7Days", label: "Próximos 7 dias", highlight: true },
] as const;

function DashboardSecondaryMetrics({
  totals,
  isLoading,
}: {
  totals?: IDashboardSummaryTotals;
  isLoading?: boolean;
}) {
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
  { key: "revenue" as const, label: "Receita" },
  { key: "examCost" as const, label: "Custo exames" },
  { key: "contaCost" as const, label: "Custo contas" },
  { key: "profit" as const, label: "Lucro" },
];

function buildPeriodComparison(financial: IDashboardFinancial) {
  return COMPARISON_METRICS.map(({ key, label }) => ({
    metric: label,
    allTime:
      key === "revenue"
        ? financial.allTime.revenue
        : key === "examCost"
          ? financial.allTime.examCost
          : key === "contaCost"
            ? financial.allTime.contaCost
            : financial.allTime.profit,
    thisMonth:
      key === "revenue"
        ? financial.thisMonth.revenue
        : key === "examCost"
          ? financial.thisMonth.examCost
          : key === "contaCost"
            ? financial.thisMonth.contaCost
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
  const { revenue, examCost, contaCost, profit } = period;

  return [
    { name: "Receita", value: Math.max(revenue, 0), color: DASHBOARD_CHART.revenue },
    {
      name: "Custo exames",
      value: Math.max(examCost, 0),
      color: DASHBOARD_CHART.examCost,
    },
    {
      name: "Custo contas",
      value: Math.max(contaCost, 0),
      color: DASHBOARD_CHART.contaCost,
    },
    { name: "Lucro", value: Math.max(profit, 0), color: DASHBOARD_CHART.profit },
  ].filter((item) => item.value > 0);
}

const PERIOD_LABELS: Record<string, string> = {
  allTime: "Todo o período",
  thisMonth: "Este mês",
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

function SummaryFinancialSection({
  financial,
  isLoading,
}: {
  financial?: IDashboardFinancial;
  isLoading?: boolean;
}) {
  if (isLoading) return <FinancialSkeleton />;
  if (!financial) return null;

  const comparisonData = buildPeriodComparison(financial);
  const compositionData = buildComposition(financial);
  const compositionLabel = resolveCompositionPeriod(financial).label;
  const activePeriod = resolveCompositionPeriod(financial).period;

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="col-span-12 gap-0 overflow-hidden rounded-md border border-border bg-white py-0 shadow-none lg:col-span-8">
        <div className="border-b border-border/60 px-5 py-4">
          <h3 className="font-semibold text-foreground">
            Comparativo financeiro
          </h3>
          <p className="text-sm text-muted-foreground">
            Receita, custos de exames e contas, e lucro — todo o período vs.
            mês atual
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
              <RechartsTooltip
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
                  value === "allTime" ? "Todo o período" : "Este mês"
                }
              />
              <Bar
                dataKey="allTime"
                name="allTime"
                fill={DASHBOARD_CHART.allTime}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
              <Bar
                dataKey="thisMonth"
                name="thisMonth"
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
            Custo total {formatCurrency(activePeriod.cost)} · Margem{" "}
            {activePeriod.marginPercent.toLocaleString("pt-BR", {
              maximumFractionDigits: 1,
            })}
            %
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
                <RechartsTooltip
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

const TOP_LIMIT = 5;

type RankingTab = "employees" | "links" | "revenue" | "exams";

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

function DashboardRankingsSection({
  summary,
  isLoading,
}: {
  summary?: IDashboardSummaryData;
  isLoading?: boolean;
}) {
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
              <RechartsTooltip
                formatter={(value) => [
                  formatValue(typeof value === "number" ? value : 0),
                  "Valor",
                ]}
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

const DISPLAY_LIMIT = 5;

function RecentEmployeeExamsSection({
  items,
  isLoading,
}: {
  items?: IDashboardRecentEmployeeExam[];
  isLoading?: boolean;
}) {
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

function DashboardSummary() {
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
        description="Pagamentos, operação e volume de vínculos"
      >
        <DashboardKpiRow
          totals={summary?.totals}
          payments={summary?.payments}
          financial={summary?.financial}
          isLoading={isLoading}
        />
        <DashboardSecondaryMetrics
          totals={summary?.totals}
          isLoading={isLoading}
        />
      </DashboardSection>

      <DashboardSection
        title="Análise financeira"
        description="Comparativo por período e distribuição receita, custo e lucro"
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

export default function Dashboard() {
  return (
    <PageLayout
      title="Dashboard"
      description="Panorama da operação com indicadores, gráficos financeiros e rankings em um só lugar."
    >
      <DashboardSummary />
    </PageLayout>
  );
}

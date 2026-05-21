import { formatCurrency } from "@/shared/helpers/format-currency.helper";

export function calculateExamProfit(price: number, cost: number): number {
  return Math.round((price - cost) * 100) / 100;
}

export function formatExamProfitLabel(price: number, cost: number): string {
  const profit = calculateExamProfit(price, cost);
  return `Lucro estimado: ${formatCurrency(profit)}`;
}

export type AccountStatus = "PENDING" | "PAID" | "OVERDUE";

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  OVERDUE: "Vencido",
};

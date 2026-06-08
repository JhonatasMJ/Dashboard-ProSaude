export type ContaStatus = "pendente" | "pago" | "vencido";

export const CONTA_STATUS_LABELS: Record<ContaStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
  vencido: "Vencido",
};

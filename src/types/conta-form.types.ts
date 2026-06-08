import type { ContaStatus } from "@/shared/types/conta-status.types";

export type ContaFormData = {
  nome: string;
  valor: string;
  dataVencimento: string;
  status: ContaStatus;
  dataPagamento: string;
};

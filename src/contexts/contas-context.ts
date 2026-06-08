import { createContext, useContext } from "react";
import type { IConta } from "@/shared/interfaces/https/conta";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import type { ContaStatus } from "@/shared/types/conta-status.types";
import type { ContasReportListParams } from "@/pdf/contas-report.types";
import type { ContaFormData } from "@/types/conta-form.types";

export interface ContasContextValue {
  contas: IConta[];
  meta: IPaginationMeta | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  nomeFilter: string;
  statusFilter: ContaStatus | "";
  dataVencimentoFromFilter: string;
  dataVencimentoToFilter: string;
  dataPagamentoFromFilter: string;
  dataPagamentoToFilter: string;
  exportListParams: ContasReportListParams;
  page: number;
  setNomeFilter: (value: string) => void;
  setStatusFilter: (value: ContaStatus | "") => void;
  setDataVencimentoFromFilter: (value: string) => void;
  setDataVencimentoToFilter: (value: string) => void;
  setDataPagamentoFromFilter: (value: string) => void;
  setDataPagamentoToFilter: (value: string) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  createConta: (data: ContaFormData) => Promise<void>;
  updateConta: (id: string, data: ContaFormData) => Promise<void>;
  deleteConta: (id: string) => Promise<void>;
}

export const ContasContext = createContext<ContasContextValue | null>(null);

export function useContas() {
  const context = useContext(ContasContext);

  if (!context) {
    throw new Error("useContas deve ser usado dentro de ContasProvider");
  }

  return context;
}

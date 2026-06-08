import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import type { ContaStatus } from "@/shared/types/conta-status.types";

export interface IConta {
  id: string;
  nome: string;
  valor: number;
  dataVencimento: string;
  dataPagamento: string | null;
  status: ContaStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IContasListParams {
  nome?: string;
  status?: ContaStatus;
  dataVencimentoFrom?: string;
  dataVencimentoTo?: string;
  dataPagamentoFrom?: string;
  dataPagamentoTo?: string;
  page?: number;
  pageSize?: number;
}

export interface IContasListResponse {
  data: IConta[];
  meta: IPaginationMeta;
}

export interface IContaResponse {
  data: IConta;
}

export interface IContaPayload {
  nome: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string | null;
  status: ContaStatus;
}

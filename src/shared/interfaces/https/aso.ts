import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import type { OccupationalRiskCategory } from "@/shared/types/occupational-risk-category.types";

export type AsoType =
  | "ADMISSIONAL"
  | "PERIODICO"
  | "RETORNO_AO_TRABALHO"
  | "MUDANCA_DE_RISCO"
  | "MONITORACAO_PONTUAL"
  | "DEMISSIONAL";

export const ASO_TYPES: AsoType[] = [
  "ADMISSIONAL",
  "PERIODICO",
  "RETORNO_AO_TRABALHO",
  "MUDANCA_DE_RISCO",
  "MONITORACAO_PONTUAL",
  "DEMISSIONAL",
];

export const ASO_TYPE_LABELS: Record<AsoType, string> = {
  ADMISSIONAL: "Admissional",
  PERIODICO: "Periódico",
  RETORNO_AO_TRABALHO: "Retorno ao trabalho",
  MUDANCA_DE_RISCO: "Mudança de risco",
  MONITORACAO_PONTUAL: "Monitoração pontual",
  DEMISSIONAL: "Demissional",
};

export interface IAsoCompanyRef {
  id: string;
  name: string;
}

export interface IAsoEmployeeRef {
  id: string;
  name: string;
  company: IAsoCompanyRef;
}

export interface IAsoExamRef {
  id: string;
  name: string;
  price: number;
  cost: number;
  profit: number;
  company: IAsoCompanyRef;
}

export interface IAsoOccupationalRiskRef {
  id: string;
  category: OccupationalRiskCategory;
  description: string;
}

export interface IAso {
  id: string;
  type: AsoType;
  date: string;
  employee: IAsoEmployeeRef;
  exams: IAsoExamRef[];
  occupationalRisks: IAsoOccupationalRiskRef[];
  createdAt: string;
  updatedAt: string;
}

export interface IAsosListParams {
  employeeId?: string;
  type?: AsoType;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface IAsosListResponse {
  data: IAso[];
  meta: IPaginationMeta;
}

export interface IAsoResponse {
  data: IAso;
}

export interface IAsoCreatePayload {
  type: AsoType;
  date: string;
  employee: { id: string };
  exams: { id: string }[];
  occupationalRisks: { id: string }[];
}

export interface IAsoUpdatePayload {
  type?: AsoType;
  date?: string;
  employee?: { id: string };
  exams?: { id: string }[];
  occupationalRisks?: { id: string }[];
}

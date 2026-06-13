import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import type { OccupationalRiskCategory } from "@/shared/types/occupational-risk-category.types";
import type { AsoType } from "@/shared/types/aso-type.types";

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

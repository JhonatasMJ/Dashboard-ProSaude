import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";

export interface IExamCompanyRef {
  id: string;
  name: string;
}

export interface IExam {
  id: string;
  name: string;
  company: IExamCompanyRef;
  price: number;
  cost: number;
  profit: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IExamsListParams {
  name?: string;
  companyId?: string;
  page?: number;
  pageSize?: number;
}

export interface IExamsListResponse {
  data: IExam[];
  meta: IPaginationMeta;
}

export interface IExamResponse {
  data: IExam;
}

export interface IExamCreatePayload {
  company: { id: string };
  name: string;
  price: number;
  cost?: number;
  notes?: string | null;
}

export interface IExamUpdatePayload {
  company?: { id: string };
  name?: string;
  price?: number;
  cost?: number;
  notes?: string | null;
}

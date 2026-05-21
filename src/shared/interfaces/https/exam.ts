export interface IExamCompanyRef {
  id: string;
  name: string;
}

import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";

export interface IExam {
  id: string;
  name: string;
  price: number;
  notes: string | null;
  company: IExamCompanyRef;
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
  notes?: string | null;
}

export interface IExamUpdatePayload {
  name?: string;
  price?: number;
  notes?: string | null;
}

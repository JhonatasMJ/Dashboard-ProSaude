import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";

export interface IExam {
  id: string;
  name: string;
  price: number;
  cost: number;
  profit: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IExamsListParams {
  name?: string;
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
  name: string;
  price: number;
  cost: number;
  notes?: string | null;
}

export interface IExamUpdatePayload {
  name?: string;
  price?: number;
  cost?: number;
  notes?: string | null;
}

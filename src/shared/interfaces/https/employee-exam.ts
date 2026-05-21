import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";

export interface IEmployeeExamCompanyRef {
  id: string;
  name: string;
}

export interface IEmployeeExamEmployeeRef {
  id: string;
  name: string;
  company: IEmployeeExamCompanyRef;
}

export interface IEmployeeExamExamRef {
  id: string;
  name: string;
  price: number;
  cost: number;
  profit: number;
}

export interface IEmployeeExam {
  id: string;
  professionalName: string;
  examDate: string;
  examTime: string;
  employee: IEmployeeExamEmployeeRef;
  exam: IEmployeeExamExamRef;
  createdAt: string;
  updatedAt: string;
}

export interface IEmployeeExamsListParams {
  professionalName?: string;
  employeeId?: string;
  examId?: string;
  companyId?: string;
  examDateFrom?: string;
  examDateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface IEmployeeExamsListResponse {
  data: IEmployeeExam[];
  meta: IPaginationMeta;
}

export interface IEmployeeExamResponse {
  data: IEmployeeExam;
}

export interface IEmployeeExamCreatePayload {
  employee: { id: string };
  exam: { id: string };
  professionalName: string;
  examDate: string;
  examTime: string;
}

export interface IEmployeeExamUpdatePayload {
  employee?: { id: string };
  exam?: { id: string };
  professionalName?: string;
  examDate?: string;
  examTime?: string;
}

import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";

export interface IEmployeeCompanyRef {
  id: string;
  name: string;
}

export interface IEmployee {
  id: string;
  name: string;
  documentNumber: string;
  jobTitle: string | null;
  birthDate: string | null;
  active: boolean;
  company: IEmployeeCompanyRef;
  createdAt: string;
  updatedAt: string;
}

export interface IEmployeesListParams {
  name?: string;
  companyId?: string;
  page?: number;
  pageSize?: number;
}

export interface IEmployeesListResponse {
  data: IEmployee[];
  meta: IPaginationMeta;
}

export interface IEmployeeResponse {
  data: IEmployee;
}

export interface IEmployeeCreatePayload {
  companyId: string;
  name: string;
  documentNumber: string;
  jobTitle?: string | null;
  birthDate?: string | null;
  active?: boolean;
}

export interface IEmployeeUpdatePayload {
  name?: string;
  documentNumber?: string;
  jobTitle?: string | null;
  birthDate?: string | null;
  active?: boolean;
}

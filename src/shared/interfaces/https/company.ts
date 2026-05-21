import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";

export interface ICompany {
  id: string;
  name: string;
  taxId: string;
  email: string;
  phone: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICompaniesListParams {
  name?: string;
  page?: number;
  pageSize?: number;
}

export interface ICompaniesListResponse {
  data: ICompany[];
  meta: IPaginationMeta;
}

export interface ICompanyResponse {
  data: ICompany;
}

export interface ICompanyPayload {
  name: string;
  taxId: string;
  email: string;
  phone: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
}

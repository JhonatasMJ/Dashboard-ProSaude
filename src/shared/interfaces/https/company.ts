export interface ICompany {
  id: string;
  legalName: string;
  tradeName: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICompaniesListResponse {
  data: ICompany[];
}

export interface ICompanyResponse {
  data: ICompany;
}

export interface ICompanyPayload {
  legalName: string;
  tradeName: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
}

import { createContext } from "react";
import type { ICompany } from "@/shared/interfaces/https/company";
import type { IEmployee } from "@/shared/interfaces/https/employee";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import type { EmployeeFormData } from "@/types/employee-form.types";

export interface EmployeesContextValue {
  employees: IEmployee[];
  meta: IPaginationMeta | null;
  companies: ICompany[];
  isLoading: boolean;
  isLoadingFilters: boolean;
  isSubmitting: boolean;
  error: string | null;
  nameFilter: string;
  companyIdFilter: string;
  page: number;
  setNameFilter: (value: string) => void;
  setCompanyIdFilter: (value: string) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  createEmployee: (data: EmployeeFormData) => Promise<void>;
  updateEmployee: (id: string, data: EmployeeFormData) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
}

export const EmployeesContext = createContext<EmployeesContextValue | null>(
  null
);

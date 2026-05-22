import { createContext, useContext } from "react";
import type { ICompany } from "@/shared/interfaces/https/company";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import type { CompanyFormData } from "@/types/company-form.types";

export interface CompaniesContextValue {
  companies: ICompany[];
  meta: IPaginationMeta | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  nameFilter: string;
  page: number;
  setNameFilter: (value: string) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  createCompany: (data: CompanyFormData) => Promise<void>;
  updateCompany: (id: string, data: CompanyFormData) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
}

export const CompaniesContext = createContext<CompaniesContextValue | null>(
  null
);

export function useCompanies() {
  const context = useContext(CompaniesContext);

  if (!context) {
    throw new Error("useCompanies deve ser usado dentro de CompaniesProvider");
  }

  return context;
}

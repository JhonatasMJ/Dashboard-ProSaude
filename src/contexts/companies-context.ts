import { createContext } from "react";
import type {
  ICompany,
  ICompanyPayload,
} from "@/shared/interfaces/https/company";

export interface CompaniesContextValue {
  companies: ICompany[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createCompany: (payload: ICompanyPayload) => Promise<void>;
  updateCompany: (id: string, payload: ICompanyPayload) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
}

export const CompaniesContext = createContext<CompaniesContextValue | null>(
  null
);

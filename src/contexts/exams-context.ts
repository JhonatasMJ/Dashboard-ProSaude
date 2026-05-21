import { createContext } from "react";
import type { ICompany } from "@/shared/interfaces/https/company";
import type { IExam } from "@/shared/interfaces/https/exam";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import type { ExamFormData } from "@/types/exam-form.types";

export interface ExamsContextValue {
  exams: IExam[];
  meta: IPaginationMeta | null;
  companies: ICompany[];
  isLoading: boolean;
  isLoadingCompanies: boolean;
  isSubmitting: boolean;
  error: string | null;
  nameFilter: string;
  companyIdFilter: string;
  page: number;
  setNameFilter: (value: string) => void;
  setCompanyIdFilter: (value: string) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  createExam: (data: ExamFormData) => Promise<void>;
  updateExam: (id: string, data: ExamFormData) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
}

export const ExamsContext = createContext<ExamsContextValue | null>(null);

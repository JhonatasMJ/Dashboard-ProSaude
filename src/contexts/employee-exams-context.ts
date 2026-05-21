import { createContext } from "react";
import type { ICompany } from "@/shared/interfaces/https/company";
import type { IEmployee } from "@/shared/interfaces/https/employee";
import type { IEmployeeExam } from "@/shared/interfaces/https/employee-exam";
import type { IExam } from "@/shared/interfaces/https/exam";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import type { EmployeeExamFormData } from "@/types/employee-exam-form.types";

export interface EmployeeExamsContextValue {
  links: IEmployeeExam[];
  meta: IPaginationMeta | null;
  companies: ICompany[];
  employees: IEmployee[];
  exams: IExam[];
  isLoading: boolean;
  isLoadingFilters: boolean;
  isSubmitting: boolean;
  error: string | null;
  professionalNameFilter: string;
  companyIdFilter: string;
  employeeIdFilter: string;
  examIdFilter: string;
  examDateFromFilter: string;
  examDateToFilter: string;
  page: number;
  setProfessionalNameFilter: (value: string) => void;
  setCompanyIdFilter: (value: string) => void;
  setEmployeeIdFilter: (value: string) => void;
  setExamIdFilter: (value: string) => void;
  setExamDateFromFilter: (value: string) => void;
  setExamDateToFilter: (value: string) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  createLink: (data: EmployeeExamFormData) => Promise<void>;
  updateLink: (id: string, data: EmployeeExamFormData) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
}

export const EmployeeExamsContext =
  createContext<EmployeeExamsContextValue | null>(null);

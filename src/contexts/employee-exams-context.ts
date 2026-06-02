import { createContext, useContext } from "react";
import type { ICompany } from "@/shared/interfaces/https/company";
import type { IEmployee } from "@/shared/interfaces/https/employee";
import type { IEmployeeExam } from "@/shared/interfaces/https/employee-exam";
import type { IExam } from "@/shared/interfaces/https/exam";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import type { EmployeeExamsReportListParams } from "@/pdf/employee-exams-report.types";
import type { PaymentStatus } from "@/shared/types/payment-status.types";
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
  paymentStatusFilter: PaymentStatus | "";
  examDateFromFilter: string;
  examDateToFilter: string;
  exportListParams: EmployeeExamsReportListParams;
  page: number;
  setProfessionalNameFilter: (value: string) => void;
  setCompanyIdFilter: (value: string) => void;
  setEmployeeIdFilter: (value: string) => void;
  setExamIdFilter: (value: string) => void;
  setPaymentStatusFilter: (value: PaymentStatus | "") => void;
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

export function useEmployeeExams() {
  const context = useContext(EmployeeExamsContext);

  if (!context) {
    throw new Error(
      "useEmployeeExams deve ser usado dentro de EmployeeExamsProvider"
    );
  }

  return context;
}

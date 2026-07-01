import type { IEmployeeExamsListParams } from "@/shared/interfaces/https/employee-exam";

export type EmployeeExamsReportListParams = Omit<
  IEmployeeExamsListParams,
  "page" | "pageSize"
>;

export interface EmployeeExamsReportFilterLookups {
  companies: { id: string; name: string }[];
  employees: { id: string; name: string }[];
  exams: { id: string; name: string }[];
}

export interface GenerateEmployeeExamsReportPdfInput {
  filterSummary: string[];
  examValueMode: EmployeeExamsReportExamValueMode;
  includeProfessionalColumn?: boolean;
  generatedAt?: Date;
}

export type EmployeeExamsReportExamValueMode = "price" | "cost";

export function resolveEmployeeExamsReportExamValueMode(
  params: EmployeeExamsReportListParams
): EmployeeExamsReportExamValueMode {
  return params.professionalName?.trim() ? "cost" : "price";
}

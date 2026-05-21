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
  generatedAt?: Date;
}

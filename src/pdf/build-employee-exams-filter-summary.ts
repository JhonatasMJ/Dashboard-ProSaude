import { dateOnlyToBrDateInput } from "@/shared/helpers/date.helper";
import type {
  EmployeeExamsReportFilterLookups,
  EmployeeExamsReportListParams,
} from "@/pdf/employee-exams-report.types";

export function buildEmployeeExamsFilterSummary(
  params: EmployeeExamsReportListParams,
  lookups: EmployeeExamsReportFilterLookups
): string[] {
  const lines: string[] = [];

  if (params.professionalName) {
    lines.push(`Profissional: contém "${params.professionalName}"`);
  }

  if (params.companyId) {
    const company = lookups.companies.find((item) => item.id === params.companyId);
    lines.push(`Empresa: ${company?.name ?? params.companyId}`);
  }

  if (params.employeeId) {
    const employee = lookups.employees.find(
      (item) => item.id === params.employeeId
    );
    lines.push(`Funcionário: ${employee?.name ?? params.employeeId}`);
  }

  if (params.examId) {
    const exam = lookups.exams.find((item) => item.id === params.examId);
    lines.push(`Exame: ${exam?.name ?? params.examId}`);
  }

  if (params.examDateFrom) {
    lines.push(`Data do exame (de): ${dateOnlyToBrDateInput(params.examDateFrom)}`);
  }

  if (params.examDateTo) {
    lines.push(`Data do exame (até): ${dateOnlyToBrDateInput(params.examDateTo)}`);
  }

  if (params.paymentStatus === "PENDING") {
    lines.push("Status: Pendente");
  } else if (params.paymentStatus === "PAID") {
    lines.push("Status: Pago");
  }

  if (lines.length === 0) {
    lines.push("Nenhum filtro aplicado (todos os vínculos)");
  }

  return lines;
}

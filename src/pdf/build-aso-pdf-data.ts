import { fetchAllPaginated } from "@/shared/helpers/fetch-all-paginated.helper";
import { formatCpf } from "@/shared/helpers/cpf.helper";
import { formatDateBr } from "@/shared/helpers/date.helper";
import { formatCnpj } from "@/shared/helpers/input-masks.helper";
import type { IAso } from "@/shared/interfaces/https/aso";
import type { IEmployee } from "@/shared/interfaces/https/employee";
import { companyService } from "@/shared/services/company.service";
import type { AsoPdfData } from "@/pdf/aso-pdf.types";

export async function buildAsoPdfData(
  aso: IAso,
  employees: IEmployee[]
): Promise<AsoPdfData> {
  const employee =
    employees.find((item) => item.id === aso.employee.id) ?? null;

  const companies = await fetchAllPaginated((page, pageSize) =>
    companyService.list({ page, pageSize })
  );
  const company = companies.find(
    (item) => item.id === aso.employee.company.id
  );

  return {
    aso,
    employeeName: employee?.name ?? aso.employee.name,
    employeeCpf: employee?.documentNumber
      ? formatCpf(employee.documentNumber)
      : "—",
    employeeBirthDate: employee?.birthDate
      ? formatDateBr(employee.birthDate)
      : "—",
    employeeJobTitle: employee?.jobTitle?.trim() || "—",
    companyName: company?.name ?? aso.employee.company.name,
    companyTaxId: company?.taxId ? formatCnpj(company.taxId) : "—",
  };
}

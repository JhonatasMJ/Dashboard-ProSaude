import { formatCpf, stripCpf } from "@/shared/helpers/cpf.helper";
import { brDateInputToIso, isoToBrDateInput } from "@/shared/helpers/date.helper";
import type {
  IEmployee,
  IEmployeeCreatePayload,
  IEmployeeUpdatePayload,
} from "@/shared/interfaces/https/employee";
import type { EmployeeFormData } from "@/types/employee-form.types";

export function employeeToFormValues(employee: IEmployee): EmployeeFormData {
  return {
    companyId: employee.company.id,
    name: employee.name,
    documentNumber: formatCpf(employee.documentNumber),
    jobTitle: employee.jobTitle ?? "",
    birthDate: isoToBrDateInput(employee.birthDate),
    active: employee.active,
  };
}

export function formToEmployeeCreatePayload(
  data: EmployeeFormData
): IEmployeeCreatePayload {
  return {
    companyId: data.companyId,
    name: data.name.trim(),
    documentNumber: stripCpf(data.documentNumber),
    jobTitle: data.jobTitle?.trim() ? data.jobTitle.trim() : null,
    birthDate: brDateInputToIso(data.birthDate),
    active: data.active,
  };
}

export function formToEmployeeUpdatePayload(
  data: EmployeeFormData
): IEmployeeUpdatePayload {
  return {
    name: data.name.trim(),
    documentNumber: stripCpf(data.documentNumber),
    jobTitle: data.jobTitle?.trim() ? data.jobTitle.trim() : null,
    birthDate: brDateInputToIso(data.birthDate),
    active: data.active,
  };
}

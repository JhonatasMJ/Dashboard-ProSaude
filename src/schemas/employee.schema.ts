import * as yup from "yup";
import { formatCpf, isValidCpfLength, stripCpf } from "@/shared/helpers/cpf.helper";
import { brDateInputToIso, isValidBrDateInput, isoToBrDateInput } from "@/shared/helpers/date.helper";
import type {
  IEmployee,
  IEmployeeCreatePayload,
  IEmployeeUpdatePayload,
} from "@/shared/interfaces/https/employee";

export const employeeSchema = yup.object({
  companyId: yup.string().required("Empresa é obrigatória"),
  name: yup
    .string()
    .required("Nome é obrigatório")
    .min(2, "Informe pelo menos 2 caracteres"),
  documentNumber: yup
    .string()
    .required("CPF é obrigatório")
    .test("cpf-length", "Informe um CPF válido com 11 dígitos", (value) =>
      isValidCpfLength(value ?? "")
    ),
  jobTitle: yup.string().default(""),
  birthDate: yup
    .string()
    .required("Data de nascimento é obrigatória")
    .test("valid-date", "Informe uma data válida (DD/MM/AAAA)", (value) =>
      isValidBrDateInput(value)
    ),
  active: yup.boolean().default(true),
});

export type EmployeeFormData = yup.InferType<typeof employeeSchema>;

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

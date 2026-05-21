import * as yup from "yup";
import { isValidCpfLength } from "@/shared/helpers/cpf.helper";
import { isValidBrDateInput } from "@/shared/helpers/date.helper";

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

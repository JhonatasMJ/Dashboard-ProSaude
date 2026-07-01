import * as yup from "yup";
import {
  formatTaxId,
  isValidTaxIdLength,
} from "@/shared/helpers/input-masks.helper";
import type { ICompany, ICompanyPayload } from "@/shared/interfaces/https/company";

export const companySchema = yup.object({
  name: yup.string().required("Nome da empresa é obrigatório"),
  taxId: yup
    .string()
    .required("CPF ou CNPJ é obrigatório")
    .test(
      "tax-id-length",
      "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido",
      (value) => isValidTaxIdLength(value ?? "")
    ),
  email: yup
    .string()
    .optional()
    .default("")
    .test(
      "valid-email",
      "Informe um e-mail válido",
      (value) => !value?.trim() || yup.string().email().isValidSync(value)
    ),
  phone: yup.string().default(""),
  zipCode: yup.string().default(""),
  street: yup.string().default(""),
  number: yup.string().default(""),
  neighborhood: yup.string().default(""),
  city: yup.string().default(""),
  state: yup
    .string()
    .default("")
    .test(
      "valid-state",
      "Informe a sigla do estado (ex: SP)",
      (value) => !value?.trim() || value.trim().length === 2
    ),
});

export type CompanyFormData = yup.InferType<typeof companySchema>;

export function companyToFormValues(company: ICompany): CompanyFormData {
  return {
    name: company.name,
    taxId: formatTaxId(company.taxId),
    email: company.email ?? "",
    phone: company.phone,
    zipCode: "",
    street: company.street,
    number: company.number,
    neighborhood: company.neighborhood,
    city: company.city,
    state: company.state,
  };
}

export function formToCompanyPayload(data: CompanyFormData): ICompanyPayload {
  const email = data.email?.trim();

  return {
    name: data.name.trim(),
    taxId: data.taxId.trim(),
    ...(email ? { email } : {}),
    phone: data.phone?.trim() ?? "",
    street: data.street?.trim() ?? "",
    number: data.number?.trim() ?? "",
    neighborhood: data.neighborhood?.trim() ?? "",
    city: data.city?.trim() ?? "",
    state: data.state?.trim() ? data.state.trim().toUpperCase() : "",
  };
}

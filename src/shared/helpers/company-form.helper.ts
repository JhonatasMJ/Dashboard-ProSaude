import type { ICompany, ICompanyPayload } from "@/shared/interfaces/https/company";
import type { CompanyFormData } from "@/types/company-form.types";

export function companyToFormValues(company: ICompany): CompanyFormData {
  return {
    name: company.name,
    taxId: company.taxId,
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

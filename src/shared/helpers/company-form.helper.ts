import type { ICompany, ICompanyPayload } from "@/shared/interfaces/https/company";
import type { CompanyFormData } from "@/types/company-form.types";

export function companyToFormValues(company: ICompany): CompanyFormData {
  return {
    name: company.name,
    taxId: company.taxId,
    email: company.email,
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
  return {
    name: data.name,
    taxId: data.taxId,
    email: data.email,
    phone: data.phone,
    street: data.street,
    number: data.number,
    neighborhood: data.neighborhood,
    city: data.city,
    state: data.state.toUpperCase(),
  };
}

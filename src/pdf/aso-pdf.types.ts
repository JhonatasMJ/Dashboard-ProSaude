import type { IAso } from "@/shared/interfaces/https/aso";

export interface AsoPdfData {
  aso: IAso;
  employeeName: string;
  employeeCpf: string;
  employeeBirthDate: string;
  employeeJobTitle: string;
  companyName: string;
  companyTaxId: string;
}

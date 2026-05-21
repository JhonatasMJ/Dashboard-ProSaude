import { useContext } from "react";
import { CompaniesContext } from "@/contexts/companies-context";

export function useCompanies() {
  const context = useContext(CompaniesContext);

  if (!context) {
    throw new Error("useCompanies deve ser usado dentro de CompaniesProvider");
  }

  return context;
}

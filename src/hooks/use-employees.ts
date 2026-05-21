import { useContext } from "react";
import { EmployeesContext } from "@/contexts/employees-context";

export function useEmployees() {
  const context = useContext(EmployeesContext);

  if (!context) {
    throw new Error("useEmployees deve ser usado dentro de EmployeesProvider");
  }

  return context;
}

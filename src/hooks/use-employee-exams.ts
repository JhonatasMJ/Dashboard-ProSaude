import { useContext } from "react";
import { EmployeeExamsContext } from "@/contexts/employee-exams-context";

export function useEmployeeExams() {
  const context = useContext(EmployeeExamsContext);

  if (!context) {
    throw new Error(
      "useEmployeeExams deve ser usado dentro de EmployeeExamsProvider"
    );
  }

  return context;
}

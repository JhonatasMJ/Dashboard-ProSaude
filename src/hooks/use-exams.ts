import { useContext } from "react";
import { ExamsContext } from "@/contexts/exams-context";

export function useExams() {
  const context = useContext(ExamsContext);

  if (!context) {
    throw new Error("useExams deve ser usado dentro de ExamsProvider");
  }

  return context;
}

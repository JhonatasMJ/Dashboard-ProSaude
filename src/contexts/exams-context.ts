import { createContext, useContext } from "react";
import type { IExam } from "@/shared/interfaces/https/exam";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import type { ExamFormData } from "@/types/exam-form.types";

export interface ExamsContextValue {
  exams: IExam[];
  meta: IPaginationMeta | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  nameFilter: string;
  page: number;
  setNameFilter: (value: string) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  createExam: (data: ExamFormData) => Promise<void>;
  updateExam: (id: string, data: ExamFormData) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
}

export const ExamsContext = createContext<ExamsContextValue | null>(null);

export function useExams() {
  const context = useContext(ExamsContext);

  if (!context) {
    throw new Error("useExams deve ser usado dentro de ExamsProvider");
  }

  return context;
}

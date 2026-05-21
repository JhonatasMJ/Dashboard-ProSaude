import {
  formatNumberToPriceInput,
  parsePriceInputToNumber,
} from "@/shared/helpers/currency-input.helper";
import type {
  IExam,
  IExamCreatePayload,
  IExamUpdatePayload,
} from "@/shared/interfaces/https/exam";
import type { ExamFormData } from "@/types/exam-form.types";

export function examToFormValues(exam: IExam): ExamFormData {
  return {
    companyId: exam.company.id,
    name: exam.name,
    price: formatNumberToPriceInput(exam.price),
    notes: exam.notes ?? "",
  };
}

export function formToExamCreatePayload(data: ExamFormData): IExamCreatePayload {
  return {
    company: { id: data.companyId },
    name: data.name,
    price: parsePriceInputToNumber(data.price),
    notes: data.notes?.trim() ? data.notes.trim() : null,
  };
}

export function formToExamUpdatePayload(data: ExamFormData): IExamUpdatePayload {
  return {
    name: data.name,
    price: parsePriceInputToNumber(data.price),
    notes: data.notes?.trim() ? data.notes.trim() : null,
  };
}

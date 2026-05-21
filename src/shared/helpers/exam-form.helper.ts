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
    name: exam.name,
    price: formatNumberToPriceInput(exam.price),
    cost: formatNumberToPriceInput(exam.cost),
    notes: exam.notes ?? "",
  };
}

export function formToExamCreatePayload(data: ExamFormData): IExamCreatePayload {
  return {
    name: data.name.trim(),
    price: parsePriceInputToNumber(data.price),
    cost: parsePriceInputToNumber(data.cost),
    notes: data.notes?.trim() ? data.notes.trim() : null,
  };
}

export function formToExamUpdatePayload(data: ExamFormData): IExamUpdatePayload {
  return {
    name: data.name.trim(),
    price: parsePriceInputToNumber(data.price),
    cost: parsePriceInputToNumber(data.cost),
    notes: data.notes?.trim() ? data.notes.trim() : null,
  };
}

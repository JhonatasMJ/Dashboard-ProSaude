import {
  extractPriceDigits,
  formatNumberToPriceInput,
  parsePriceInputToNumber,
} from "@/shared/helpers/currency-input.helper";
import { isAllCompaniesExamSelection } from "@/shared/constants/exam.constants";
import type {
  IExam,
  IExamCreatePayload,
  IExamUpdatePayload,
} from "@/shared/interfaces/https/exam";
import type { ExamFormData } from "@/types/exam-form.types";

function parseCostInput(value: string | undefined): number {
  const digits = extractPriceDigits(value ?? "");
  if (!digits) {
    return 0;
  }

  const amount = parsePriceInputToNumber(value);
  return Number.isNaN(amount) ? 0 : amount;
}

function buildExamFields(data: ExamFormData) {
  return {
    name: data.name.trim(),
    price: parsePriceInputToNumber(data.price),
    cost: parseCostInput(data.cost),
    notes: data.notes?.trim() ? data.notes.trim() : null,
  };
}

export function examToFormValues(exam: IExam): ExamFormData {
  return {
    companyId: exam.company.id,
    name: exam.name,
    price: formatNumberToPriceInput(exam.price),
    cost: exam.cost > 0 ? formatNumberToPriceInput(exam.cost) : "",
    notes: exam.notes ?? "",
  };
}

export function formToExamCreatePayload(
  data: ExamFormData,
  companyId: string
): IExamCreatePayload {
  return {
    company: { id: companyId },
    ...buildExamFields(data),
  };
}

export function formToExamCreatePayloads(
  data: ExamFormData,
  companyIds: string[]
): IExamCreatePayload[] {
  return companyIds.map((companyId) =>
    formToExamCreatePayload(data, companyId)
  );
}

export function formToExamUpdatePayload(data: ExamFormData): IExamUpdatePayload {
  const payload: IExamUpdatePayload = buildExamFields(data);

  if (!isAllCompaniesExamSelection(data.companyId)) {
    payload.company = { id: data.companyId };
  }

  return payload;
}

import * as yup from "yup";
import { isAllCompaniesExamSelection } from "@/shared/constants/exam.constants";
import {
  extractPriceDigits,
  formatNumberToPriceInput,
  isValidPriceInput,
  MAX_EXAM_PRICE,
  parsePriceInputToNumber,
} from "@/shared/helpers/currency-input.helper";
import type {
  IExam,
  IExamCreatePayload,
  IExamUpdatePayload,
} from "@/shared/interfaces/https/exam";

const priceFieldSchema = (label: string) =>
  yup
    .string()
    .required(`${label} é obrigatório`)
    .test("valid-price", `Informe um ${label.toLowerCase()} válido`, (value) =>
      isValidPriceInput(value)
    )
    .test("positive", `O ${label.toLowerCase()} deve ser maior que zero`, (value) => {
      const amount = parsePriceInputToNumber(value);
      return !Number.isNaN(amount) && amount > 0;
    })
    .test(
      "max-price",
      `O valor máximo é R$ ${MAX_EXAM_PRICE.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      (value) => {
        const amount = parsePriceInputToNumber(value);
        return !Number.isNaN(amount) && amount <= MAX_EXAM_PRICE;
      }
    );

const optionalCostFieldSchema = yup
  .string()
  .default("")
  .test("valid-cost", "Informe um custo válido", (value) => {
    if (!value?.trim()) return true;
    return isValidPriceInput(value);
  })
  .test("max-cost", "O custo não pode ser negativo", (value) => {
    if (!value?.trim()) return true;
    const amount = parsePriceInputToNumber(value);
    return !Number.isNaN(amount) && amount >= 0;
  })
  .test(
    "max-cost-value",
    `O valor máximo é R$ ${MAX_EXAM_PRICE.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    (value) => {
      if (!value?.trim()) return true;
      const amount = parsePriceInputToNumber(value);
      return !Number.isNaN(amount) && amount <= MAX_EXAM_PRICE;
    }
  );

export const examSchema = yup.object({
  companyId: yup.string().required("Empresa é obrigatória"),
  name: yup
    .string()
    .required("Nome do exame é obrigatório")
    .min(2, "Informe pelo menos 2 caracteres"),
  price: priceFieldSchema("Preço"),
  cost: optionalCostFieldSchema,
  notes: yup.string().default(""),
});

export type ExamFormData = yup.InferType<typeof examSchema>;

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

import * as yup from "yup";
import {
  brDateInputToDateOnly,
  dateOnlyToBrDateInput,
  isValidBrDateInput,
  parseDateOnlyInput,
} from "@/shared/helpers/date.helper";
import {
  dateOnlyToPaidAtIso,
  isoToDateOnly,
  normalizeToDateOnly,
} from "@/shared/helpers/date.helper";
import {
  formatNumberToPriceInput,
  isValidPriceInput,
  MAX_EXAM_PRICE,
  parsePriceInputToNumber,
} from "@/shared/helpers/currency-input.helper";
import type {
  IEmployeeExam,
  IEmployeeExamCreatePayload,
  IEmployeeExamUpdatePayload,
} from "@/shared/interfaces/https/employee-exam";

const EXAM_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_EXAM_CENTS = Math.round(MAX_EXAM_PRICE * 100);

export type EmployeeExamPaymentMode = "single" | "installments";

export function isValidPaidAtInput(value: string | undefined): boolean {
  const dateOnly = normalizeToDateOnly(value);
  if (!dateOnly) return false;

  const date = parseDateOnlyInput(dateOnly);
  if (!date) return false;

  return date <= new Date();
}

const installmentItemSchema = yup.object({
  amount: yup.string().default(""),
});

export const employeeExamSchema = yup.object({
  employeeId: yup.string().required("Funcionário é obrigatório"),
  examIds: yup
    .array()
    .of(yup.string().defined())
    .min(1, "Selecione pelo menos um exame")
    .required(),
  professionalName: yup
    .string()
    .required("Nome do profissional é obrigatório")
    .min(2, "Informe pelo menos 2 caracteres"),
  examDate: yup
    .string()
    .required("Data do exame é obrigatória")
    .test("valid-date", "Informe uma data válida (DD/MM/AAAA)", (value) =>
      isValidBrDateInput(value)
    ),
  examTime: yup
    .string()
    .default("")
    .test("valid-time", "Informe a hora no formato HH:mm", (value) => {
      const trimmed = value?.trim();
      if (!trimmed) return true;
      return EXAM_TIME_PATTERN.test(trimmed);
    }),
  paymentMode: yup
    .mixed<EmployeeExamPaymentMode>()
    .oneOf(["single", "installments"])
    .default("single")
    .test(
      "single-exam-for-installments",
      "Selecione apenas 1 exame para parcelar o pagamento",
      function (value) {
        if (value !== "installments") return true;
        const examIds = this.parent.examIds as string[] | undefined;
        return (examIds?.length ?? 0) === 1;
      }
    ),
  paymentStatus: yup
    .mixed<"PENDING" | "PAID">()
    .oneOf(["PENDING", "PAID"], "Status inválido")
    .default("PENDING")
    .when("paymentMode", {
      is: "single",
      then: (schema) => schema.required("Status é obrigatório"),
    }),
  paidAt: yup
    .string()
    .default("")
    .when(["paymentMode", "paymentStatus"], {
      is: (paymentMode: EmployeeExamPaymentMode, paymentStatus: string) =>
        paymentMode === "single" && paymentStatus === "PAID",
      then: (schema) =>
        schema
          .required("Data de pagamento é obrigatória")
          .test(
            "valid-paid-at",
            "Informe uma data de pagamento válida",
            (value) => isValidPaidAtInput(value)
          ),
      otherwise: (schema) => schema.default(""),
    }),
  installments: yup
    .array()
    .of(installmentItemSchema)
    .default([])
    .when("paymentMode", {
      is: "installments",
      then: (schema) =>
        schema
          .min(2, "Informe pelo menos 2 parcelas")
          .max(12, "Máximo de 12 parcelas")
          .test(
            "valid-installments",
            "Preencha um valor válido em todas as parcelas",
            (items) =>
              (items ?? []).every(
                (item) =>
                  isValidPriceInput(item?.amount, MAX_EXAM_PRICE) &&
                  parsePriceInputToNumber(item?.amount, MAX_EXAM_CENTS) > 0
              )
          ),
    }),
});

export type EmployeeExamFormData = yup.InferType<typeof employeeExamSchema>;

export function employeeExamToFormValues(
  link: IEmployeeExam
): EmployeeExamFormData {
  const hasInstallments = link.installments.length > 0;

  return {
    employeeId: link.employee.id,
    examIds: [link.exam.id],
    professionalName: link.professionalName,
    examDate: dateOnlyToBrDateInput(link.examDate),
    examTime: link.examTime ?? "",
    paymentMode: hasInstallments ? "installments" : "single",
    paymentStatus: link.paymentStatus ?? "PENDING",
    paidAt: isoToDateOnly(link.paidAt),
    installments: hasInstallments
      ? link.installments.map((installment) => ({
          amount: formatNumberToPriceInput(installment.amount, MAX_EXAM_CENTS),
        }))
      : [],
  };
}

function formToPaymentFields(
  data: EmployeeExamFormData
): Pick<IEmployeeExamCreatePayload, "paymentStatus"> &
  Partial<Pick<IEmployeeExamCreatePayload, "paidAt">> {
  if (data.paymentStatus === "PAID") {
    const dateOnly = normalizeToDateOnly(data.paidAt);
    if (!dateOnly) {
      throw new Error("Data de pagamento inválida");
    }

    return {
      paymentStatus: "PAID",
      paidAt: dateOnlyToPaidAtIso(dateOnly),
    };
  }

  return {
    paymentStatus: "PENDING",
  };
}

function formToEmployeeExamSharedFields(data: EmployeeExamFormData) {
  const examDate = brDateInputToDateOnly(data.examDate);
  if (!examDate) {
    throw new Error("Data do exame inválida");
  }

  const trimmedTime = data.examTime.trim();

  return {
    employee: { id: data.employeeId },
    professionalName: data.professionalName.trim(),
    examDate,
    ...(trimmedTime ? { examTime: trimmedTime } : {}),
  };
}

export function formToEmployeeExamCreatePayloads(
  data: EmployeeExamFormData
): IEmployeeExamCreatePayload[] {
  const shared = formToEmployeeExamSharedFields(data);

  if (data.paymentMode === "installments") {
    const examId = data.examIds[0];
    if (!examId) {
      throw new Error("Exame é obrigatório");
    }

    const installments = data.installments.map((item) => {
      const amount = parsePriceInputToNumber(item.amount, MAX_EXAM_CENTS);

      if (Number.isNaN(amount)) {
        throw new Error("Parcela inválida");
      }

      return { amount };
    });

    return [
      {
        ...shared,
        exam: { id: examId },
        installments,
      },
    ];
  }

  return data.examIds.map((examId) => ({
    ...shared,
    exam: { id: examId },
    ...formToPaymentFields(data),
  }));
}

export function formToEmployeeExamUpdatePayload(
  data: EmployeeExamFormData
): IEmployeeExamUpdatePayload {
  const examId = data.examIds[0];
  if (!examId) {
    throw new Error("Exame é obrigatório");
  }

  const payload: IEmployeeExamUpdatePayload = {
    ...formToEmployeeExamSharedFields(data),
    exam: { id: examId },
  };

  // Vínculos já parcelados têm o pagamento derivado das parcelas — a rota de
  // atualização do vínculo não aceita `installments`, então não reenviamos
  // paymentStatus/paidAt para não sobrescrever o estado controlado por elas.
  if (data.paymentMode !== "installments") {
    Object.assign(payload, formToPaymentFields(data));
  }

  return payload;
}

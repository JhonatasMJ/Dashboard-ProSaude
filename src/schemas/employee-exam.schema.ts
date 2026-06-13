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
import type {
  IEmployeeExam,
  IEmployeeExamCreatePayload,
  IEmployeeExamUpdatePayload,
} from "@/shared/interfaces/https/employee-exam";

const EXAM_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidPaidAtInput(value: string | undefined): boolean {
  const dateOnly = normalizeToDateOnly(value);
  if (!dateOnly) return false;

  const date = parseDateOnlyInput(dateOnly);
  if (!date) return false;

  return date <= new Date();
}

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
  paymentStatus: yup
    .mixed<"PENDING" | "PAID">()
    .oneOf(["PENDING", "PAID"], "Status inválido")
    .required("Status é obrigatório"),
  paidAt: yup
    .string()
    .default("")
    .when("paymentStatus", {
      is: "PAID",
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
});

export type EmployeeExamFormData = yup.InferType<typeof employeeExamSchema>;

export function employeeExamToFormValues(
  link: IEmployeeExam
): EmployeeExamFormData {
  return {
    employeeId: link.employee.id,
    examIds: [link.exam.id],
    professionalName: link.professionalName,
    examDate: dateOnlyToBrDateInput(link.examDate),
    examTime: link.examTime ?? "",
    paymentStatus: link.paymentStatus ?? "PENDING",
    paidAt: isoToDateOnly(link.paidAt),
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
    ...formToPaymentFields(data),
  };
}

export function formToEmployeeExamCreatePayloads(
  data: EmployeeExamFormData
): IEmployeeExamCreatePayload[] {
  const shared = formToEmployeeExamSharedFields(data);

  return data.examIds.map((examId) => ({
    ...shared,
    exam: { id: examId },
  }));
}

export function formToEmployeeExamUpdatePayload(
  data: EmployeeExamFormData
): IEmployeeExamUpdatePayload {
  const examId = data.examIds[0];
  if (!examId) {
    throw new Error("Exame é obrigatório");
  }

  return {
    ...formToEmployeeExamSharedFields(data),
    exam: { id: examId },
  };
}

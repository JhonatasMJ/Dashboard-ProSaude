import * as yup from "yup";
import { isValidPaidAtInput } from "@/shared/helpers/employee-exam-form.helper";
import { isValidBrDateInput } from "@/shared/helpers/date.helper";

const EXAM_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

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
    .required("Hora do exame é obrigatória")
    .test("valid-time", "Informe a hora no formato HH:mm", (value) =>
      EXAM_TIME_PATTERN.test(value ?? "")
    ),
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

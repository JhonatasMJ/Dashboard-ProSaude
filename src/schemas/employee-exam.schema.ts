import * as yup from "yup";
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
});

import * as yup from "yup";
import {
  brDateInputToDateOnly,
  dateOnlyToBrDateInput,
  isValidBrDateInput,
} from "@/shared/helpers/date.helper";
import type {
  IAso,
  IAsoCreatePayload,
  IAsoUpdatePayload,
  AsoType,
} from "@/shared/interfaces/https/aso";
import { ASO_TYPES } from "@/shared/interfaces/https/aso";

export const asoSchema = yup.object({
  employeeId: yup.string().required("Funcionário é obrigatório"),
  type: yup
    .mixed<AsoType>()
    .oneOf([...ASO_TYPES], "Tipo de ASO inválido")
    .required("Tipo de ASO é obrigatório"),
  date: yup
    .string()
    .required("Data do ASO é obrigatória")
    .test("valid-date", "Informe uma data válida (DD/MM/AAAA)", (value) =>
      isValidBrDateInput(value)
    ),
  examIds: yup
    .array()
    .of(yup.string().defined())
    .min(1, "Selecione pelo menos um exame")
    .required(),
  occupationalRiskIds: yup
    .array()
    .of(yup.string().defined())
    .default([]),
});

export type AsoFormData = yup.InferType<typeof asoSchema>;

export function asoToFormValues(aso: IAso): AsoFormData {
  return {
    employeeId: aso.employee.id,
    type: aso.type,
    date: dateOnlyToBrDateInput(aso.date),
    examIds: aso.exams.map((exam) => exam.id),
    occupationalRiskIds: aso.occupationalRisks.map((risk) => risk.id),
  };
}

function formToAsoPayloadFields(data: AsoFormData) {
  const date = brDateInputToDateOnly(data.date);
  if (!date) {
    throw new Error("Data do ASO inválida");
  }

  return {
    type: data.type,
    date,
    employee: { id: data.employeeId },
    exams: data.examIds.map((id) => ({ id })),
    occupationalRisks: data.occupationalRiskIds.map((id) => ({ id })),
  };
}

export function formToAsoCreatePayload(data: AsoFormData): IAsoCreatePayload {
  return formToAsoPayloadFields(data);
}

export function formToAsoUpdatePayload(data: AsoFormData): IAsoUpdatePayload {
  return formToAsoPayloadFields(data);
}

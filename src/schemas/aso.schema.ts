import * as yup from "yup";
import { isValidBrDateInput } from "@/shared/helpers/date.helper";
import { ASO_TYPES } from "@/shared/types/aso-type.types";
import type { AsoType } from "@/shared/types/aso-type.types";

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

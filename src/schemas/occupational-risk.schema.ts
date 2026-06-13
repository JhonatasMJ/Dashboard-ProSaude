import * as yup from "yup";
import type {
  IOccupationalRisk,
  IOccupationalRiskPayload,
} from "@/shared/interfaces/https/occupational-risk";
import { OCCUPATIONAL_RISK_CATEGORIES } from "@/shared/types/occupational-risk-category.types";
import type { OccupationalRiskCategory } from "@/shared/types/occupational-risk-category.types";

export const occupationalRiskSchema = yup.object({
  category: yup
    .mixed<OccupationalRiskCategory>()
    .oneOf([...OCCUPATIONAL_RISK_CATEGORIES], "Categoria inválida")
    .required("Categoria é obrigatória"),
  description: yup
    .string()
    .required("Descrição é obrigatória")
    .min(2, "Informe pelo menos 2 caracteres"),
});

export type OccupationalRiskFormData = yup.InferType<typeof occupationalRiskSchema>;

export function occupationalRiskToFormValues(
  risk: IOccupationalRisk
): OccupationalRiskFormData {
  return {
    category: risk.category,
    description: risk.description,
  };
}

export function formToOccupationalRiskPayload(
  data: OccupationalRiskFormData
): IOccupationalRiskPayload {
  return {
    category: data.category,
    description: data.description.trim(),
  };
}

import * as yup from "yup";
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

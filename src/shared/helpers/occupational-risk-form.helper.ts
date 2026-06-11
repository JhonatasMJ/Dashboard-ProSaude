import type {
  IOccupationalRisk,
  IOccupationalRiskPayload,
} from "@/shared/interfaces/https/occupational-risk";
import type { OccupationalRiskFormData } from "@/types/occupational-risk-form.types";

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

import type * as yup from "yup";
import type { occupationalRiskSchema } from "@/schemas/occupational-risk.schema";

export type OccupationalRiskFormData = yup.InferType<
  typeof occupationalRiskSchema
>;

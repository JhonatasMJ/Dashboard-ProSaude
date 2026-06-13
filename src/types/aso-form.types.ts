import type * as yup from "yup";
import type { asoSchema } from "@/schemas/aso.schema";

export type AsoFormData = yup.InferType<typeof asoSchema>;

import type * as yup from "yup";
import type { companySchema } from "@/schemas/company.schema";

export type CompanyFormData = yup.InferType<typeof companySchema>;

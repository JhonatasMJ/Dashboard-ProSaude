import * as yup from "yup";

export const companySchema = yup.object({
  name: yup.string().required("Nome da empresa é obrigatório"),
  taxId: yup
    .string()
    .required("CNPJ é obrigatório")
    .min(18, "CNPJ incompleto"),
  email: yup
    .string()
    .default("")
    .test(
      "valid-email",
      "Informe um e-mail válido",
      (value) => !value?.trim() || yup.string().email().isValidSync(value)
    ),
  phone: yup.string().default(""),
  zipCode: yup.string().default(""),
  street: yup.string().default(""),
  number: yup.string().default(""),
  neighborhood: yup.string().default(""),
  city: yup.string().default(""),
  state: yup
    .string()
    .default("")
    .test(
      "valid-state",
      "Informe a sigla do estado (ex: SP)",
      (value) => !value?.trim() || value.trim().length === 2
    ),
});

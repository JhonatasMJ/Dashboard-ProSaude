import * as yup from "yup";

export const companySchema = yup.object({
  name: yup.string().required("Nome da empresa é obrigatório"),
  taxId: yup
    .string()
    .required("CNPJ é obrigatório")
    .min(18, "CNPJ incompleto"),
  email: yup
    .string()
    .email("Informe um e-mail válido")
    .required("E-mail é obrigatório"),
  phone: yup
    .string()
    .required("Telefone é obrigatório")
    .min(14, "Telefone incompleto"),
  zipCode: yup.string().default(""),
  street: yup.string().required("Rua é obrigatória"),
  number: yup.string().required("Número é obrigatório"),
  neighborhood: yup.string().required("Bairro é obrigatório"),
  city: yup.string().required("Cidade é obrigatória"),
  state: yup
    .string()
    .required("UF é obrigatória")
    .length(2, "Informe a sigla do estado (ex: SP)"),
});

import * as yup from "yup";

export const companySchema = yup.object({
  legalName: yup.string().required("Razão social é obrigatória"),
  tradeName: yup.string().required("Nome fantasia é obrigatório"),
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
  address: yup.string().required("Endereço é obrigatório"),
});

import * as yup from "yup";
import {
  isValidPriceInput,
  MAX_EXAM_PRICE,
  parsePriceInputToNumber,
} from "@/shared/helpers/currency-input.helper";

export const examSchema = yup.object({
  companyId: yup.string().required("Empresa é obrigatória"),
  name: yup
    .string()
    .required("Nome do exame é obrigatório")
    .min(2, "Informe pelo menos 2 caracteres"),
  price: yup
    .string()
    .required("Preço é obrigatório")
    .test("valid-price", "Informe um preço válido", (value) =>
      isValidPriceInput(value)
    )
    .test("positive", "O preço deve ser maior que zero", (value) => {
      const amount = parsePriceInputToNumber(value);
      return !Number.isNaN(amount) && amount > 0;
    })
    .test(
      "max-price",
      `O valor máximo é R$ ${MAX_EXAM_PRICE.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      (value) => {
        const amount = parsePriceInputToNumber(value);
        return !Number.isNaN(amount) && amount <= MAX_EXAM_PRICE;
      }
    ),
  notes: yup.string().default(""),
});

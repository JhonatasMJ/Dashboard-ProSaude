import * as yup from "yup";
import {
  isValidPriceInput,
  MAX_EXAM_PRICE,
  parsePriceInputToNumber,
} from "@/shared/helpers/currency-input.helper";

const priceFieldSchema = (label: string) =>
  yup
    .string()
    .required(`${label} é obrigatório`)
    .test("valid-price", `Informe um ${label.toLowerCase()} válido`, (value) =>
      isValidPriceInput(value)
    )
    .test("positive", `O ${label.toLowerCase()} deve ser maior que zero`, (value) => {
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
    );

const optionalCostFieldSchema = yup
  .string()
  .default("")
  .test("valid-cost", "Informe um custo válido", (value) => {
    if (!value?.trim()) return true;
    return isValidPriceInput(value);
  })
  .test("max-cost", "O custo não pode ser negativo", (value) => {
    if (!value?.trim()) return true;
    const amount = parsePriceInputToNumber(value);
    return !Number.isNaN(amount) && amount >= 0;
  })
  .test(
    "max-cost-value",
    `O valor máximo é R$ ${MAX_EXAM_PRICE.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    (value) => {
      if (!value?.trim()) return true;
      const amount = parsePriceInputToNumber(value);
      return !Number.isNaN(amount) && amount <= MAX_EXAM_PRICE;
    }
  );

export const examSchema = yup.object({
  companyId: yup.string().required("Empresa é obrigatória"),
  name: yup
    .string()
    .required("Nome do exame é obrigatório")
    .min(2, "Informe pelo menos 2 caracteres"),
  price: priceFieldSchema("Preço"),
  cost: optionalCostFieldSchema,
  notes: yup.string().default(""),
});

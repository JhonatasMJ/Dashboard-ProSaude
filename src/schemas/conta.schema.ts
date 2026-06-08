import * as yup from "yup";
import { parseDateOnlyInput } from "@/shared/helpers/date.helper";
import {
  isValidPriceInput,
  MAX_CONTA_VALUE,
  parsePriceInputToNumber,
} from "@/shared/helpers/currency-input.helper";
import type { ContaStatus } from "@/shared/types/conta-status.types";

const MAX_CONTA_CENTS = Math.round(MAX_CONTA_VALUE * 100);

function isValidDateOnlyInput(value: string | undefined): boolean {
  return !!value?.trim() && !!parseDateOnlyInput(value);
}

export const contaSchema = yup.object({
  nome: yup
    .string()
    .required("Nome é obrigatório")
    .min(2, "Informe pelo menos 2 caracteres"),
  valor: yup
    .string()
    .required("Valor é obrigatório")
    .test("valid-valor", "Informe um valor válido", (value) =>
      isValidPriceInput(value, MAX_CONTA_VALUE)
    )
    .test("positive", "O valor deve ser maior que zero", (value) => {
      const amount = parsePriceInputToNumber(value, MAX_CONTA_CENTS);
      return !Number.isNaN(amount) && amount > 0;
    }),
  dataVencimento: yup
    .string()
    .required("Data de vencimento é obrigatória")
    .test(
      "valid-date",
      "Informe uma data de vencimento válida",
      (value) => isValidDateOnlyInput(value)
    ),
  status: yup
    .mixed<ContaStatus>()
    .oneOf(["pendente", "pago", "vencido"], "Status inválido")
    .required("Status é obrigatório"),
  dataPagamento: yup
    .string()
    .default("")
    .when("status", {
      is: "pago",
      then: (schema) =>
        schema
          .required("Data de pagamento é obrigatória")
          .test(
            "valid-date",
            "Informe uma data de pagamento válida",
            (value) => isValidDateOnlyInput(value)
          ),
      otherwise: (schema) => schema.default(""),
    }),
});

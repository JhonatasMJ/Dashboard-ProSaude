import * as yup from "yup";
import { parseDateOnlyInput } from "@/shared/helpers/date.helper";
import {
  formatNumberToPriceInput,
  isValidPriceInput,
  MAX_ACCOUNT_VALUE,
  parsePriceInputToNumber,
} from "@/shared/helpers/currency-input.helper";
import { isoToDateOnly } from "@/shared/helpers/payment-date.helper";
import type { IAccount, IAccountPayload } from "@/shared/interfaces/https/account";
import type { AccountStatus } from "@/shared/types/account-status.types";

const MAX_ACCOUNT_CENTS = Math.round(MAX_ACCOUNT_VALUE * 100);

function isValidDateOnlyInput(value: string | undefined): boolean {
  return !!value?.trim() && !!parseDateOnlyInput(value);
}

export const accountSchema = yup.object({
  name: yup
    .string()
    .required("Nome é obrigatório")
    .min(2, "Informe pelo menos 2 caracteres"),
  amount: yup
    .string()
    .required("Valor é obrigatório")
    .test("valid-amount", "Informe um valor válido", (value) =>
      isValidPriceInput(value, MAX_ACCOUNT_VALUE)
    )
    .test("positive", "O valor deve ser maior que zero", (value) => {
      const parsedAmount = parsePriceInputToNumber(value, MAX_ACCOUNT_CENTS);
      return !Number.isNaN(parsedAmount) && parsedAmount > 0;
    }),
  dueDate: yup
    .string()
    .required("Data de vencimento é obrigatória")
    .test(
      "valid-date",
      "Informe uma data de vencimento válida",
      (value) => isValidDateOnlyInput(value)
    ),
  status: yup
    .mixed<AccountStatus>()
    .oneOf(["PENDING", "PAID", "OVERDUE"], "Status inválido")
    .required("Status é obrigatório"),
  paidAt: yup
    .string()
    .default("")
    .when("status", {
      is: "PAID",
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

export type AccountFormData = yup.InferType<typeof accountSchema>;

export function accountToFormValues(account: IAccount): AccountFormData {
  return {
    name: account.name,
    amount: formatNumberToPriceInput(account.amount, MAX_ACCOUNT_CENTS),
    dueDate: account.dueDate,
    status: account.status,
    paidAt: isoToDateOnly(account.paidAt),
  };
}

export function formToAccountPayload(data: AccountFormData): IAccountPayload {
  const amount = parsePriceInputToNumber(data.amount, MAX_ACCOUNT_CENTS);

  if (Number.isNaN(amount)) {
    throw new Error("Valor inválido");
  }

  const payload: IAccountPayload = {
    name: data.name.trim(),
    amount,
    dueDate: data.dueDate,
    status: data.status,
  };

  if (data.status === "PAID") {
    payload.paidAt = data.paidAt || null;
  } else {
    payload.paidAt = null;
  }

  return payload;
}

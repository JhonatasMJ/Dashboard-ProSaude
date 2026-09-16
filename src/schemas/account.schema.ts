import * as yup from "yup";
import { parseDateOnlyInput } from "@/shared/helpers/date.helper";
import {
  formatNumberToPriceInput,
  isValidPriceInput,
  MAX_ACCOUNT_VALUE,
  parsePriceInputToNumber,
} from "@/shared/helpers/currency-input.helper";
import { isoToDateOnly } from "@/shared/helpers/date.helper";
import type { IAccount, IAccountPayload } from "@/shared/interfaces/https/account";
import type { AccountStatus } from "@/shared/types/account-status.types";

const MAX_ACCOUNT_CENTS = Math.round(MAX_ACCOUNT_VALUE * 100);

export type AccountPaymentMode = "single" | "installments";

function isValidDateOnlyInput(value: string | undefined): boolean {
  return !!value?.trim() && !!parseDateOnlyInput(value);
}

const installmentItemSchema = yup.object({
  amount: yup.string().default(""),
  dueDate: yup.string().default(""),
});

export const accountSchema = yup.object({
  name: yup
    .string()
    .required("Nome é obrigatório")
    .min(2, "Informe pelo menos 2 caracteres"),
  paymentMode: yup
    .mixed<AccountPaymentMode>()
    .oneOf(["single", "installments"])
    .default("single")
    .required(),
  amount: yup
    .string()
    .default("")
    .when("paymentMode", {
      is: "single",
      then: (schema) =>
        schema
          .required("Valor é obrigatório")
          .test("valid-amount", "Informe um valor válido", (value) =>
            isValidPriceInput(value, MAX_ACCOUNT_VALUE)
          )
          .test("positive", "O valor deve ser maior que zero", (value) => {
            const parsedAmount = parsePriceInputToNumber(value, MAX_ACCOUNT_CENTS);
            return !Number.isNaN(parsedAmount) && parsedAmount > 0;
          }),
    }),
  dueDate: yup
    .string()
    .default("")
    .when("paymentMode", {
      is: "single",
      then: (schema) =>
        schema
          .required("Data de vencimento é obrigatória")
          .test(
            "valid-date",
            "Informe uma data de vencimento válida",
            (value) => isValidDateOnlyInput(value)
          ),
    }),
  status: yup
    .mixed<AccountStatus>()
    .oneOf(["PENDING", "PAID", "OVERDUE"], "Status inválido")
    .default("PENDING")
    .when("paymentMode", {
      is: "single",
      then: (schema) => schema.required("Status é obrigatório"),
    }),
  paidAt: yup
    .string()
    .default("")
    .when(["paymentMode", "status"], {
      is: (paymentMode: AccountPaymentMode, status: AccountStatus) =>
        paymentMode === "single" && status === "PAID",
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
  installments: yup
    .array()
    .of(installmentItemSchema)
    .default([])
    .when("paymentMode", {
      is: "installments",
      then: (schema) =>
        schema
          .min(2, "Informe pelo menos 2 parcelas")
          .max(12, "Máximo de 12 parcelas")
          .test(
            "valid-installments",
            "Preencha valor e vencimento válidos em todas as parcelas",
            (items) =>
              (items ?? []).every(
                (item) =>
                  isValidPriceInput(item?.amount, MAX_ACCOUNT_VALUE) &&
                  parsePriceInputToNumber(item?.amount, MAX_ACCOUNT_CENTS) > 0 &&
                  isValidDateOnlyInput(item?.dueDate)
              )
          ),
    }),
});

export type AccountFormData = yup.InferType<typeof accountSchema>;

export function accountToFormValues(account: IAccount): AccountFormData {
  const hasInstallments = account.installments.length > 0;

  return {
    name: account.name,
    paymentMode: hasInstallments ? "installments" : "single",
    amount: hasInstallments ? "" : formatNumberToPriceInput(account.amount, MAX_ACCOUNT_CENTS),
    dueDate: hasInstallments ? "" : account.dueDate,
    status: hasInstallments ? "PENDING" : account.status,
    paidAt: hasInstallments ? "" : isoToDateOnly(account.paidAt),
    installments: hasInstallments
      ? account.installments.map((installment) => ({
          amount: formatNumberToPriceInput(installment.amount, MAX_ACCOUNT_CENTS),
          dueDate: installment.dueDate,
        }))
      : [],
  };
}

export function formToAccountPayload(data: AccountFormData): IAccountPayload {
  const name = data.name.trim();

  if (data.paymentMode === "installments") {
    const installments = data.installments.map((item) => {
      const amount = parsePriceInputToNumber(item.amount, MAX_ACCOUNT_CENTS);

      if (Number.isNaN(amount) || !item.dueDate) {
        throw new Error("Parcela inválida");
      }

      return { amount, dueDate: item.dueDate };
    });

    return { name, installments };
  }

  const amount = parsePriceInputToNumber(data.amount, MAX_ACCOUNT_CENTS);

  if (Number.isNaN(amount)) {
    throw new Error("Valor inválido");
  }

  const payload: IAccountPayload = {
    name,
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

import {
  formatNumberToPriceInput,
  MAX_ACCOUNT_VALUE,
  parsePriceInputToNumber,
} from "@/shared/helpers/currency-input.helper";
import { isoToDateOnly } from "@/shared/helpers/payment-date.helper";
import type { IAccount, IAccountPayload } from "@/shared/interfaces/https/account";
import type { AccountFormData } from "@/types/account-form.types";

const MAX_ACCOUNT_CENTS = Math.round(MAX_ACCOUNT_VALUE * 100);

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

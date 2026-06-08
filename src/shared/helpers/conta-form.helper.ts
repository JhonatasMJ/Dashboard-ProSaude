import {
  formatNumberToPriceInput,
  MAX_CONTA_VALUE,
  parsePriceInputToNumber,
} from "@/shared/helpers/currency-input.helper";
import type { IConta, IContaPayload } from "@/shared/interfaces/https/conta";
import type { ContaFormData } from "@/types/conta-form.types";

const MAX_CONTA_CENTS = Math.round(MAX_CONTA_VALUE * 100);

export function contaToFormValues(conta: IConta): ContaFormData {
  return {
    nome: conta.nome,
    valor: formatNumberToPriceInput(conta.valor, MAX_CONTA_CENTS),
    dataVencimento: conta.dataVencimento,
    status: conta.status,
    dataPagamento: conta.dataPagamento ?? "",
  };
}

export function formToContaPayload(data: ContaFormData): IContaPayload {
  const valor = parsePriceInputToNumber(data.valor, MAX_CONTA_CENTS);

  if (Number.isNaN(valor)) {
    throw new Error("Valor inválido");
  }

  const payload: IContaPayload = {
    nome: data.nome.trim(),
    valor,
    dataVencimento: data.dataVencimento,
    status: data.status,
  };

  if (data.status === "pago") {
    payload.dataPagamento = data.dataPagamento || null;
  } else {
    payload.dataPagamento = null;
  }

  return payload;
}

/** Valor máximo permitido para preço de exame (R$). */
export const MAX_EXAM_PRICE = 200;

const MAX_PRICE_CENTS = MAX_EXAM_PRICE * 100;

/** Extrai só os dígitos do valor exibido (centavos internos). */
export function extractPriceDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Formata dígitos como moeda BRL: cada tecla entra pela direita.
 * "2" → 0,02 · "20" → 0,20 · "200" → 2,00 · "20020" → 200,20
 * Trava em R$ 200,00.
 */
export function formatDigitsToPriceDisplay(digits: string): string {
  const normalized = digits.replace(/\D/g, "");

  if (!normalized) {
    return "";
  }

  const cents = Math.min(
    Number.parseInt(normalized, 10),
    MAX_PRICE_CENTS
  );

  if (Number.isNaN(cents)) {
    return "";
  }

  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Atualiza o valor conforme o usuário digita ou apaga. */
export function applyPriceDigitInput(raw: string): string {
  return formatDigitsToPriceDisplay(extractPriceDigits(raw));
}

export function formatNumberToPriceInput(
  value: number | undefined | null
): string {
  if (value == null || Number.isNaN(value)) {
    return "";
  }

  const cents = Math.min(Math.round(value * 100), MAX_PRICE_CENTS);
  return formatDigitsToPriceDisplay(String(cents));
}

export function parsePriceInputToNumber(value: string | undefined): number {
  const digits = extractPriceDigits(value ?? "");

  if (!digits) {
    return Number.NaN;
  }

  const cents = Math.min(Number.parseInt(digits, 10), MAX_PRICE_CENTS);
  return cents / 100;
}

export function isValidPriceInput(value: string | undefined): boolean {
  const amount = parsePriceInputToNumber(value);
  return !Number.isNaN(amount) && amount >= 0 && amount <= MAX_EXAM_PRICE;
}

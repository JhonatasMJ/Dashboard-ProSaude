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
export function formatDigitsToPriceDisplay(
  digits: string,
  maxCents: number = MAX_PRICE_CENTS
): string {
  const normalized = digits.replace(/\D/g, "");

  if (!normalized) {
    return "";
  }

  const cents = Math.min(
    Number.parseInt(normalized, 10),
    maxCents
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
export function applyPriceDigitInput(
  raw: string,
  maxCents: number = MAX_PRICE_CENTS
): string {
  return formatDigitsToPriceDisplay(extractPriceDigits(raw), maxCents);
}

export function formatNumberToPriceInput(
  value: number | undefined | null,
  maxCents: number = MAX_PRICE_CENTS
): string {
  if (value == null || Number.isNaN(value)) {
    return "";
  }

  const cents = Math.min(Math.round(value * 100), maxCents);
  return formatDigitsToPriceDisplay(String(cents), maxCents);
}

export function parsePriceInputToNumber(
  value: string | undefined,
  maxCents: number = MAX_PRICE_CENTS
): number {
  const digits = extractPriceDigits(value ?? "");

  if (!digits) {
    return Number.NaN;
  }

  const cents = Math.min(Number.parseInt(digits, 10), maxCents);
  return cents / 100;
}

export function isValidPriceInput(
  value: string | undefined,
  maxValue: number = MAX_EXAM_PRICE
): boolean {
  const maxCents = Math.round(maxValue * 100);
  const amount = parsePriceInputToNumber(value, maxCents);
  return !Number.isNaN(amount) && amount >= 0 && amount <= maxValue;
}

/** Valor máximo permitido para contas (R$). */
export const MAX_ACCOUNT_VALUE = 999_999.99;

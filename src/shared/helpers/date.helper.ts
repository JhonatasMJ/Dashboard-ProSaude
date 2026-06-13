import { differenceInYears, format, isValid, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

const BR_DATE_PATTERN = "dd/MM/yyyy";

export function parseBrDateInput(value: string | undefined): Date | undefined {
  if (!value?.trim() || value.length < 10) return undefined;

  const parsed = parse(value, BR_DATE_PATTERN, new Date());
  return isValid(parsed) ? parsed : undefined;
}

export function formatBrDateInput(date: Date | undefined): string {
  if (!date || !isValid(date)) return "";

  return format(date, BR_DATE_PATTERN, { locale: ptBR });
}

export function isoToBrDateInput(value: string | null | undefined): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return formatBrDateInput(date);
}

export function brDateInputToIso(value: string | undefined): string | null {
  const date = parseBrDateInput(value);
  if (!date) return null;

  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0)
  ).toISOString();
}

export function isValidBrDateInput(value: string | undefined): boolean {
  const date = parseBrDateInput(value);
  if (!date) return false;

  return date <= new Date();
}

export function formatDateBr(value: string | null | undefined): string {
  if (!value) return "—";

  const dateOnly = parseDateOnlyInput(value);
  if (dateOnly) {
    return formatBrDateInput(dateOnly);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("pt-BR");
}

export function parseDateOnlyInput(
  value: string | undefined
): Date | undefined {
  if (!value?.trim()) return undefined;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return isValid(date) ? date : undefined;
}

export function dateOnlyToBrDateInput(
  value: string | null | undefined
): string {
  const date = parseDateOnlyInput(value ?? undefined);
  if (!date) return "";

  return formatBrDateInput(date);
}

export function dateToDateOnly(value: Date | undefined): string {
  if (!value || !isValid(value)) return "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function brDateInputToDateOnly(
  value: string | undefined
): string | null {
  const date = parseBrDateInput(value);
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function birthDateToDate(
  value: string | Date | null | undefined
): Date | undefined {
  if (value instanceof Date) {
    return isValid(value) ? value : undefined;
  }

  if (!value?.trim()) return undefined;

  return (
    parseBrDateInput(value) ??
    (isValid(new Date(value)) ? new Date(value) : undefined)
  );
}

export function getAgeFromBirthDate(
  value: string | Date | null | undefined
): number | null {
  const birthDate = birthDateToDate(value);
  if (!birthDate) return null;

  const age = differenceInYears(new Date(), birthDate);
  return age >= 0 ? age : null;
}

export function formatAgeFromBirthDate(
  value: string | Date | null | undefined
): string | null {
  const age = getAgeFromBirthDate(value);
  if (age === null) return null;

  return age === 1 ? "1 ano" : `${age} anos`;
}

export function isoToDateOnly(value: string | null | undefined): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function dateOnlyToPaidAtIso(dateOnly: string): string {
  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0)).toISOString();
}

/** Aceita YYYY-MM-DD (DatePicker) ou DD/MM/AAAA. */
export function normalizeToDateOnly(value: string | undefined): string | null {
  if (!value?.trim()) return null;

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (!match) return null;

  return `${match[3]}-${match[2]}-${match[1]}`;
}

import type { FactoryOpts } from "imask";

export const cnpjMask: FactoryOpts = {
  mask: "00.000.000/0000-00",
};

const CNPJ_MASK_PATTERN = "00.000.000/0000-00";

export function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (!digits) return value;

  let result = "";
  let digitIndex = 0;

  for (const char of CNPJ_MASK_PATTERN) {
    if (char === "0") {
      if (digitIndex >= digits.length) break;
      result += digits[digitIndex++];
    } else {
      if (digitIndex >= digits.length) break;
      result += char;
    }
  }

  return result;
}

export const phoneMask: FactoryOpts = {
  mask: [
    { mask: "(00) 0000-0000" },
    { mask: "(00) 00000-0000" },
  ],
};

export const zipCodeMask: FactoryOpts = {
  mask: "00000-000",
};

export const cpfMask: FactoryOpts = {
  mask: "000.000.000-00",
};

const CPF_MASK_PATTERN = "000.000.000-00";

export function stripCpf(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function formatCpf(value: string): string {
  const digits = stripCpf(value);
  if (!digits) return value;

  let result = "";
  let digitIndex = 0;

  for (const char of CPF_MASK_PATTERN) {
    if (char === "0") {
      if (digitIndex >= digits.length) break;
      result += digits[digitIndex++];
    } else {
      if (digitIndex >= digits.length) break;
      result += char;
    }
  }

  return result;
}

export function isValidCpfLength(value: string): boolean {
  return stripCpf(value).length === 11;
}

export const birthDateMask: FactoryOpts = {
  mask: "00/00/0000",
};

export const examTimeMask: FactoryOpts = {
  mask: "00:00",
};

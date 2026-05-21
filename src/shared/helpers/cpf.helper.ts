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

/** Tupla RGB mutável exigida por jspdf-autotable. */
export type PdfRgbColor = [number, number, number];

/** Cores da marca ProSaúde para relatórios PDF (RGB 0–255). */
export const PDF_BRAND = {
  primary: [0, 140, 28],
  secondary: [0, 24, 74],
  primaryLight: [232, 245, 234],
  primaryMuted: [209, 250, 214],
  secondaryLight: [232, 237, 247],
  surface: [248, 250, 252],
  border: [226, 232, 240],
  text: [15, 23, 42],
  textMuted: [100, 116, 139],
  white: [255, 255, 255],
} satisfies Record<string, PdfRgbColor>;

export const PDF_LAYOUT = {
  marginX: 12,
  headerHeight: 30,
  accentHeight: 1.2,
  footerHeight: 10,
} as const;

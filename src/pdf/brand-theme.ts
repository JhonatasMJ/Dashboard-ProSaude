/** Cores da marca ProSaúde para relatórios PDF (RGB 0–255). */
export const PDF_BRAND = {
  primary: [0, 140, 28] as const,
  secondary: [0, 24, 74] as const,
  primaryLight: [232, 245, 234] as const,
  primaryMuted: [209, 250, 214] as const,
  secondaryLight: [232, 237, 247] as const,
  surface: [248, 250, 252] as const,
  border: [226, 232, 240] as const,
  text: [15, 23, 42] as const,
  textMuted: [100, 116, 139] as const,
  white: [255, 255, 255] as const,
} as const;

export const PDF_LAYOUT = {
  marginX: 12,
  headerHeight: 30,
  accentHeight: 1.2,
  footerHeight: 10,
} as const;

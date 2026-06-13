export type AsoType =
  | "ADMISSIONAL"
  | "PERIODICO"
  | "RETORNO_AO_TRABALHO"
  | "MUDANCA_DE_RISCO"
  | "MONITORACAO_PONTUAL"
  | "DEMISSIONAL";

export const ASO_TYPES: AsoType[] = [
  "ADMISSIONAL",
  "PERIODICO",
  "RETORNO_AO_TRABALHO",
  "MUDANCA_DE_RISCO",
  "MONITORACAO_PONTUAL",
  "DEMISSIONAL",
];

export const ASO_TYPE_LABELS: Record<AsoType, string> = {
  ADMISSIONAL: "Admissional",
  PERIODICO: "Periódico",
  RETORNO_AO_TRABALHO: "Retorno ao trabalho",
  MUDANCA_DE_RISCO: "Mudança de risco",
  MONITORACAO_PONTUAL: "Monitoração pontual",
  DEMISSIONAL: "Demissional",
};

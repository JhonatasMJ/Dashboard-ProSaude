export type OccupationalRiskCategory =
  | "FISICOS"
  | "QUIMICOS"
  | "BIOLOGICOS"
  | "ERGONOMICOS"
  | "ACIDENTES";

export const OCCUPATIONAL_RISK_CATEGORIES: OccupationalRiskCategory[] = [
  "FISICOS",
  "QUIMICOS",
  "BIOLOGICOS",
  "ERGONOMICOS",
  "ACIDENTES",
];

export const OCCUPATIONAL_RISK_CATEGORY_LABELS: Record<
  OccupationalRiskCategory,
  string
> = {
  FISICOS: "Físicos",
  QUIMICOS: "Químicos",
  BIOLOGICOS: "Biológicos",
  ERGONOMICOS: "Ergonômicos",
  ACIDENTES: "Acidentes",
};

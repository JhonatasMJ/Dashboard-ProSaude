import type { IContasListParams } from "@/shared/interfaces/https/conta";

export type ContasReportListParams = Omit<
  IContasListParams,
  "page" | "pageSize"
>;

export interface GenerateContasReportPdfInput {
  filterSummary: string[];
  generatedAt?: Date;
}

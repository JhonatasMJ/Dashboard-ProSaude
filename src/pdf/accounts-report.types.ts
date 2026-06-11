import type { IAccountsListParams } from "@/shared/interfaces/https/account";

export type AccountsReportListParams = Omit<
  IAccountsListParams,
  "page" | "pageSize"
>;

export interface GenerateAccountsReportPdfInput {
  filterSummary: string[];
  generatedAt?: Date;
}

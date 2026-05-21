import { proSaudeApi } from "../api/pro-saude";
import type { IDashboardSummaryResponse } from "../interfaces/https/dashboard-summary";

export const dashboardService = {
  async getSummary(): Promise<IDashboardSummaryResponse> {
    const { data } = await proSaudeApi.get<IDashboardSummaryResponse>(
      "/dashboard/summary"
    );

    return data;
  },
};

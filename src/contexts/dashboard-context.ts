import { createContext } from "react";
import type { IDashboardSummaryData } from "@/shared/interfaces/https/dashboard-summary";

export interface DashboardContextValue {
  summary: IDashboardSummaryData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const DashboardContext = createContext<DashboardContextValue | null>(
  null
);

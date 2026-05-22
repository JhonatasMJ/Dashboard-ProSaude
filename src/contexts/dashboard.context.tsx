import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import {
  DashboardContext,
  type DashboardContextValue,
} from "@/contexts/dashboard-context";
import { useRequestGeneration } from "@/hooks/use-request-generation";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import type { IDashboardSummaryData } from "@/shared/interfaces/https/dashboard-summary";
import { dashboardService } from "@/shared/services/dashboard.service";

export function DashboardProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { startRequest, isStaleRequest } = useRequestGeneration();
  const [summary, setSummary] = useState<IDashboardSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(
    async (showLoading = false) => {
      const requestId = startRequest();

      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const { data } = await dashboardService.getSummary();

        if (isStaleRequest(requestId)) return;

        setSummary(data);
      } catch (err) {
        if (isStaleRequest(requestId)) return;

        setSummary(null);
        setError(
          getApiErrorMessage(err, "Não foi possível carregar o resumo do painel.")
        );
      } finally {
        if (!isStaleRequest(requestId)) {
          setIsLoading(false);
        }
      }
    },
    [startRequest, isStaleRequest]
  );

  useEffect(() => {
    loadSummary(true);
  }, [location.pathname, loadSummary]);

  const refetch = useCallback(() => loadSummary(true), [loadSummary]);

  const value = useMemo<DashboardContextValue>(
    () => ({
      summary,
      isLoading,
      error,
      refetch,
    }),
    [summary, isLoading, error, refetch]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

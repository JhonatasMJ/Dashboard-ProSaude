import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { useRequestGeneration } from "@/hooks/use-request-generation";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import type { IDashboardSummaryData } from "@/shared/interfaces/https/dashboard-summary";
import { dashboardService } from "@/shared/services/dashboard.service";

export interface DashboardContextValue {
  summary: IDashboardSummaryData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

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

      try {
        const { data } = await dashboardService.getSummary();

        if (isStaleRequest(requestId)) return;

        setSummary(data);
        setError(null);
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
    let active = true;
    const requestId = startRequest();

    dashboardService
      .getSummary()
      .then(({ data }) => {
        if (!active || isStaleRequest(requestId)) return;
        setSummary(data);
        setError(null);
      })
      .catch((err) => {
        if (!active || isStaleRequest(requestId)) return;
        setSummary(null);
        setError(
          getApiErrorMessage(err, "Não foi possível carregar o resumo do painel.")
        );
      })
      .finally(() => {
        if (active && !isStaleRequest(requestId)) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [location.pathname, startRequest, isStaleRequest]);

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

export function useDashboard() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboard deve ser usado dentro de DashboardProvider");
  }

  return context;
}

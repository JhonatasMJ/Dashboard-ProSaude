import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DashboardContext,
  type DashboardContextValue,
} from "@/contexts/dashboard-context";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import type { IDashboardSummaryData } from "@/shared/interfaces/https/dashboard-summary";
import { dashboardService } from "@/shared/services/dashboard.service";

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [summary, setSummary] = useState<IDashboardSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const { data } = await dashboardService.getSummary();
      setSummary(data);
    } catch (err) {
      setSummary(null);
      setError(
        getApiErrorMessage(err, "Não foi possível carregar o resumo do painel.")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    dashboardService
      .getSummary()
      .then(({ data }) => {
        if (active) {
          setSummary(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setSummary(null);
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível carregar o resumo do painel."
            )
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

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

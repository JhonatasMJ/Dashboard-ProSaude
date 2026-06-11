import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRequestGeneration } from "@/hooks/use-request-generation";
import {
  FILTER_DEBOUNCE_MS,
  TABLE_PAGE_SIZE,
} from "@/shared/constants/app.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formToOccupationalRiskPayload } from "@/shared/helpers/occupational-risk-form.helper";
import { removeItemFromPaginatedList } from "@/shared/helpers/paginated-list.helper";
import type { IOccupationalRisk } from "@/shared/interfaces/https/occupational-risk";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import { occupationalRiskService } from "@/shared/services/occupational-risk.service";
import type { OccupationalRiskCategory } from "@/shared/types/occupational-risk-category.types";
import type { OccupationalRiskFormData } from "@/types/occupational-risk-form.types";

export interface OccupationalRisksContextValue {
  risks: IOccupationalRisk[];
  meta: IPaginationMeta | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  categoryFilter: OccupationalRiskCategory | "";
  descriptionFilter: string;
  page: number;
  setCategoryFilter: (value: OccupationalRiskCategory | "") => void;
  setDescriptionFilter: (value: string) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  createRisk: (data: OccupationalRiskFormData) => Promise<void>;
  updateRisk: (id: string, data: OccupationalRiskFormData) => Promise<void>;
  deleteRisk: (id: string) => Promise<void>;
}

const OccupationalRisksContext =
  createContext<OccupationalRisksContextValue | null>(null);

export function OccupationalRisksProvider({ children }: { children: ReactNode }) {
  const { startRequest, isStaleRequest, invalidateRequests } =
    useRequestGeneration();
  const [risks, setRisks] = useState<IOccupationalRisk[]>([]);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilterState] = useState<
    OccupationalRiskCategory | ""
  >("");
  const [descriptionFilter, setDescriptionFilterState] = useState("");
  const [debouncedDescription, setDebouncedDescription] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedDescription(descriptionFilter.trim());
      setPage(1);
      setIsLoading(true);
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [descriptionFilter]);

  const handleCategoryFilterChange = useCallback(
    (value: OccupationalRiskCategory | "") => {
      setCategoryFilterState(value);
      setPage(1);
      setIsLoading(true);
    },
    []
  );

  const handleDescriptionFilterChange = useCallback((value: string) => {
    setDescriptionFilterState(value);
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    setIsLoading(true);
    setPage(nextPage);
  }, []);

  const listParams = useMemo(
    () => ({
      page,
      pageSize: TABLE_PAGE_SIZE,
      ...(categoryFilter ? { category: categoryFilter } : {}),
      ...(debouncedDescription ? { description: debouncedDescription } : {}),
    }),
    [page, categoryFilter, debouncedDescription]
  );

  const fetchRisks = useCallback(
    async (showLoading = false) => {
      const requestId = startRequest();

      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const response = await occupationalRiskService.list(listParams);

        if (isStaleRequest(requestId)) return;

        setRisks(response.data);
        setMeta(response.meta);
        setError(null);
      } catch (err) {
        if (isStaleRequest(requestId)) return;

        setRisks([]);
        setMeta(null);
        setError(
          getApiErrorMessage(
            err,
            "Não foi possível carregar os riscos ocupacionais."
          )
        );
      } finally {
        if (!isStaleRequest(requestId)) {
          setIsLoading(false);
        }
      }
    },
    [listParams, startRequest, isStaleRequest]
  );

  useEffect(() => {
    let active = true;
    const requestId = startRequest();

    occupationalRiskService
      .list(listParams)
      .then((response) => {
        if (!active || isStaleRequest(requestId)) return;
        setRisks(response.data);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        if (!active || isStaleRequest(requestId)) return;
        setRisks([]);
        setMeta(null);
        setError(
          getApiErrorMessage(
            err,
            "Não foi possível carregar os riscos ocupacionais."
          )
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
  }, [listParams, startRequest, isStaleRequest]);

  const createRisk = useCallback(
    async (formData: OccupationalRiskFormData) => {
      setIsSubmitting(true);
      try {
        await occupationalRiskService.create(
          formToOccupationalRiskPayload(formData)
        );
        invalidateRequests();
        if (page === 1) {
          await fetchRisks();
        } else {
          setIsLoading(true);
          setPage(1);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [page, fetchRisks, invalidateRequests]
  );

  const updateRisk = useCallback(
    async (id: string, formData: OccupationalRiskFormData) => {
      setIsSubmitting(true);
      try {
        await occupationalRiskService.update(
          id,
          formToOccupationalRiskPayload(formData)
        );
        invalidateRequests();
        await fetchRisks();
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchRisks, invalidateRequests]
  );

  const deleteRisk = useCallback(
    async (id: string) => {
      setIsSubmitting(true);
      try {
        await occupationalRiskService.delete(id);
        invalidateRequests();

        const isLastOnPage = risks.length === 1;
        const { items, meta: nextMeta } = removeItemFromPaginatedList(
          risks,
          id,
          meta
        );
        setRisks(items);
        setMeta(nextMeta);

        if (isLastOnPage && page > 1) {
          setIsLoading(true);
          setPage((current) => current - 1);
        } else {
          await fetchRisks();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [risks, meta, page, fetchRisks, invalidateRequests]
  );

  const value = useMemo<OccupationalRisksContextValue>(
    () => ({
      risks,
      meta,
      isLoading,
      isSubmitting,
      error,
      categoryFilter,
      descriptionFilter,
      page,
      setCategoryFilter: handleCategoryFilterChange,
      setDescriptionFilter: handleDescriptionFilterChange,
      setPage: handlePageChange,
      refetch: () => fetchRisks(true),
      createRisk,
      updateRisk,
      deleteRisk,
    }),
    [
      risks,
      meta,
      isLoading,
      isSubmitting,
      error,
      categoryFilter,
      descriptionFilter,
      page,
      handleCategoryFilterChange,
      handleDescriptionFilterChange,
      handlePageChange,
      fetchRisks,
      createRisk,
      updateRisk,
      deleteRisk,
    ]
  );

  return (
    <OccupationalRisksContext.Provider value={value}>
      {children}
    </OccupationalRisksContext.Provider>
  );
}

export function useOccupationalRisks() {
  const context = useContext(OccupationalRisksContext);

  if (!context) {
    throw new Error(
      "useOccupationalRisks deve ser usado dentro de OccupationalRisksProvider"
    );
  }

  return context;
}

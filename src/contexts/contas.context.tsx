import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ContasContext, type ContasContextValue } from "@/contexts/contas-context";
import { useRequestGeneration } from "@/hooks/use-request-generation";
import {
  FILTER_DEBOUNCE_MS,
  TABLE_PAGE_SIZE,
} from "@/shared/constants/app.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formToContaPayload } from "@/shared/helpers/conta-form.helper";
import { removeItemFromPaginatedList } from "@/shared/helpers/paginated-list.helper";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import type { IConta } from "@/shared/interfaces/https/conta";
import type { ContaStatus } from "@/shared/types/conta-status.types";
import { contaService } from "@/shared/services/conta.service";
import type { ContasReportListParams } from "@/pdf/contas-report.types";
import type { ContaFormData } from "@/types/conta-form.types";

export function ContasProvider({ children }: { children: ReactNode }) {
  const { startRequest, isStaleRequest, invalidateRequests } =
    useRequestGeneration();
  const [contas, setContas] = useState<IConta[]>([]);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [nomeFilter, setNomeFilter] = useState("");
  const [debouncedNome, setDebouncedNome] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContaStatus | "">("");
  const [dataVencimentoFromFilter, setDataVencimentoFromFilter] = useState("");
  const [dataVencimentoToFilter, setDataVencimentoToFilter] = useState("");
  const [dataPagamentoFromFilter, setDataPagamentoFromFilter] = useState("");
  const [dataPagamentoToFilter, setDataPagamentoToFilter] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = nomeFilter.trim();
      setDebouncedNome((prev) => (prev === next ? prev : next));
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [nomeFilter]);

  useEffect(() => {
    setPage(1);
  }, [debouncedNome]);

  const handleStatusFilterChange = useCallback((value: ContaStatus | "") => {
    setStatusFilter(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handleDataVencimentoFromChange = useCallback((value: string) => {
    setDataVencimentoFromFilter(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handleDataVencimentoToChange = useCallback((value: string) => {
    setDataVencimentoToFilter(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handleDataPagamentoFromChange = useCallback((value: string) => {
    setDataPagamentoFromFilter(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handleDataPagamentoToChange = useCallback((value: string) => {
    setDataPagamentoToFilter(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    setIsLoading(true);
    setPage(nextPage);
  }, []);

  const exportListParams = useMemo<ContasReportListParams>(
    () => ({
      ...(debouncedNome ? { nome: debouncedNome } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(dataVencimentoFromFilter
        ? { dataVencimentoFrom: dataVencimentoFromFilter }
        : {}),
      ...(dataVencimentoToFilter
        ? { dataVencimentoTo: dataVencimentoToFilter }
        : {}),
      ...(dataPagamentoFromFilter
        ? { dataPagamentoFrom: dataPagamentoFromFilter }
        : {}),
      ...(dataPagamentoToFilter
        ? { dataPagamentoTo: dataPagamentoToFilter }
        : {}),
    }),
    [
      debouncedNome,
      statusFilter,
      dataVencimentoFromFilter,
      dataVencimentoToFilter,
      dataPagamentoFromFilter,
      dataPagamentoToFilter,
    ]
  );

  const listParams = useMemo(
    () => ({
      page,
      pageSize: TABLE_PAGE_SIZE,
      ...exportListParams,
    }),
    [page, exportListParams]
  );

  const fetchContas = useCallback(
    async (showLoading = false) => {
      const requestId = startRequest();

      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await contaService.list(listParams);

        if (isStaleRequest(requestId)) return;

        setContas(response.data);
        setMeta(response.meta);
      } catch (err) {
        if (isStaleRequest(requestId)) return;

        setContas([]);
        setMeta(null);
        setError(
          getApiErrorMessage(err, "Não foi possível carregar as contas.")
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

    setIsLoading(true);
    setError(null);

    contaService
      .list(listParams)
      .then((response) => {
        if (!active || isStaleRequest(requestId)) return;
        setContas(response.data);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        if (!active || isStaleRequest(requestId)) return;
        setContas([]);
        setMeta(null);
        setError(
          getApiErrorMessage(err, "Não foi possível carregar as contas.")
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

  const createConta = useCallback(
    async (formData: ContaFormData) => {
      setIsSubmitting(true);
      try {
        await contaService.create(formToContaPayload(formData));
        invalidateRequests();
        if (page === 1) {
          await fetchContas();
        } else {
          setPage(1);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [page, fetchContas, invalidateRequests]
  );

  const updateConta = useCallback(
    async (id: string, formData: ContaFormData) => {
      setIsSubmitting(true);
      try {
        await contaService.update(id, formToContaPayload(formData));
        invalidateRequests();
        await fetchContas();
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchContas, invalidateRequests]
  );

  const deleteConta = useCallback(
    async (id: string) => {
      setIsSubmitting(true);
      try {
        await contaService.delete(id);
        invalidateRequests();

        const isLastOnPage = contas.length === 1;
        const { items, meta: nextMeta } = removeItemFromPaginatedList(
          contas,
          id,
          meta
        );
        setContas(items);
        setMeta(nextMeta);

        if (isLastOnPage && page > 1) {
          setPage((current) => current - 1);
        } else {
          await fetchContas();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [contas, meta, page, fetchContas, invalidateRequests]
  );

  const value = useMemo<ContasContextValue>(
    () => ({
      contas,
      meta,
      isLoading,
      isSubmitting,
      error,
      nomeFilter,
      statusFilter,
      dataVencimentoFromFilter,
      dataVencimentoToFilter,
      dataPagamentoFromFilter,
      dataPagamentoToFilter,
      exportListParams,
      page,
      setNomeFilter,
      setStatusFilter: handleStatusFilterChange,
      setDataVencimentoFromFilter: handleDataVencimentoFromChange,
      setDataVencimentoToFilter: handleDataVencimentoToChange,
      setDataPagamentoFromFilter: handleDataPagamentoFromChange,
      setDataPagamentoToFilter: handleDataPagamentoToChange,
      setPage: handlePageChange,
      refetch: () => fetchContas(true),
      createConta,
      updateConta,
      deleteConta,
    }),
    [
      contas,
      meta,
      isLoading,
      isSubmitting,
      error,
      nomeFilter,
      statusFilter,
      dataVencimentoFromFilter,
      dataVencimentoToFilter,
      dataPagamentoFromFilter,
      dataPagamentoToFilter,
      exportListParams,
      page,
      handleStatusFilterChange,
      handleDataVencimentoFromChange,
      handleDataVencimentoToChange,
      handleDataPagamentoFromChange,
      handleDataPagamentoToChange,
      handlePageChange,
      fetchContas,
      createConta,
      updateConta,
      deleteConta,
    ]
  );

  return (
    <ContasContext.Provider value={value}>{children}</ContasContext.Provider>
  );
}

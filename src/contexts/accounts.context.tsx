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
import { formToAccountPayload, type AccountFormData } from "@/schemas/account.schema";
import { removeItemFromPaginatedList } from "@/shared/helpers/paginated-list.helper";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import type { IAccount } from "@/shared/interfaces/https/account";
import type { AccountStatus } from "@/shared/types/account-status.types";
import { accountService } from "@/shared/services/account.service";
import type { AccountsReportListParams } from "@/pdf/accounts-report.types";

export interface AccountsContextValue {
  accounts: IAccount[];
  meta: IPaginationMeta | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  nameFilter: string;
  statusFilter: AccountStatus | "";
  dueDateFromFilter: string;
  dueDateToFilter: string;
  paidAtFromFilter: string;
  paidAtToFilter: string;
  exportListParams: AccountsReportListParams;
  page: number;
  setNameFilter: (value: string) => void;
  setStatusFilter: (value: AccountStatus | "") => void;
  setDueDateFromFilter: (value: string) => void;
  setDueDateToFilter: (value: string) => void;
  setPaidAtFromFilter: (value: string) => void;
  setPaidAtToFilter: (value: string) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  createAccount: (data: AccountFormData) => Promise<void>;
  updateAccount: (id: string, data: AccountFormData) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
}

const AccountsContext = createContext<AccountsContextValue | null>(null);

export function AccountsProvider({ children }: { children: ReactNode }) {
  const { startRequest, isStaleRequest, invalidateRequests } =
    useRequestGeneration();
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");
  const [debouncedName, setDebouncedName] = useState("");
  const [statusFilter, setStatusFilter] = useState<AccountStatus | "">("");
  const [dueDateFromFilter, setDueDateFromFilter] = useState("");
  const [dueDateToFilter, setDueDateToFilter] = useState("");
  const [paidAtFromFilter, setPaidAtFromFilter] = useState("");
  const [paidAtToFilter, setPaidAtToFilter] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = nameFilter.trim();
      setDebouncedName((prev) => (prev === next ? prev : next));
      setPage(1);
      setIsLoading(true);
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [nameFilter]);

  const handleStatusFilterChange = useCallback((value: AccountStatus | "") => {
    setStatusFilter(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handleDueDateFromChange = useCallback((value: string) => {
    setDueDateFromFilter(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handleDueDateToChange = useCallback((value: string) => {
    setDueDateToFilter(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handlePaidAtFromChange = useCallback((value: string) => {
    setPaidAtFromFilter(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handlePaidAtToChange = useCallback((value: string) => {
    setPaidAtToFilter(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    setIsLoading(true);
    setPage(nextPage);
  }, []);

  const exportListParams = useMemo<AccountsReportListParams>(
    () => ({
      ...(debouncedName ? { name: debouncedName } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(dueDateFromFilter ? { dueDateFrom: dueDateFromFilter } : {}),
      ...(dueDateToFilter ? { dueDateTo: dueDateToFilter } : {}),
      ...(paidAtFromFilter ? { paidAtFrom: paidAtFromFilter } : {}),
      ...(paidAtToFilter ? { paidAtTo: paidAtToFilter } : {}),
    }),
    [
      debouncedName,
      statusFilter,
      dueDateFromFilter,
      dueDateToFilter,
      paidAtFromFilter,
      paidAtToFilter,
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

  const fetchAccounts = useCallback(
    async (showLoading = false) => {
      const requestId = startRequest();

      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const response = await accountService.list(listParams);

        if (isStaleRequest(requestId)) return;

        setAccounts(response.data);
        setMeta(response.meta);
        setError(null);
      } catch (err) {
        if (isStaleRequest(requestId)) return;

        setAccounts([]);
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

    accountService
      .list(listParams)
      .then((response) => {
        if (!active || isStaleRequest(requestId)) return;
        setAccounts(response.data);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        if (!active || isStaleRequest(requestId)) return;
        setAccounts([]);
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

  const createAccount = useCallback(
    async (formData: AccountFormData) => {
      setIsSubmitting(true);
      try {
        await accountService.create(formToAccountPayload(formData));
        invalidateRequests();
        if (page === 1) {
          await fetchAccounts();
        } else {
          setIsLoading(true);
          setPage(1);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [page, fetchAccounts, invalidateRequests]
  );

  const updateAccount = useCallback(
    async (id: string, formData: AccountFormData) => {
      setIsSubmitting(true);
      try {
        await accountService.update(id, formToAccountPayload(formData));
        invalidateRequests();
        await fetchAccounts();
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchAccounts, invalidateRequests]
  );

  const deleteAccount = useCallback(
    async (id: string) => {
      setIsSubmitting(true);
      try {
        await accountService.delete(id);
        invalidateRequests();

        const isLastOnPage = accounts.length === 1;
        const { items, meta: nextMeta } = removeItemFromPaginatedList(
          accounts,
          id,
          meta
        );
        setAccounts(items);
        setMeta(nextMeta);

        if (isLastOnPage && page > 1) {
          setIsLoading(true);
          setPage((current) => current - 1);
        } else {
          await fetchAccounts();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [accounts, meta, page, fetchAccounts, invalidateRequests]
  );

  const value = useMemo<AccountsContextValue>(
    () => ({
      accounts,
      meta,
      isLoading,
      isSubmitting,
      error,
      nameFilter,
      statusFilter,
      dueDateFromFilter,
      dueDateToFilter,
      paidAtFromFilter,
      paidAtToFilter,
      exportListParams,
      page,
      setNameFilter,
      setStatusFilter: handleStatusFilterChange,
      setDueDateFromFilter: handleDueDateFromChange,
      setDueDateToFilter: handleDueDateToChange,
      setPaidAtFromFilter: handlePaidAtFromChange,
      setPaidAtToFilter: handlePaidAtToChange,
      setPage: handlePageChange,
      refetch: () => fetchAccounts(true),
      createAccount,
      updateAccount,
      deleteAccount,
    }),
    [
      accounts,
      meta,
      isLoading,
      isSubmitting,
      error,
      nameFilter,
      statusFilter,
      dueDateFromFilter,
      dueDateToFilter,
      paidAtFromFilter,
      paidAtToFilter,
      exportListParams,
      page,
      handleStatusFilterChange,
      handleDueDateFromChange,
      handleDueDateToChange,
      handlePaidAtFromChange,
      handlePaidAtToChange,
      handlePageChange,
      fetchAccounts,
      createAccount,
      updateAccount,
      deleteAccount,
    ]
  );

  return (
    <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountsContext);

  if (!context) {
    throw new Error("useAccounts deve ser usado dentro de AccountsProvider");
  }

  return context;
}

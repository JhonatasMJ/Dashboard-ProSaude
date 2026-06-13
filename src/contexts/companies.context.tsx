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
import { formToCompanyPayload, type CompanyFormData } from "@/schemas/company.schema";
import { removeItemFromPaginatedList } from "@/shared/helpers/paginated-list.helper";
import type { ICompany } from "@/shared/interfaces/https/company";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import { companyService } from "@/shared/services/company.service";

export interface CompaniesContextValue {
  companies: ICompany[];
  meta: IPaginationMeta | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  nameFilter: string;
  page: number;
  setNameFilter: (value: string) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  createCompany: (data: CompanyFormData) => Promise<void>;
  updateCompany: (id: string, data: CompanyFormData) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
}

const CompaniesContext = createContext<CompaniesContextValue | null>(null);

export function CompaniesProvider({ children }: { children: ReactNode }) {
  const { startRequest, isStaleRequest, invalidateRequests } =
    useRequestGeneration();
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");
  const [debouncedName, setDebouncedName] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedName(nameFilter.trim());
      setPage(1);
      setIsLoading(true);
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [nameFilter]);

  const handlePageChange = useCallback((nextPage: number) => {
    setIsLoading(true);
    setPage(nextPage);
  }, []);

  const fetchCompanies = useCallback(
    async (showLoading = false) => {
      const requestId = startRequest();

      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const response = await companyService.list({
          page,
          pageSize: TABLE_PAGE_SIZE,
          ...(debouncedName ? { name: debouncedName } : {}),
        });

        if (isStaleRequest(requestId)) return;

        setCompanies(response.data);
        setMeta(response.meta);
        setError(null);
      } catch (err) {
        if (isStaleRequest(requestId)) return;

        setCompanies([]);
        setMeta(null);
        setError(
          getApiErrorMessage(err, "Não foi possível carregar as empresas.")
        );
      } finally {
        if (!isStaleRequest(requestId)) {
          setIsLoading(false);
        }
      }
    },
    [page, debouncedName, startRequest, isStaleRequest]
  );

  useEffect(() => {
    let active = true;
    const requestId = startRequest();

    companyService
      .list({
        page,
        pageSize: TABLE_PAGE_SIZE,
        ...(debouncedName ? { name: debouncedName } : {}),
      })
      .then((response) => {
        if (!active || isStaleRequest(requestId)) return;
        setCompanies(response.data);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        if (!active || isStaleRequest(requestId)) return;
        setCompanies([]);
        setMeta(null);
        setError(
          getApiErrorMessage(err, "Não foi possível carregar as empresas.")
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
  }, [page, debouncedName, startRequest, isStaleRequest]);

  const createCompany = useCallback(
    async (formData: CompanyFormData) => {
      setIsSubmitting(true);
      try {
        await companyService.create(formToCompanyPayload(formData));
        invalidateRequests();
        if (page === 1) {
          await fetchCompanies();
        } else {
          setIsLoading(true);
          setPage(1);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [page, fetchCompanies, invalidateRequests]
  );

  const updateCompany = useCallback(
    async (id: string, formData: CompanyFormData) => {
      setIsSubmitting(true);
      try {
        await companyService.update(id, formToCompanyPayload(formData));
        invalidateRequests();
        await fetchCompanies();
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchCompanies, invalidateRequests]
  );

  const deleteCompany = useCallback(
    async (id: string) => {
      setIsSubmitting(true);
      try {
        await companyService.delete(id);
        invalidateRequests();

        const isLastOnPage = companies.length === 1;
        const { items, meta: nextMeta } = removeItemFromPaginatedList(
          companies,
          id,
          meta
        );
        setCompanies(items);
        setMeta(nextMeta);

        if (isLastOnPage && page > 1) {
          setIsLoading(true);
          setPage((current) => current - 1);
        } else {
          await fetchCompanies();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [companies, meta, page, fetchCompanies, invalidateRequests]
  );

  const value = useMemo<CompaniesContextValue>(
    () => ({
      companies,
      meta,
      isLoading,
      isSubmitting,
      error,
      nameFilter,
      page,
      setNameFilter,
      setPage: handlePageChange,
      refetch: () => fetchCompanies(true),
      createCompany,
      updateCompany,
      deleteCompany,
    }),
    [
      companies,
      meta,
      isLoading,
      isSubmitting,
      error,
      nameFilter,
      page,
      handlePageChange,
      fetchCompanies,
      createCompany,
      updateCompany,
      deleteCompany,
    ]
  );

  return (
    <CompaniesContext.Provider value={value}>
      {children}
    </CompaniesContext.Provider>
  );
}

export function useCompanies() {
  const context = useContext(CompaniesContext);

  if (!context) {
    throw new Error("useCompanies deve ser usado dentro de CompaniesProvider");
  }

  return context;
}

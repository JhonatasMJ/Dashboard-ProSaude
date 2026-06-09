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
  BULK_LIST_PAGE_SIZE,
  FILTER_DEBOUNCE_MS,
  TABLE_PAGE_SIZE,
} from "@/shared/constants/app.constants";
import type { ICompany } from "@/shared/interfaces/https/company";
import { companyService } from "@/shared/services/company.service";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { isAllCompaniesExamSelection } from "@/shared/constants/exam.constants";
import {
  formToExamCreatePayload,
  formToExamCreatePayloads,
  formToExamUpdatePayload,
} from "@/shared/helpers/exam-form.helper";
import { removeItemFromPaginatedList } from "@/shared/helpers/paginated-list.helper";
import type { IExam } from "@/shared/interfaces/https/exam";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import { examService } from "@/shared/services/exam.service";
import type { ExamFormData } from "@/types/exam-form.types";

export interface ExamsContextValue {
  exams: IExam[];
  meta: IPaginationMeta | null;
  companies: ICompany[];
  isLoading: boolean;
  isLoadingFilters: boolean;
  isSubmitting: boolean;
  error: string | null;
  nameFilter: string;
  companyIdFilter: string;
  page: number;
  setNameFilter: (value: string) => void;
  setCompanyIdFilter: (value: string) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  createExam: (data: ExamFormData) => Promise<void>;
  updateExam: (id: string, data: ExamFormData) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
}

const ExamsContext = createContext<ExamsContextValue | null>(null);

export function ExamsProvider({ children }: { children: ReactNode }) {
  const { startRequest, isStaleRequest, invalidateRequests } =
    useRequestGeneration();
  const [exams, setExams] = useState<IExam[]>([]);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");
  const [debouncedName, setDebouncedName] = useState("");
  const [companyIdFilter, setCompanyIdFilter] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedName(nameFilter.trim());
      setPage(1);
      setIsLoading(true);
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [nameFilter]);

  const handleCompanyFilterChange = useCallback((value: string) => {
    setCompanyIdFilter(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    setIsLoading(true);
    setPage(nextPage);
  }, []);

  useEffect(() => {
    let active = true;

    companyService
      .list({ page: 1, pageSize: BULK_LIST_PAGE_SIZE })
      .then((response) => {
        if (!active) return;
        setCompanies(response.data);
      })
      .catch(() => {
        if (!active) return;
        setCompanies([]);
      })
      .finally(() => {
        if (active) {
          setIsLoadingFilters(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const fetchExams = useCallback(
    async (showLoading = false) => {
      const requestId = startRequest();

      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const response = await examService.list({
          page,
          pageSize: TABLE_PAGE_SIZE,
          ...(debouncedName ? { name: debouncedName } : {}),
          ...(companyIdFilter ? { companyId: companyIdFilter } : {}),
        });

        if (isStaleRequest(requestId)) return;

        setExams(response.data);
        setMeta(response.meta);
        setError(null);
      } catch (err) {
        if (isStaleRequest(requestId)) return;

        setExams([]);
        setMeta(null);
        setError(
          getApiErrorMessage(err, "Não foi possível carregar os exames.")
        );
      } finally {
        if (!isStaleRequest(requestId)) {
          setIsLoading(false);
        }
      }
    },
    [page, debouncedName, companyIdFilter, startRequest, isStaleRequest]
  );

  useEffect(() => {
    let active = true;
    const requestId = startRequest();

    examService
      .list({
        page,
        pageSize: TABLE_PAGE_SIZE,
        ...(debouncedName ? { name: debouncedName } : {}),
        ...(companyIdFilter ? { companyId: companyIdFilter } : {}),
      })
      .then((response) => {
        if (!active || isStaleRequest(requestId)) return;
        setExams(response.data);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        if (!active || isStaleRequest(requestId)) return;
        setExams([]);
        setMeta(null);
        setError(
          getApiErrorMessage(err, "Não foi possível carregar os exames.")
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
  }, [page, debouncedName, companyIdFilter, startRequest, isStaleRequest]);

  const createExam = useCallback(
    async (formData: ExamFormData) => {
      setIsSubmitting(true);
      try {
        if (isAllCompaniesExamSelection(formData.companyId)) {
          const payloads = formToExamCreatePayloads(
            formData,
            companies.map((company) => company.id)
          );
          await Promise.all(
            payloads.map((payload) => examService.create(payload))
          );
        } else {
          await examService.create(
            formToExamCreatePayload(formData, formData.companyId)
          );
        }

        invalidateRequests();
        if (page === 1) {
          await fetchExams();
        } else {
          setIsLoading(true);
          setPage(1);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [page, companies, fetchExams, invalidateRequests]
  );

  const updateExam = useCallback(
    async (id: string, formData: ExamFormData) => {
      setIsSubmitting(true);
      try {
        const payload = formToExamUpdatePayload(formData);

        if (isAllCompaniesExamSelection(formData.companyId)) {
          const normalizedName = formData.name.trim().toLowerCase();
          const listResponse = await examService.list({
            page: 1,
            pageSize: BULK_LIST_PAGE_SIZE,
            name: formData.name.trim(),
          });
          const targets = listResponse.data.filter(
            (item) => item.name.trim().toLowerCase() === normalizedName
          );

          await Promise.all(
            targets.map((item) => examService.update(item.id, payload))
          );
        } else {
          await examService.update(id, payload);
        }

        invalidateRequests();
        await fetchExams();
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchExams, invalidateRequests]
  );

  const deleteExam = useCallback(
    async (id: string) => {
      setIsSubmitting(true);
      try {
        await examService.delete(id);
        invalidateRequests();

        const isLastOnPage = exams.length === 1;
        const { items, meta: nextMeta } = removeItemFromPaginatedList(
          exams,
          id,
          meta
        );
        setExams(items);
        setMeta(nextMeta);

        if (isLastOnPage && page > 1) {
          setIsLoading(true);
          setPage((current) => current - 1);
        } else {
          await fetchExams();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [exams, meta, page, fetchExams, invalidateRequests]
  );

  const value = useMemo<ExamsContextValue>(
    () => ({
      exams,
      meta,
      companies,
      isLoading,
      isLoadingFilters,
      isSubmitting,
      error,
      nameFilter,
      companyIdFilter,
      page,
      setNameFilter,
      setCompanyIdFilter: handleCompanyFilterChange,
      setPage: handlePageChange,
      refetch: () => fetchExams(true),
      createExam,
      updateExam,
      deleteExam,
    }),
    [
      exams,
      meta,
      companies,
      isLoading,
      isLoadingFilters,
      isSubmitting,
      error,
      nameFilter,
      companyIdFilter,
      page,
      handleCompanyFilterChange,
      handlePageChange,
      fetchExams,
      createExam,
      updateExam,
      deleteExam,
    ]
  );

  return (
    <ExamsContext.Provider value={value}>{children}</ExamsContext.Provider>
  );
}

export function useExams() {
  const context = useContext(ExamsContext);

  if (!context) {
    throw new Error("useExams deve ser usado dentro de ExamsProvider");
  }

  return context;
}

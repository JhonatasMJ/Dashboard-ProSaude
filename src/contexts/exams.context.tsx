import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ExamsContext, type ExamsContextValue } from "@/contexts/exams-context";
import { useRequestGeneration } from "@/hooks/use-request-generation";
import {
  FILTER_DEBOUNCE_MS,
  TABLE_PAGE_SIZE,
} from "@/shared/constants/app.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import {
  formToExamCreatePayload,
  formToExamUpdatePayload,
} from "@/shared/helpers/exam-form.helper";
import { removeItemFromPaginatedList } from "@/shared/helpers/paginated-list.helper";
import type { IExam } from "@/shared/interfaces/https/exam";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import { examService } from "@/shared/services/exam.service";
import type { ExamFormData } from "@/types/exam-form.types";

export function ExamsProvider({ children }: { children: ReactNode }) {
  const { startRequest, isStaleRequest, invalidateRequests } =
    useRequestGeneration();
  const [exams, setExams] = useState<IExam[]>([]);
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
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [nameFilter]);

  const fetchExams = useCallback(
    async (showLoading = false) => {
      const requestId = startRequest();

      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await examService.list({
          page,
          pageSize: TABLE_PAGE_SIZE,
          ...(debouncedName ? { name: debouncedName } : {}),
        });

        if (isStaleRequest(requestId)) return;

        setExams(response.data);
        setMeta(response.meta);
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
    [page, debouncedName, startRequest, isStaleRequest]
  );

  useEffect(() => {
    let active = true;
    const requestId = startRequest();

    setIsLoading(true);
    setError(null);

    examService
      .list({
        page,
        pageSize: TABLE_PAGE_SIZE,
        ...(debouncedName ? { name: debouncedName } : {}),
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
  }, [page, debouncedName, startRequest, isStaleRequest]);

  const createExam = useCallback(
    async (formData: ExamFormData) => {
      setIsSubmitting(true);
      try {
        await examService.create(formToExamCreatePayload(formData));
        invalidateRequests();
        if (page === 1) {
          await fetchExams();
        } else {
          setPage(1);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [page, fetchExams, invalidateRequests]
  );

  const updateExam = useCallback(
    async (id: string, formData: ExamFormData) => {
      setIsSubmitting(true);
      try {
        await examService.update(id, formToExamUpdatePayload(formData));
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
      isLoading,
      isSubmitting,
      error,
      nameFilter,
      page,
      setNameFilter,
      setPage,
      refetch: () => fetchExams(true),
      createExam,
      updateExam,
      deleteExam,
    }),
    [
      exams,
      meta,
      isLoading,
      isSubmitting,
      error,
      nameFilter,
      page,
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

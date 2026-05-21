import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ExamsContext, type ExamsContextValue } from "@/contexts/exams-context";
import {
  EXAMS_FILTER_DEBOUNCE_MS,
  EXAMS_PAGE_SIZE,
} from "@/shared/constants/exams.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import {
  formToExamCreatePayload,
  formToExamUpdatePayload,
} from "@/shared/helpers/exam-form.helper";
import type { IExam } from "@/shared/interfaces/https/exam";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import { examService } from "@/shared/services/exam.service";
import type { ExamFormData } from "@/types/exam-form.types";

export function ExamsProvider({ children }: { children: ReactNode }) {
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
    }, EXAMS_FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [nameFilter]);

  const fetchExams = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await examService.list({
          page,
          pageSize: EXAMS_PAGE_SIZE,
          ...(debouncedName ? { name: debouncedName } : {}),
        });
        setExams(response.data);
        setMeta(response.meta);
      } catch (err) {
        setExams([]);
        setMeta(null);
        setError(
          getApiErrorMessage(err, "Não foi possível carregar os exames.")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [page, debouncedName]
  );

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setError(null);

    examService
      .list({
        page,
        pageSize: EXAMS_PAGE_SIZE,
        ...(debouncedName ? { name: debouncedName } : {}),
      })
      .then((response) => {
        if (active) {
          setExams(response.data);
          setMeta(response.meta);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setExams([]);
          setMeta(null);
          setError(
            getApiErrorMessage(err, "Não foi possível carregar os exames.")
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
  }, [page, debouncedName]);

  const createExam = useCallback(
    async (formData: ExamFormData) => {
      setIsSubmitting(true);
      try {
        await examService.create(formToExamCreatePayload(formData));
        if (page === 1) {
          await fetchExams();
        } else {
          setPage(1);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [page, fetchExams]
  );

  const updateExam = useCallback(
    async (id: string, formData: ExamFormData) => {
      setIsSubmitting(true);
      try {
        await examService.update(id, formToExamUpdatePayload(formData));
        await fetchExams();
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchExams]
  );

  const deleteExam = useCallback(
    async (id: string) => {
      setIsSubmitting(true);
      try {
        await examService.delete(id);
        const isLastOnPage = exams.length === 1;
        if (isLastOnPage && page > 1) {
          setPage((current) => current - 1);
        } else {
          await fetchExams();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [exams.length, page, fetchExams]
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

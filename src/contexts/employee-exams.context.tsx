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
import {
  dateOnlyToPaidAtIso,
  normalizeToDateOnly,
} from "@/shared/helpers/date.helper";
import { fetchAllPaginated } from "@/shared/helpers/fetch-all-paginated.helper";
import {
  formToEmployeeExamCreatePayloads,
  formToEmployeeExamUpdatePayload,
  type EmployeeExamFormData,
} from "@/schemas/employee-exam.schema";
import { removeItemFromPaginatedList } from "@/shared/helpers/paginated-list.helper";
import type { ICompany } from "@/shared/interfaces/https/company";
import type { IEmployee } from "@/shared/interfaces/https/employee";
import type { IEmployeeExam } from "@/shared/interfaces/https/employee-exam";
import type { IExam } from "@/shared/interfaces/https/exam";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import { companyService } from "@/shared/services/company.service";
import { employeeExamService } from "@/shared/services/employee-exam.service";
import { employeeService } from "@/shared/services/employee.service";
import { examService } from "@/shared/services/exam.service";
import type { EmployeeExamsReportListParams } from "@/pdf/employee-exams-report.types";
import type { PaymentStatus } from "@/shared/types/payment-status.types";

export interface EmployeeExamsContextValue {
  links: IEmployeeExam[];
  meta: IPaginationMeta | null;
  companies: ICompany[];
  employees: IEmployee[];
  exams: IExam[];
  isLoading: boolean;
  isLoadingFilters: boolean;
  isSubmitting: boolean;
  error: string | null;
  professionalNameFilter: string;
  companyIdFilter: string;
  employeeIdFilter: string;
  examIdFilter: string;
  paymentStatusFilter: PaymentStatus | "";
  examDateFromFilter: string;
  examDateToFilter: string;
  exportListParams: EmployeeExamsReportListParams;
  page: number;
  setProfessionalNameFilter: (value: string) => void;
  setCompanyIdFilter: (value: string) => void;
  setEmployeeIdFilter: (value: string) => void;
  setExamIdFilter: (value: string) => void;
  setPaymentStatusFilter: (value: PaymentStatus | "") => void;
  setExamDateFromFilter: (value: string) => void;
  setExamDateToFilter: (value: string) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  refetchFilterOptions: () => Promise<void>;
  createLink: (data: EmployeeExamFormData) => Promise<void>;
  updateLink: (id: string, data: EmployeeExamFormData) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  bulkPayLinks: (ids: string[], paidAt: string) => Promise<void>;
}

const EmployeeExamsContext = createContext<EmployeeExamsContextValue | null>(
  null
);

async function loadFilterOptionsData(companyIdFilter: string) {
  return Promise.all([
    fetchAllPaginated((page, pageSize) =>
      companyService.list({ page, pageSize })
    ),
    fetchAllPaginated((page, pageSize) =>
      employeeService.list({
        page,
        pageSize,
        ...(companyIdFilter ? { companyId: companyIdFilter } : {}),
      })
    ),
    fetchAllPaginated((page, pageSize) =>
      examService.list({ page, pageSize })
    ),
  ]);
}

export function EmployeeExamsProvider({ children }: { children: ReactNode }) {
  const { startRequest, isStaleRequest, invalidateRequests } =
    useRequestGeneration();
  const [links, setLinks] = useState<IEmployeeExam[]>([]);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [exams, setExams] = useState<IExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [professionalNameFilter, setProfessionalNameFilter] = useState("");
  const [debouncedProfessionalName, setDebouncedProfessionalName] =
    useState("");
  const [companyIdFilter, setCompanyIdFilter] = useState("");
  const [employeeIdFilter, setEmployeeIdFilter] = useState("");
  const [examIdFilter, setExamIdFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<
    PaymentStatus | ""
  >("");
  const [examDateFromFilter, setExamDateFromFilter] = useState("");
  const [examDateToFilter, setExamDateToFilter] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = professionalNameFilter.trim();
      setDebouncedProfessionalName((prev) => (prev === next ? prev : next));
      setPage(1);
      setIsLoading(true);
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [professionalNameFilter]);

  const handleCompanyFilterChange = useCallback((value: string) => {
    setCompanyIdFilter(value);
    setEmployeeIdFilter("");
    setPage(1);
    setIsLoadingFilters(true);
    setIsLoading(true);
  }, []);

  const handleEmployeeFilterChange = useCallback((value: string) => {
    setEmployeeIdFilter(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handleExamFilterChange = useCallback((value: string) => {
    setExamIdFilter(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handlePaymentStatusFilterChange = useCallback(
    (value: PaymentStatus | "") => {
      setPaymentStatusFilter(value);
      setPage(1);
      setIsLoading(true);
    },
    []
  );

  const handleExamDateFromChange = useCallback((value: string) => {
    setExamDateFromFilter(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handleExamDateToChange = useCallback((value: string) => {
    setExamDateToFilter(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    setIsLoading(true);
    setPage(nextPage);
  }, []);

  const refetchFilterOptions = useCallback(async () => {
    setIsLoadingFilters(true);

    try {
      const [companiesData, employeesData, examsData] =
        await loadFilterOptionsData(companyIdFilter);

      setCompanies(companiesData);
      setEmployees(employeesData);
      setExams(examsData);
    } catch {
      setCompanies([]);
      setEmployees([]);
      setExams([]);
    } finally {
      setIsLoadingFilters(false);
    }
  }, [companyIdFilter]);

  useEffect(() => {
    let active = true;

    loadFilterOptionsData(companyIdFilter)
      .then(([companiesData, employeesData, examsData]) => {
        if (!active) return;
        setCompanies(companiesData);
        setEmployees(employeesData);
        setExams(examsData);
      })
      .catch(() => {
        if (!active) return;
        setCompanies([]);
        setEmployees([]);
        setExams([]);
      })
      .finally(() => {
        if (active) {
          setIsLoadingFilters(false);
        }
      });

    return () => {
      active = false;
    };
  }, [companyIdFilter]);

  const activeEmployeeIdFilter = useMemo(() => {
    if (!employeeIdFilter || !companyIdFilter) return employeeIdFilter;
    const employee = employees.find((item) => item.id === employeeIdFilter);
    if (!employee || employee.company.id !== companyIdFilter) return "";
    return employeeIdFilter;
  }, [employeeIdFilter, companyIdFilter, employees]);

  const exportListParams = useMemo<EmployeeExamsReportListParams>(
    () => ({
      ...(debouncedProfessionalName
        ? { professionalName: debouncedProfessionalName }
        : {}),
      ...(companyIdFilter ? { companyId: companyIdFilter } : {}),
      ...(activeEmployeeIdFilter
        ? { employeeId: activeEmployeeIdFilter }
        : {}),
      ...(examIdFilter ? { examId: examIdFilter } : {}),
      ...(paymentStatusFilter ? { paymentStatus: paymentStatusFilter } : {}),
      ...(examDateFromFilter ? { examDateFrom: examDateFromFilter } : {}),
      ...(examDateToFilter ? { examDateTo: examDateToFilter } : {}),
    }),
    [
      debouncedProfessionalName,
      companyIdFilter,
      activeEmployeeIdFilter,
      examIdFilter,
      paymentStatusFilter,
      examDateFromFilter,
      examDateToFilter,
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

  const fetchLinks = useCallback(
    async (showLoading = false) => {
      const requestId = startRequest();

      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const response = await employeeExamService.list(listParams);

        if (isStaleRequest(requestId)) return;

        setLinks(response.data);
        setMeta(response.meta);
        setError(null);
      } catch (err) {
        if (isStaleRequest(requestId)) return;

        setLinks([]);
        setMeta(null);
        setError(
          getApiErrorMessage(
            err,
            "Não foi possível carregar os vínculos funcionário–exame."
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

    employeeExamService
      .list(listParams)
      .then((response) => {
        if (!active || isStaleRequest(requestId)) return;
        setLinks(response.data);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        if (!active || isStaleRequest(requestId)) return;
        setLinks([]);
        setMeta(null);
        setError(
          getApiErrorMessage(
            err,
            "Não foi possível carregar os vínculos funcionário–exame."
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

  const createLink = useCallback(
    async (formData: EmployeeExamFormData) => {
      setIsSubmitting(true);
      try {
        const payloads = formToEmployeeExamCreatePayloads(formData);
        await Promise.all(
          payloads.map((payload) => employeeExamService.create(payload))
        );
        invalidateRequests();
        if (page === 1) {
          await fetchLinks();
        } else {
          setIsLoading(true);
          setPage(1);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [page, fetchLinks, invalidateRequests]
  );

  const updateLink = useCallback(
    async (id: string, formData: EmployeeExamFormData) => {
      setIsSubmitting(true);
      try {
        await employeeExamService.update(
          id,
          formToEmployeeExamUpdatePayload(formData)
        );
        invalidateRequests();
        await fetchLinks();
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchLinks, invalidateRequests]
  );

  const deleteLink = useCallback(
    async (id: string) => {
      setIsSubmitting(true);
      try {
        await employeeExamService.delete(id);
        invalidateRequests();

        const isLastOnPage = links.length === 1;
        const { items, meta: nextMeta } = removeItemFromPaginatedList(
          links,
          id,
          meta
        );
        setLinks(items);
        setMeta(nextMeta);

        if (isLastOnPage && page > 1) {
          setIsLoading(true);
          setPage((current) => current - 1);
        } else {
          await fetchLinks();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [links, meta, page, fetchLinks, invalidateRequests]
  );

  const bulkPayLinks = useCallback(
    async (ids: string[], paidAt: string) => {
      if (!ids.length) return;

      const dateOnly = normalizeToDateOnly(paidAt);
      if (!dateOnly) {
        throw new Error("Data de pagamento inválida");
      }

      const paidAtIso = dateOnlyToPaidAtIso(dateOnly);

      setIsSubmitting(true);
      try {
        const targetLinks = links.filter((link) => ids.includes(link.id));

        await Promise.all(
          targetLinks.map((link) =>
            employeeExamService.update(link.id, {
              employee: { id: link.employee.id },
              professionalName: link.professionalName,
              examDate: link.examDate,
              ...(link.examTime ? { examTime: link.examTime } : {}),
              paymentStatus: "PAID",
              paidAt: paidAtIso,
              exam: { id: link.exam.id },
            })
          )
        );

        invalidateRequests();
        await fetchLinks();
      } finally {
        setIsSubmitting(false);
      }
    },
    [links, fetchLinks, invalidateRequests]
  );

  const value = useMemo<EmployeeExamsContextValue>(
    () => ({
      links,
      meta,
      companies,
      employees,
      exams,
      isLoading,
      isLoadingFilters,
      isSubmitting,
      error,
      professionalNameFilter,
      companyIdFilter,
      employeeIdFilter,
      examIdFilter,
      paymentStatusFilter,
      examDateFromFilter,
      examDateToFilter,
      exportListParams,
      page,
      setProfessionalNameFilter,
      setCompanyIdFilter: handleCompanyFilterChange,
      setEmployeeIdFilter: handleEmployeeFilterChange,
      setExamIdFilter: handleExamFilterChange,
      setPaymentStatusFilter: handlePaymentStatusFilterChange,
      setExamDateFromFilter: handleExamDateFromChange,
      setExamDateToFilter: handleExamDateToChange,
      setPage: handlePageChange,
      refetch: () => fetchLinks(true),
      refetchFilterOptions,
      createLink,
      updateLink,
      deleteLink,
      bulkPayLinks,
    }),
    [
      links,
      meta,
      companies,
      employees,
      exams,
      isLoading,
      isLoadingFilters,
      isSubmitting,
      error,
      professionalNameFilter,
      companyIdFilter,
      employeeIdFilter,
      examIdFilter,
      paymentStatusFilter,
      examDateFromFilter,
      examDateToFilter,
      exportListParams,
      page,
      handleCompanyFilterChange,
      handleEmployeeFilterChange,
      handleExamFilterChange,
      handlePaymentStatusFilterChange,
      handleExamDateFromChange,
      handleExamDateToChange,
      handlePageChange,
      fetchLinks,
      refetchFilterOptions,
      createLink,
      updateLink,
      deleteLink,
      bulkPayLinks,
    ]
  );

  return (
    <EmployeeExamsContext.Provider value={value}>
      {children}
    </EmployeeExamsContext.Provider>
  );
}

export function useEmployeeExams() {
  const context = useContext(EmployeeExamsContext);

  if (!context) {
    throw new Error(
      "useEmployeeExams deve ser usado dentro de EmployeeExamsProvider"
    );
  }

  return context;
}

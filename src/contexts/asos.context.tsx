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
import { TABLE_PAGE_SIZE } from "@/shared/constants/app.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import {
  formToAsoCreatePayload,
  formToAsoUpdatePayload,
} from "@/shared/helpers/aso-form.helper";
import { fetchAllPaginated } from "@/shared/helpers/fetch-all-paginated.helper";
import { removeItemFromPaginatedList } from "@/shared/helpers/paginated-list.helper";
import type { IAso } from "@/shared/interfaces/https/aso";
import type { IEmployee } from "@/shared/interfaces/https/employee";
import type { IExam } from "@/shared/interfaces/https/exam";
import type { IOccupationalRisk } from "@/shared/interfaces/https/occupational-risk";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import { asoService } from "@/shared/services/aso.service";
import { employeeService } from "@/shared/services/employee.service";
import { examService } from "@/shared/services/exam.service";
import { occupationalRiskService } from "@/shared/services/occupational-risk.service";
import type { AsoType } from "@/shared/types/aso-type.types";
import type { AsoFormData } from "@/types/aso-form.types";

export interface AsosContextValue {
  asos: IAso[];
  meta: IPaginationMeta | null;
  employees: IEmployee[];
  exams: IExam[];
  occupationalRisks: IOccupationalRisk[];
  isLoading: boolean;
  isLoadingFilters: boolean;
  isSubmitting: boolean;
  error: string | null;
  employeeIdFilter: string;
  typeFilter: AsoType | "";
  dateFromFilter: string;
  dateToFilter: string;
  page: number;
  setEmployeeIdFilter: (value: string) => void;
  setTypeFilter: (value: AsoType | "") => void;
  setDateFromFilter: (value: string) => void;
  setDateToFilter: (value: string) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  refetchFilterOptions: () => Promise<void>;
  createAso: (data: AsoFormData) => Promise<void>;
  updateAso: (id: string, data: AsoFormData) => Promise<void>;
  deleteAso: (id: string) => Promise<void>;
}

const AsosContext = createContext<AsosContextValue | null>(null);

async function loadFilterOptionsData() {
  return Promise.all([
    fetchAllPaginated((page, pageSize) =>
      employeeService.list({ page, pageSize })
    ),
    fetchAllPaginated((page, pageSize) =>
      examService.list({ page, pageSize })
    ),
    fetchAllPaginated((page, pageSize) =>
      occupationalRiskService.list({ page, pageSize })
    ),
  ]);
}

export function AsosProvider({ children }: { children: ReactNode }) {
  const { startRequest, isStaleRequest, invalidateRequests } =
    useRequestGeneration();
  const [asos, setAsos] = useState<IAso[]>([]);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [exams, setExams] = useState<IExam[]>([]);
  const [occupationalRisks, setOccupationalRisks] = useState<
    IOccupationalRisk[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [employeeIdFilter, setEmployeeIdFilterState] = useState("");
  const [typeFilter, setTypeFilterState] = useState<AsoType | "">("");
  const [dateFromFilter, setDateFromFilterState] = useState("");
  const [dateToFilter, setDateToFilterState] = useState("");

  const handleEmployeeFilterChange = useCallback((value: string) => {
    setEmployeeIdFilterState(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handleTypeFilterChange = useCallback((value: AsoType | "") => {
    setTypeFilterState(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handleDateFromChange = useCallback((value: string) => {
    setDateFromFilterState(value);
    setPage(1);
    setIsLoading(true);
  }, []);

  const handleDateToChange = useCallback((value: string) => {
    setDateToFilterState(value);
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
      const [employeesData, examsData, risksData] =
        await loadFilterOptionsData();

      setEmployees(employeesData);
      setExams(examsData);
      setOccupationalRisks(risksData);
    } catch {
      setEmployees([]);
      setExams([]);
      setOccupationalRisks([]);
    } finally {
      setIsLoadingFilters(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    loadFilterOptionsData()
      .then(([employeesData, examsData, risksData]) => {
        if (!active) return;
        setEmployees(employeesData);
        setExams(examsData);
        setOccupationalRisks(risksData);
      })
      .catch(() => {
        if (!active) return;
        setEmployees([]);
        setExams([]);
        setOccupationalRisks([]);
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

  const listParams = useMemo(
    () => ({
      page,
      pageSize: TABLE_PAGE_SIZE,
      ...(employeeIdFilter ? { employeeId: employeeIdFilter } : {}),
      ...(typeFilter ? { type: typeFilter } : {}),
      ...(dateFromFilter ? { dateFrom: dateFromFilter } : {}),
      ...(dateToFilter ? { dateTo: dateToFilter } : {}),
    }),
    [page, employeeIdFilter, typeFilter, dateFromFilter, dateToFilter]
  );

  const fetchAsos = useCallback(
    async (showLoading = false) => {
      const requestId = startRequest();

      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const response = await asoService.list(listParams);

        if (isStaleRequest(requestId)) return;

        setAsos(response.data);
        setMeta(response.meta);
        setError(null);
      } catch (err) {
        if (isStaleRequest(requestId)) return;

        setAsos([]);
        setMeta(null);
        setError(
          getApiErrorMessage(err, "Não foi possível carregar os ASOs.")
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

    asoService
      .list(listParams)
      .then((response) => {
        if (!active || isStaleRequest(requestId)) return;
        setAsos(response.data);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        if (!active || isStaleRequest(requestId)) return;
        setAsos([]);
        setMeta(null);
        setError(
          getApiErrorMessage(err, "Não foi possível carregar os ASOs.")
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

  const createAso = useCallback(
    async (formData: AsoFormData) => {
      setIsSubmitting(true);
      try {
        await asoService.create(formToAsoCreatePayload(formData));
        invalidateRequests();
        if (page === 1) {
          await fetchAsos();
        } else {
          setIsLoading(true);
          setPage(1);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [page, fetchAsos, invalidateRequests]
  );

  const updateAso = useCallback(
    async (id: string, formData: AsoFormData) => {
      setIsSubmitting(true);
      try {
        await asoService.update(id, formToAsoUpdatePayload(formData));
        invalidateRequests();
        await fetchAsos();
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchAsos, invalidateRequests]
  );

  const deleteAso = useCallback(
    async (id: string) => {
      setIsSubmitting(true);
      try {
        await asoService.delete(id);
        invalidateRequests();

        const isLastOnPage = asos.length === 1;
        const { items, meta: nextMeta } = removeItemFromPaginatedList(
          asos,
          id,
          meta
        );
        setAsos(items);
        setMeta(nextMeta);

        if (isLastOnPage && page > 1) {
          setIsLoading(true);
          setPage((current) => current - 1);
        } else {
          await fetchAsos();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [asos, meta, page, fetchAsos, invalidateRequests]
  );

  const value = useMemo<AsosContextValue>(
    () => ({
      asos,
      meta,
      employees,
      exams,
      occupationalRisks,
      isLoading,
      isLoadingFilters,
      isSubmitting,
      error,
      employeeIdFilter,
      typeFilter,
      dateFromFilter,
      dateToFilter,
      page,
      setEmployeeIdFilter: handleEmployeeFilterChange,
      setTypeFilter: handleTypeFilterChange,
      setDateFromFilter: handleDateFromChange,
      setDateToFilter: handleDateToChange,
      setPage: handlePageChange,
      refetch: () => fetchAsos(true),
      refetchFilterOptions,
      createAso,
      updateAso,
      deleteAso,
    }),
    [
      asos,
      meta,
      employees,
      exams,
      occupationalRisks,
      isLoading,
      isLoadingFilters,
      isSubmitting,
      error,
      employeeIdFilter,
      typeFilter,
      dateFromFilter,
      dateToFilter,
      page,
      handleEmployeeFilterChange,
      handleTypeFilterChange,
      handleDateFromChange,
      handleDateToChange,
      handlePageChange,
      fetchAsos,
      refetchFilterOptions,
      createAso,
      updateAso,
      deleteAso,
    ]
  );

  return <AsosContext.Provider value={value}>{children}</AsosContext.Provider>;
}

export function useAsos() {
  const context = useContext(AsosContext);

  if (!context) {
    throw new Error("useAsos deve ser usado dentro de AsosProvider");
  }

  return context;
}

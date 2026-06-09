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
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import {
  formToEmployeeCreatePayload,
  formToEmployeeUpdatePayload,
} from "@/shared/helpers/employee-form.helper";
import { removeItemFromPaginatedList } from "@/shared/helpers/paginated-list.helper";
import type { ICompany } from "@/shared/interfaces/https/company";
import type { IEmployee } from "@/shared/interfaces/https/employee";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import { companyService } from "@/shared/services/company.service";
import { employeeService } from "@/shared/services/employee.service";
import type { EmployeeFormData } from "@/types/employee-form.types";

export interface EmployeesContextValue {
  employees: IEmployee[];
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
  createEmployee: (data: EmployeeFormData) => Promise<void>;
  updateEmployee: (id: string, data: EmployeeFormData) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
}

const EmployeesContext = createContext<EmployeesContextValue | null>(null);

export function EmployeesProvider({ children }: { children: ReactNode }) {
  const { startRequest, isStaleRequest, invalidateRequests } =
    useRequestGeneration();
  const [employees, setEmployees] = useState<IEmployee[]>([]);
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

  const fetchEmployees = useCallback(
    async (showLoading = false) => {
      const requestId = startRequest();

      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const response = await employeeService.list({
          page,
          pageSize: TABLE_PAGE_SIZE,
          ...(debouncedName ? { name: debouncedName } : {}),
          ...(companyIdFilter ? { companyId: companyIdFilter } : {}),
        });

        if (isStaleRequest(requestId)) return;

        setEmployees(response.data);
        setMeta(response.meta);
        setError(null);
      } catch (err) {
        if (isStaleRequest(requestId)) return;

        setEmployees([]);
        setMeta(null);
        setError(
          getApiErrorMessage(err, "Não foi possível carregar os funcionários.")
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

    employeeService
      .list({
        page,
        pageSize: TABLE_PAGE_SIZE,
        ...(debouncedName ? { name: debouncedName } : {}),
        ...(companyIdFilter ? { companyId: companyIdFilter } : {}),
      })
      .then((response) => {
        if (!active || isStaleRequest(requestId)) return;
        setEmployees(response.data);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        if (!active || isStaleRequest(requestId)) return;
        setEmployees([]);
        setMeta(null);
        setError(
          getApiErrorMessage(err, "Não foi possível carregar os funcionários.")
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

  const createEmployee = useCallback(
    async (formData: EmployeeFormData) => {
      setIsSubmitting(true);
      try {
        await employeeService.create(formToEmployeeCreatePayload(formData));
        invalidateRequests();
        if (page === 1) {
          await fetchEmployees();
        } else {
          setIsLoading(true);
          setPage(1);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [page, fetchEmployees, invalidateRequests]
  );

  const updateEmployee = useCallback(
    async (id: string, formData: EmployeeFormData) => {
      setIsSubmitting(true);
      try {
        await employeeService.update(id, formToEmployeeUpdatePayload(formData));
        invalidateRequests();
        await fetchEmployees();
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchEmployees, invalidateRequests]
  );

  const deleteEmployee = useCallback(
    async (id: string) => {
      setIsSubmitting(true);
      try {
        await employeeService.delete(id);
        invalidateRequests();

        const isLastOnPage = employees.length === 1;
        const { items, meta: nextMeta } = removeItemFromPaginatedList(
          employees,
          id,
          meta
        );
        setEmployees(items);
        setMeta(nextMeta);

        if (isLastOnPage && page > 1) {
          setIsLoading(true);
          setPage((current) => current - 1);
        } else {
          await fetchEmployees();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [employees, meta, page, fetchEmployees, invalidateRequests]
  );

  const value = useMemo<EmployeesContextValue>(
    () => ({
      employees,
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
      refetch: () => fetchEmployees(true),
      createEmployee,
      updateEmployee,
      deleteEmployee,
    }),
    [
      employees,
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
      fetchEmployees,
      createEmployee,
      updateEmployee,
      deleteEmployee,
    ]
  );

  return (
    <EmployeesContext.Provider value={value}>
      {children}
    </EmployeesContext.Provider>
  );
}

export function useEmployees() {
  const context = useContext(EmployeesContext);

  if (!context) {
    throw new Error("useEmployees deve ser usado dentro de EmployeesProvider");
  }

  return context;
}

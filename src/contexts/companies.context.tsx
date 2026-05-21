import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CompaniesContext,
  type CompaniesContextValue,
} from "@/contexts/companies-context";
import { COMPANIES_PAGE_SIZE } from "@/shared/constants/companies.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formToCompanyPayload } from "@/shared/helpers/company-form.helper";
import type { ICompany } from "@/shared/interfaces/https/company";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import { companyService } from "@/shared/services/company.service";
import type { CompanyFormData } from "@/types/company-form.types";

const NAME_FILTER_DEBOUNCE_MS = 400;

export function CompaniesProvider({ children }: { children: ReactNode }) {
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
    }, NAME_FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [nameFilter]);

  const fetchCompanies = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await companyService.list({
          page,
          pageSize: COMPANIES_PAGE_SIZE,
          ...(debouncedName ? { name: debouncedName } : {}),
        });
        setCompanies(response.data);
        setMeta(response.meta);
      } catch (err) {
        setCompanies([]);
        setMeta(null);
        setError(
          getApiErrorMessage(err, "Não foi possível carregar as empresas.")
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

    companyService
      .list({
        page,
        pageSize: COMPANIES_PAGE_SIZE,
        ...(debouncedName ? { name: debouncedName } : {}),
      })
      .then((response) => {
        if (active) {
          setCompanies(response.data);
          setMeta(response.meta);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setCompanies([]);
          setMeta(null);
          setError(
            getApiErrorMessage(err, "Não foi possível carregar as empresas.")
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

  const createCompany = useCallback(
    async (formData: CompanyFormData) => {
      setIsSubmitting(true);
      try {
        await companyService.create(formToCompanyPayload(formData));
        if (page === 1) {
          await fetchCompanies();
        } else {
          setPage(1);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [page, fetchCompanies]
  );

  const updateCompany = useCallback(
    async (id: string, formData: CompanyFormData) => {
      setIsSubmitting(true);
      try {
        await companyService.update(id, formToCompanyPayload(formData));
        await fetchCompanies();
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchCompanies]
  );

  const deleteCompany = useCallback(
    async (id: string) => {
      setIsSubmitting(true);
      try {
        await companyService.delete(id);
        const isLastOnPage = companies.length === 1;
        if (isLastOnPage && page > 1) {
          setPage((current) => current - 1);
        } else {
          await fetchCompanies();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [companies.length, page, fetchCompanies]
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
      setPage,
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

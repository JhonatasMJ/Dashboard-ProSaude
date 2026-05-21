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
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import type {
  ICompany,
  ICompanyPayload,
} from "@/shared/interfaces/https/company";
import { companyService } from "@/shared/services/company.service";

export function CompaniesProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const { data } = await companyService.list();
      setCompanies(data);
    } catch (err) {
      setCompanies([]);
      setError(
        getApiErrorMessage(err, "Não foi possível carregar as empresas.")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    companyService
      .list()
      .then(({ data }) => {
        if (active) {
          setCompanies(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setCompanies([]);
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
  }, []);

  const createCompany = useCallback(async (payload: ICompanyPayload) => {
    setIsSubmitting(true);
    try {
      const { data } = await companyService.create(payload);
      setCompanies((prev) => [...prev, data]);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateCompany = useCallback(
    async (id: string, payload: ICompanyPayload) => {
      setIsSubmitting(true);
      try {
        const { data } = await companyService.update(id, payload);
        setCompanies((prev) =>
          prev.map((company) => (company.id === id ? data : company))
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const deleteCompany = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try {
      await companyService.delete(id);
      setCompanies((prev) => prev.filter((company) => company.id !== id));
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const value = useMemo<CompaniesContextValue>(
    () => ({
      companies,
      isLoading,
      isSubmitting,
      error,
      refetch: () => fetchCompanies(true),
      createCompany,
      updateCompany,
      deleteCompany,
    }),
    [
      companies,
      isLoading,
      isSubmitting,
      error,
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

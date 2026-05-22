import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { UsersContext, type UsersContextValue } from "@/contexts/users-context";
import { useRequestGeneration } from "@/hooks/use-request-generation";
import {
  FILTER_DEBOUNCE_MS,
  TABLE_PAGE_SIZE,
} from "@/shared/constants/app.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import { formToUserRegisterPayload } from "@/shared/helpers/user-form.helper";
import { removeItemFromPaginatedList } from "@/shared/helpers/paginated-list.helper";
import type { IUser } from "@/shared/interfaces/https/user";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import { userService } from "@/shared/services/user.service";
import type { UserRegisterFormData } from "@/types/user-register-form.types";

export function UsersProvider({ children }: { children: ReactNode }) {
  const { startRequest, isStaleRequest, invalidateRequests } =
    useRequestGeneration();
  const [users, setUsers] = useState<IUser[]>([]);
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

  const fetchUsers = useCallback(
    async (showLoading = false) => {
      const requestId = startRequest();

      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await userService.list({
          page,
          pageSize: TABLE_PAGE_SIZE,
          ...(debouncedName ? { name: debouncedName } : {}),
        });

        if (isStaleRequest(requestId)) return;

        setUsers(response.data);
        setMeta(response.meta);
      } catch (err) {
        if (isStaleRequest(requestId)) return;

        setUsers([]);
        setMeta(null);
        setError(
          getApiErrorMessage(err, "Não foi possível carregar os usuários.")
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

    userService
      .list({
        page,
        pageSize: TABLE_PAGE_SIZE,
        ...(debouncedName ? { name: debouncedName } : {}),
      })
      .then((response) => {
        if (!active || isStaleRequest(requestId)) return;
        setUsers(response.data);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        if (!active || isStaleRequest(requestId)) return;
        setUsers([]);
        setMeta(null);
        setError(
          getApiErrorMessage(err, "Não foi possível carregar os usuários.")
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

  const createUser = useCallback(
    async (formData: UserRegisterFormData) => {
      setIsSubmitting(true);
      try {
        await userService.register(formToUserRegisterPayload(formData));
        invalidateRequests();
        if (page === 1) {
          await fetchUsers();
        } else {
          setPage(1);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [page, fetchUsers, invalidateRequests]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      setIsSubmitting(true);
      try {
        await userService.delete(id);
        invalidateRequests();

        const isLastOnPage = users.length === 1;
        const { items, meta: nextMeta } = removeItemFromPaginatedList(
          users,
          id,
          meta
        );
        setUsers(items);
        setMeta(nextMeta);

        if (isLastOnPage && page > 1) {
          setPage((current) => current - 1);
        } else {
          await fetchUsers();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [users, meta, page, fetchUsers, invalidateRequests]
  );

  const value = useMemo<UsersContextValue>(
    () => ({
      users,
      meta,
      isLoading,
      isSubmitting,
      error,
      nameFilter,
      page,
      setNameFilter,
      setPage,
      refetch: () => fetchUsers(true),
      createUser,
      deleteUser,
    }),
    [
      users,
      meta,
      isLoading,
      isSubmitting,
      error,
      nameFilter,
      page,
      fetchUsers,
      createUser,
      deleteUser,
    ]
  );

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
}

import { createContext, useContext } from "react";
import type { IUser } from "@/shared/interfaces/https/user";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import type { UserRegisterFormData } from "@/types/user-register-form.types";

export interface UsersContextValue {
  users: IUser[];
  meta: IPaginationMeta | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  nameFilter: string;
  page: number;
  setNameFilter: (value: string) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  createUser: (data: UserRegisterFormData) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const UsersContext = createContext<UsersContextValue | null>(null);

export function useUsers() {
  const context = useContext(UsersContext);

  if (!context) {
    throw new Error("useUsers deve ser usado dentro de UsersProvider");
  }

  return context;
}

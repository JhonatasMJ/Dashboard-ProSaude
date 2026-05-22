import { STORAGE_USER_KEY } from "@/shared/helpers/axios.helper";

/** Remove sessão persistida (usuário e token). */
export function clearAuthStorage(): void {
  localStorage.removeItem(STORAGE_USER_KEY);
  sessionStorage.removeItem(STORAGE_USER_KEY);
}

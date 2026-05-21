import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STORAGE_USER_KEY } from "@/shared/helpers/axios.helper";
import type {
  IAuthenticateResponse,
  IUser,
} from "@/shared/interfaces/https/authenticate-response";
import type { ILoginRequest } from "@/shared/interfaces/https/login-request";
import { authService } from "@/shared/services/auth.service";

interface AuthContextValue {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: ILoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredUser(): IUser | null {
  const stored = localStorage.getItem(STORAGE_USER_KEY);
  if (!stored) return null;

  try {
    const { user } = JSON.parse(stored) as IAuthenticateResponse;
    return user ?? null;
  } catch {
    localStorage.removeItem(STORAGE_USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: ILoginRequest) => {
    const { user: authenticatedUser } = await authService.login(credentials);
    setUser(authenticatedUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}

import { proSaudeApi } from "../api/pro-saude";
import { clearAuthStorage } from "../helpers/auth-storage.helper";
import { STORAGE_USER_KEY } from "../helpers/axios.helper";
import type { IAuthenticateResponse } from "../interfaces/https/authenticate-response";
import type { ILoginRequest } from "../interfaces/https/login-request";

export const authService = {
  async login(credentials: ILoginRequest): Promise<IAuthenticateResponse> {
    const { data } = await proSaudeApi.post<IAuthenticateResponse>(
      "/auth/login",
      credentials
    );

    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data));

    return data;
  },

  logout(): void {
    clearAuthStorage();
  },
};

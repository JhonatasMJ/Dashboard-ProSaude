import type { AxiosInstance } from "axios";
import type { IAuthenticateResponse } from "../interfaces/https/authenticate-response";

export const STORAGE_USER_KEY = "pro-saude-user";

/** Lê o token do localStorage e adiciona no header Authorization */
export const addTokenToRequest = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use((config) => {
    const userData = localStorage.getItem(STORAGE_USER_KEY);

    if (userData) {
      const { token } = JSON.parse(userData) as IAuthenticateResponse;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  });
};

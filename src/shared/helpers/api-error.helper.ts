import { isAxiosError } from "axios";

interface ApiErrorBody {
  message?: string | string[];
  error?: string;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Não foi possível completar a operação. Tente novamente."
): string {
  if (!isAxiosError<ApiErrorBody>(error)) {
    return fallback;
  }

  const data = error.response?.data;
  if (!data) {
    return fallback;
  }

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (Array.isArray(data.message) && data.message.length > 0) {
    return data.message.join(". ");
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }

  if (error.response?.status === 401) {
    return "Credenciais inválidas";
  }

  return fallback;
}

import { proSaudeApi } from "../api/pro-saude";
import type { IAuthenticateResponse } from "../interfaces/https/authenticate-response";
import type { IUserRegisterRequest } from "../interfaces/https/user-register-request";
import type {
  IUsersListParams,
  IUsersListResponse,
} from "../interfaces/https/user";

export const userService = {
  async list(params?: IUsersListParams): Promise<IUsersListResponse> {
    const { data } = await proSaudeApi.get<IUsersListResponse>("/users", {
      params,
    });
    return data;
  },

  async register(payload: IUserRegisterRequest): Promise<IAuthenticateResponse> {
    const { data } = await proSaudeApi.post<IAuthenticateResponse>(
      "/users",
      payload
    );
    return data;
  },

  async delete(id: string): Promise<void> {
    await proSaudeApi.delete(`/users/${id}`);
  },
};

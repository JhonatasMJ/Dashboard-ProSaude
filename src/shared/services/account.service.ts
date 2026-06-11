import { proSaudeApi } from "../api/pro-saude";
import type {
  IAccountPayload,
  IAccountResponse,
  IAccountsListParams,
  IAccountsListResponse,
} from "../interfaces/https/account";

export const accountService = {
  async list(params?: IAccountsListParams): Promise<IAccountsListResponse> {
    const { data } = await proSaudeApi.get<IAccountsListResponse>("/accounts", {
      params,
    });
    return data;
  },

  async create(payload: IAccountPayload): Promise<IAccountResponse> {
    const { data } = await proSaudeApi.post<IAccountResponse>(
      "/accounts",
      payload
    );
    return data;
  },

  async update(id: string, payload: IAccountPayload): Promise<IAccountResponse> {
    const { data } = await proSaudeApi.put<IAccountResponse>(
      `/accounts/${id}`,
      payload
    );
    return data;
  },

  async delete(id: string): Promise<void> {
    await proSaudeApi.delete(`/accounts/${id}`);
  },
};

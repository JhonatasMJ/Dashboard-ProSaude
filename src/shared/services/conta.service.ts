import { proSaudeApi } from "../api/pro-saude";
import type {
  IContaPayload,
  IContaResponse,
  IContasListParams,
  IContasListResponse,
} from "../interfaces/https/conta";

export const contaService = {
  async list(params?: IContasListParams): Promise<IContasListResponse> {
    const { data } = await proSaudeApi.get<IContasListResponse>("/contas", {
      params,
    });
    return data;
  },

  async create(payload: IContaPayload): Promise<IContaResponse> {
    const { data } = await proSaudeApi.post<IContaResponse>("/contas", payload);
    return data;
  },

  async update(id: string, payload: IContaPayload): Promise<IContaResponse> {
    const { data } = await proSaudeApi.put<IContaResponse>(
      `/contas/${id}`,
      payload
    );
    return data;
  },

  async delete(id: string): Promise<void> {
    await proSaudeApi.delete(`/contas/${id}`);
  },
};

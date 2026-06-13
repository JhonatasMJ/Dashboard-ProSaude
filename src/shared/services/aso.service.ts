import { proSaudeApi } from "../api/pro-saude";
import type {
  IAsoCreatePayload,
  IAsoResponse,
  IAsoUpdatePayload,
  IAsosListParams,
  IAsosListResponse,
} from "../interfaces/https/aso";

export const asoService = {
  async list(params?: IAsosListParams): Promise<IAsosListResponse> {
    const { data } = await proSaudeApi.get<IAsosListResponse>("/asos", {
      params,
    });
    return data;
  },

  async create(payload: IAsoCreatePayload): Promise<IAsoResponse> {
    const { data } = await proSaudeApi.post<IAsoResponse>("/asos", payload);
    return data;
  },

  async update(id: string, payload: IAsoUpdatePayload): Promise<IAsoResponse> {
    const { data } = await proSaudeApi.put<IAsoResponse>(
      `/asos/${id}`,
      payload
    );
    return data;
  },

  async delete(id: string): Promise<void> {
    await proSaudeApi.delete(`/asos/${id}`);
  },
};

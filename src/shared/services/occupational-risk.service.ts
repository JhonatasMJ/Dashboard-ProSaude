import { proSaudeApi } from "../api/pro-saude";
import type {
  IOccupationalRiskPayload,
  IOccupationalRiskResponse,
  IOccupationalRisksListParams,
  IOccupationalRisksListResponse,
} from "../interfaces/https/occupational-risk";

export const occupationalRiskService = {
  async list(
    params?: IOccupationalRisksListParams
  ): Promise<IOccupationalRisksListResponse> {
    const { data } = await proSaudeApi.get<IOccupationalRisksListResponse>(
      "/occupational-risks",
      { params }
    );
    return data;
  },

  async create(
    payload: IOccupationalRiskPayload
  ): Promise<IOccupationalRiskResponse> {
    const { data } = await proSaudeApi.post<IOccupationalRiskResponse>(
      "/occupational-risks",
      payload
    );
    return data;
  },

  async update(
    id: string,
    payload: IOccupationalRiskPayload
  ): Promise<IOccupationalRiskResponse> {
    const { data } = await proSaudeApi.put<IOccupationalRiskResponse>(
      `/occupational-risks/${id}`,
      payload
    );
    return data;
  },

  async delete(id: string): Promise<void> {
    await proSaudeApi.delete(`/occupational-risks/${id}`);
  },
};

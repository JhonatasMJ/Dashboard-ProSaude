import { proSaudeApi } from "../api/pro-saude";
import type {
  IExamCreatePayload,
  IExamResponse,
  IExamsListParams,
  IExamsListResponse,
  IExamUpdatePayload,
} from "../interfaces/https/exam";

export const examService = {
  async list(params?: IExamsListParams): Promise<IExamsListResponse> {
    const { data } = await proSaudeApi.get<IExamsListResponse>("/exams", {
      params,
    });
    return data;
  },

  async create(payload: IExamCreatePayload): Promise<IExamResponse> {
    const { data } = await proSaudeApi.post<IExamResponse>("/exams", payload);
    return data;
  },

  async update(id: string, payload: IExamUpdatePayload): Promise<IExamResponse> {
    const { data } = await proSaudeApi.put<IExamResponse>(
      `/exams/${id}`,
      payload
    );
    return data;
  },

  async delete(id: string): Promise<void> {
    await proSaudeApi.delete(`/exams/${id}`);
  },
};

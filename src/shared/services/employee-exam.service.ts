import { proSaudeApi } from "../api/pro-saude";
import type {
  IEmployeeExamCreatePayload,
  IEmployeeExamResponse,
  IEmployeeExamsListParams,
  IEmployeeExamsListResponse,
  IEmployeeExamUpdatePayload,
} from "../interfaces/https/employee-exam";

export const employeeExamService = {
  async list(
    params?: IEmployeeExamsListParams
  ): Promise<IEmployeeExamsListResponse> {
    const { data } = await proSaudeApi.get<IEmployeeExamsListResponse>(
      "/employee-exams",
      { params }
    );
    return data;
  },

  async create(
    payload: IEmployeeExamCreatePayload
  ): Promise<IEmployeeExamResponse> {
    const { data } = await proSaudeApi.post<IEmployeeExamResponse>(
      "/employee-exams",
      payload
    );
    return data;
  },

  async update(
    id: string,
    payload: IEmployeeExamUpdatePayload
  ): Promise<IEmployeeExamResponse> {
    const { data } = await proSaudeApi.put<IEmployeeExamResponse>(
      `/employee-exams/${id}`,
      payload
    );
    return data;
  },

  async delete(id: string): Promise<void> {
    await proSaudeApi.delete(`/employee-exams/${id}`);
  },
};

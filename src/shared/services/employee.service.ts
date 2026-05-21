import { proSaudeApi } from "../api/pro-saude";
import type {
  IEmployeeCreatePayload,
  IEmployeeResponse,
  IEmployeesListParams,
  IEmployeesListResponse,
  IEmployeeUpdatePayload,
} from "../interfaces/https/employee";

export const employeeService = {
  async list(
    params?: IEmployeesListParams
  ): Promise<IEmployeesListResponse> {
    const { data } = await proSaudeApi.get<IEmployeesListResponse>(
      "/employees",
      { params }
    );
    return data;
  },

  async create(payload: IEmployeeCreatePayload): Promise<IEmployeeResponse> {
    const { data } = await proSaudeApi.post<IEmployeeResponse>(
      "/employees",
      payload
    );
    return data;
  },

  async update(
    id: string,
    payload: IEmployeeUpdatePayload
  ): Promise<IEmployeeResponse> {
    const { data } = await proSaudeApi.put<IEmployeeResponse>(
      `/employees/${id}`,
      payload
    );
    return data;
  },

  async delete(id: string): Promise<void> {
    await proSaudeApi.delete(`/employees/${id}`);
  },
};

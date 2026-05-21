import { proSaudeApi } from "../api/pro-saude";
import type {
  ICompaniesListResponse,
  ICompanyPayload,
  ICompanyResponse,
} from "../interfaces/https/company";

export const companyService = {
  async list(): Promise<ICompaniesListResponse> {
    const { data } = await proSaudeApi.get<ICompaniesListResponse>("/companies");
    return data;
  },

  async create(payload: ICompanyPayload): Promise<ICompanyResponse> {
    const { data } = await proSaudeApi.post<ICompanyResponse>(
      "/companies",
      payload
    );
    return data;
  },

  async update(id: string, payload: ICompanyPayload): Promise<ICompanyResponse> {
    const { data } = await proSaudeApi.put<ICompanyResponse>(
      `/companies/${id}`,
      payload
    );
    return data;
  },

  async delete(id: string): Promise<void> {
    await proSaudeApi.delete(`/companies/${id}`);
  },
};

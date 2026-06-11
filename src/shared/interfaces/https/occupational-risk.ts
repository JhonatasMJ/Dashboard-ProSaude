import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import type { OccupationalRiskCategory } from "@/shared/types/occupational-risk-category.types";

export interface IOccupationalRisk {
  id: string;
  category: OccupationalRiskCategory;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOccupationalRisksListParams {
  category?: OccupationalRiskCategory;
  description?: string;
  page?: number;
  pageSize?: number;
}

export interface IOccupationalRisksListResponse {
  data: IOccupationalRisk[];
  meta: IPaginationMeta;
}

export interface IOccupationalRiskResponse {
  data: IOccupationalRisk;
}

export interface IOccupationalRiskPayload {
  category: OccupationalRiskCategory;
  description: string;
}

import type { IUser } from "@/shared/interfaces/https/authenticate-response";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";

export type { IUser };

export interface IUsersListParams {
  name?: string;
  page?: number;
  pageSize?: number;
}

export interface IUsersListResponse {
  data: IUser[];
  meta: IPaginationMeta;
}

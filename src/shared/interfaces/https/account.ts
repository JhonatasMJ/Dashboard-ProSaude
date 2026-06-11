import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import type { AccountStatus } from "@/shared/types/account-status.types";

export interface IAccount {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IAccountsListParams {
  name?: string;
  status?: AccountStatus;
  dueDateFrom?: string;
  dueDateTo?: string;
  paidAtFrom?: string;
  paidAtTo?: string;
  page?: number;
  pageSize?: number;
}

export interface IAccountsListResponse {
  data: IAccount[];
  meta: IPaginationMeta;
}

export interface IAccountResponse {
  data: IAccount;
}

export interface IAccountPayload {
  name: string;
  amount: number;
  dueDate: string;
  paidAt?: string | null;
  status: AccountStatus;
}

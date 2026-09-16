import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";
import type { AccountStatus } from "@/shared/types/account-status.types";
import type { PaymentType } from "@/shared/types/payment-type.types";

export interface IAccountInstallment {
  id: string;
  number: number;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: AccountStatus;
}

export interface IAccount {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: AccountStatus;
  installments: IAccountInstallment[];
  createdAt: string;
  updatedAt: string;
}

export interface IAccountsListParams {
  name?: string;
  status?: AccountStatus;
  paymentType?: PaymentType;
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

export interface IAccountInstallmentInput {
  amount: number;
  dueDate: string;
  paidAt?: string | null;
}

export interface IAccountPayload {
  name: string;
  amount?: number;
  dueDate?: string;
  paidAt?: string | null;
  status?: AccountStatus;
  installments?: IAccountInstallmentInput[];
}

export interface IAccountInstallmentUpdatePayload {
  amount?: number;
  dueDate?: string;
  paidAt?: string | null;
  status?: AccountStatus;
}

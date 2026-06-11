import type { AccountStatus } from "@/shared/types/account-status.types";

export type AccountFormData = {
  name: string;
  amount: string;
  dueDate: string;
  status: AccountStatus;
  paidAt: string;
};

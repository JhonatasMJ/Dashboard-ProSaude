import type { PaymentStatus } from "@/shared/types/payment-status.types";

export type EmployeeExamFormData = {
  employeeId: string;
  examIds: string[];
  professionalName: string;
  examDate: string;
  examTime: string;
  paymentStatus: PaymentStatus;
  paidAt: string;
};

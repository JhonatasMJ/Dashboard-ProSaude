export type PaymentType = "SINGLE" | "INSTALLMENT";

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  SINGLE: "Único",
  INSTALLMENT: "Parcelado",
};

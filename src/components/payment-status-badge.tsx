import type { PaymentStatus } from "@/shared/types/payment-status.types";
import { cn } from "@/lib/utils";

export function PaymentStatusBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  const isPaid = status === "PAID";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
        isPaid
          ? "bg-emerald-100 text-emerald-800"
          : "bg-amber-100 text-amber-800"
      )}
    >
      {isPaid ? "Pago" : "Pendente"}
    </span>
  );
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  return status === "PAID" ? "Pago" : "Pendente";
}

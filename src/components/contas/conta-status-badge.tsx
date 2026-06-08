import { CONTA_STATUS_LABELS, type ContaStatus } from "@/shared/types/conta-status.types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<ContaStatus, string> = {
  pendente: "bg-amber-100 text-amber-800",
  pago: "bg-emerald-100 text-emerald-800",
  vencido: "bg-red-100 text-red-800",
};

export function ContaStatusBadge({ status }: { status: ContaStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
        STATUS_STYLES[status]
      )}
    >
      {CONTA_STATUS_LABELS[status]}
    </span>
  );
}

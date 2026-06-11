import { ACCOUNT_STATUS_LABELS, type AccountStatus } from "@/shared/types/account-status.types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<AccountStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  OVERDUE: "bg-red-100 text-red-800",
};

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
        STATUS_STYLES[status]
      )}
    >
      {ACCOUNT_STATUS_LABELS[status]}
    </span>
  );
}

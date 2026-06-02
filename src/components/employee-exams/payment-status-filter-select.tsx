import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FILTER_FIELD_LABEL_CLASS,
  FILTER_FIELD_WRAPPER_CLASS,
  FILTER_SELECT_TRIGGER_CLASS,
} from "@/shared/constants/filter-field.constants";
import type { PaymentStatus } from "@/shared/types/payment-status.types";
import { cn } from "@/lib/utils";

export const ALL_PAYMENT_STATUS_FILTER_VALUE = "all";

interface PaymentStatusFilterSelectProps {
  value: PaymentStatus | "";
  onChange: (value: PaymentStatus | "") => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function PaymentStatusFilterSelect({
  value,
  onChange,
  disabled = false,
  className,
  id = "link-payment-status-filter",
}: PaymentStatusFilterSelectProps) {
  const items = useMemo(
    () => [
      { value: ALL_PAYMENT_STATUS_FILTER_VALUE, label: "Todos os status" },
      { value: "PENDING", label: "Pendente" },
      { value: "PAID", label: "Pago" },
    ],
    []
  );

  const selectValue = value || ALL_PAYMENT_STATUS_FILTER_VALUE;

  return (
    <div className={cn(FILTER_FIELD_WRAPPER_CLASS, className)}>
      <Label htmlFor={id} className={FILTER_FIELD_LABEL_CLASS}>
        Status
      </Label>
      <Select
        value={selectValue}
        onValueChange={(next) =>
          onChange(
            next === ALL_PAYMENT_STATUS_FILTER_VALUE || !next
              ? ""
              : (next as PaymentStatus)
          )
        }
        items={items}
        disabled={disabled}
      >
        <SelectTrigger id={id} className={FILTER_SELECT_TRIGGER_CLASS}>
          <SelectValue placeholder="Todos os status" className="truncate" />
        </SelectTrigger>
        <SelectContent align="start">
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              <span className="block truncate">{item.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

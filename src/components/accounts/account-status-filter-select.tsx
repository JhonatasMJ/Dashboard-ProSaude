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
import {
  ACCOUNT_STATUS_LABELS,
  type AccountStatus,
} from "@/shared/types/account-status.types";
import { cn } from "@/lib/utils";

export const ALL_ACCOUNT_STATUS_FILTER_VALUE = "all";

interface AccountStatusFilterSelectProps {
  value: AccountStatus | "";
  onChange: (value: AccountStatus | "") => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function AccountStatusFilterSelect({
  value,
  onChange,
  disabled = false,
  className,
  id = "account-status-filter",
}: AccountStatusFilterSelectProps) {
  const items = useMemo(
    () => [
      { value: ALL_ACCOUNT_STATUS_FILTER_VALUE, label: "Todos os status" },
      ...(
        Object.entries(ACCOUNT_STATUS_LABELS) as [AccountStatus, string][]
      ).map(([status, label]) => ({
        value: status,
        label,
      })),
    ],
    []
  );

  const selectValue = value || ALL_ACCOUNT_STATUS_FILTER_VALUE;

  return (
    <div className={cn(FILTER_FIELD_WRAPPER_CLASS, className)}>
      <Label htmlFor={id} className={FILTER_FIELD_LABEL_CLASS}>
        Status
      </Label>
      <Select
        value={selectValue}
        onValueChange={(next) =>
          onChange(
            next === ALL_ACCOUNT_STATUS_FILTER_VALUE || !next
              ? ""
              : (next as AccountStatus)
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

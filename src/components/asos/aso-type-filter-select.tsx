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
import { ASO_TYPE_LABELS, type AsoType } from "@/shared/types/aso-type.types";
import { cn } from "@/lib/utils";

export const ALL_ASO_TYPE_FILTER_VALUE = "all";

interface AsoTypeFilterSelectProps {
  value: AsoType | "";
  onChange: (value: AsoType | "") => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function AsoTypeFilterSelect({
  value,
  onChange,
  disabled = false,
  className,
  id = "aso-type-filter",
}: AsoTypeFilterSelectProps) {
  const items = useMemo(
    () => [
      { value: ALL_ASO_TYPE_FILTER_VALUE, label: "Todos os tipos" },
      ...(Object.entries(ASO_TYPE_LABELS) as [AsoType, string][]).map(
        ([type, label]) => ({
          value: type,
          label,
        })
      ),
    ],
    []
  );

  const selectValue = value || ALL_ASO_TYPE_FILTER_VALUE;

  return (
    <div className={cn(FILTER_FIELD_WRAPPER_CLASS, className)}>
      <Label htmlFor={id} className={FILTER_FIELD_LABEL_CLASS}>
        Tipo de ASO
      </Label>
      <Select
        value={selectValue}
        onValueChange={(next) =>
          onChange(
            next === ALL_ASO_TYPE_FILTER_VALUE || !next
              ? ""
              : (next as AsoType)
          )
        }
        items={items}
        disabled={disabled}
      >
        <SelectTrigger id={id} className={FILTER_SELECT_TRIGGER_CLASS}>
          <SelectValue placeholder="Todos os tipos" className="truncate" />
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

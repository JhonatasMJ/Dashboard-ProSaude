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
  OCCUPATIONAL_RISK_CATEGORY_LABELS,
  type OccupationalRiskCategory,
} from "@/shared/types/occupational-risk-category.types";
import { cn } from "@/lib/utils";

export const ALL_OCCUPATIONAL_RISK_CATEGORY_FILTER_VALUE = "all";

interface OccupationalRiskCategoryFilterSelectProps {
  value: OccupationalRiskCategory | "";
  onChange: (value: OccupationalRiskCategory | "") => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function OccupationalRiskCategoryFilterSelect({
  value,
  onChange,
  disabled = false,
  className,
  id = "occupational-risk-category-filter",
}: OccupationalRiskCategoryFilterSelectProps) {
  const items = useMemo(
    () => [
      {
        value: ALL_OCCUPATIONAL_RISK_CATEGORY_FILTER_VALUE,
        label: "Todas as categorias",
      },
      ...(
        Object.entries(OCCUPATIONAL_RISK_CATEGORY_LABELS) as [
          OccupationalRiskCategory,
          string,
        ][]
      ).map(([category, label]) => ({
        value: category,
        label,
      })),
    ],
    []
  );

  const selectValue = value || ALL_OCCUPATIONAL_RISK_CATEGORY_FILTER_VALUE;

  return (
    <div className={cn(FILTER_FIELD_WRAPPER_CLASS, className)}>
      <Label htmlFor={id} className={FILTER_FIELD_LABEL_CLASS}>
        Categoria
      </Label>
      <Select
        value={selectValue}
        onValueChange={(next) =>
          onChange(
            next === ALL_OCCUPATIONAL_RISK_CATEGORY_FILTER_VALUE || !next
              ? ""
              : (next as OccupationalRiskCategory)
          )
        }
        items={items}
        disabled={disabled}
      >
        <SelectTrigger id={id} className={FILTER_SELECT_TRIGGER_CLASS}>
          <SelectValue placeholder="Todas as categorias" className="truncate" />
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

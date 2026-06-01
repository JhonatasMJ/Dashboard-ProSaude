import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_COMPANIES_FILTER_VALUE } from "@/shared/constants/exam.constants";
import { cn } from "@/lib/utils";

export { ALL_COMPANIES_FILTER_VALUE };

const triggerClassName =
  "h-11! w-full min-w-0 justify-between rounded-md px-3.5 text-base shadow-none";

interface CompanyFilterSelectProps {
  value: string;
  onChange: (companyId: string) => void;
  companies: { id: string; name: string }[];
  disabled?: boolean;
  className?: string;
}

export function CompanyFilterSelect({
  value,
  onChange,
  companies,
  disabled = false,
  className,
}: CompanyFilterSelectProps) {
  const items = useMemo(
    () => [
      { value: ALL_COMPANIES_FILTER_VALUE, label: "Todas as empresas" },
      ...companies.map((company) => ({
        value: company.id,
        label: company.name,
      })),
    ],
    [companies]
  );

  const selectValue = value || ALL_COMPANIES_FILTER_VALUE;

  return (
    <div className={cn("flex w-full flex-col gap-2.5", className)}>
      <Label htmlFor="exam-company-filter" className="text-sm">
        Empresa
      </Label>
      <Select
        value={selectValue}
        onValueChange={(next) =>
          onChange(
            next === ALL_COMPANIES_FILTER_VALUE || !next ? "" : String(next)
          )
        }
        items={items}
        disabled={disabled}
      >
        <SelectTrigger id="exam-company-filter" className={triggerClassName}>
          <SelectValue placeholder="Todas as empresas" className="truncate" />
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

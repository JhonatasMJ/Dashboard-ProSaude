import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ALL_COMPANIES_FILTER_VALUE } from "@/shared/constants/exam.constants";
import { cn } from "@/lib/utils";

export { ALL_COMPANIES_FILTER_VALUE };

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
      <SearchableSelect
        id="exam-company-filter"
        value={selectValue}
        onValueChange={(next) =>
          onChange(
            next === ALL_COMPANIES_FILTER_VALUE || !next ? "" : String(next)
          )
        }
        options={items}
        placeholder="Todas as empresas"
        searchPlaceholder="Buscar empresa..."
        disabled={disabled}
      />
    </div>
  );
}

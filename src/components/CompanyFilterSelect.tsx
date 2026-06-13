import { useMemo } from "react";
import { Label } from "@/components/ui/Label";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  FILTER_FIELD_LABEL_CLASS,
  FILTER_FIELD_WRAPPER_CLASS,
  FILTER_SEARCHABLE_SELECT_CLASS,
} from "@/shared/constants/filter-field.constants";
import { ALL_COMPANIES_FILTER_VALUE } from "@/shared/constants/exam.constants";
import { cn } from "@/lib/utils";

export { ALL_COMPANIES_FILTER_VALUE };

interface CompanyFilterSelectProps {
  value: string;
  onChange: (companyId: string) => void;
  companies: { id: string; name: string }[];
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function CompanyFilterSelect({
  value,
  onChange,
  companies,
  disabled = false,
  className,
  id = "exam-company-filter",
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
    <div className={cn(FILTER_FIELD_WRAPPER_CLASS, className)}>
      <Label htmlFor={id} className={FILTER_FIELD_LABEL_CLASS}>
        Empresa
      </Label>
      <SearchableSelect
        id={id}
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
        className={FILTER_SEARCHABLE_SELECT_CLASS}
      />
    </div>
  );
}

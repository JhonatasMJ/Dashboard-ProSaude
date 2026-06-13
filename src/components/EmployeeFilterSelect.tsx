import { useMemo } from "react";
import { Label } from "@/components/ui/Label";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  FILTER_FIELD_LABEL_CLASS,
  FILTER_FIELD_WRAPPER_CLASS,
  FILTER_SEARCHABLE_SELECT_CLASS,
} from "@/shared/constants/filter-field.constants";
import { cn } from "@/lib/utils";

export const ALL_EMPLOYEES_FILTER_VALUE = "all";

interface EmployeeFilterSelectProps {
  value: string;
  onChange: (employeeId: string) => void;
  employees: { id: string; name: string; company: { name: string } }[];
  disabled?: boolean;
  className?: string;
}

export function EmployeeFilterSelect({
  value,
  onChange,
  employees,
  disabled = false,
  className,
}: EmployeeFilterSelectProps) {
  const items = useMemo(
    () => [
      { value: ALL_EMPLOYEES_FILTER_VALUE, label: "Todos os funcionários" },
      ...employees.map((employee) => ({
        value: employee.id,
        label: `${employee.name} · ${employee.company.name}`,
      })),
    ],
    [employees]
  );

  const selectValue = value || ALL_EMPLOYEES_FILTER_VALUE;

  return (
    <div className={cn(FILTER_FIELD_WRAPPER_CLASS, className)}>
      <Label htmlFor="link-employee-filter" className={FILTER_FIELD_LABEL_CLASS}>
        Funcionário
      </Label>
      <SearchableSelect
        id="link-employee-filter"
        value={selectValue}
        onValueChange={(next) =>
          onChange(
            next === ALL_EMPLOYEES_FILTER_VALUE || !next ? "" : String(next)
          )
        }
        options={items}
        placeholder="Todos os funcionários"
        searchPlaceholder="Buscar funcionário..."
        disabled={disabled}
        className={FILTER_SEARCHABLE_SELECT_CLASS}
      />
    </div>
  );
}

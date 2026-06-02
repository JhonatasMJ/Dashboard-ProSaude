import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
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
    <div className={cn("flex w-full flex-col gap-2.5", className)}>
      <Label htmlFor="link-employee-filter" className="text-sm">
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
      />
    </div>
  );
}

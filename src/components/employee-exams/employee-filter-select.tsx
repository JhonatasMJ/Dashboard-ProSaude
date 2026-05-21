import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const ALL_EMPLOYEES_FILTER_VALUE = "all";

const triggerClassName =
  "h-11! w-full min-w-0 justify-between rounded-md px-3.5 text-base shadow-none";

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
      <Select
        value={selectValue}
        onValueChange={(next) =>
          onChange(
            next === ALL_EMPLOYEES_FILTER_VALUE || !next ? "" : String(next)
          )
        }
        items={items}
        disabled={disabled}
      >
        <SelectTrigger id="link-employee-filter" className={triggerClassName}>
          <SelectValue placeholder="Todos os funcionários" className="truncate" />
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

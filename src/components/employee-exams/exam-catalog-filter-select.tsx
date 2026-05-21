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

export const ALL_EXAMS_FILTER_VALUE = "all";

const triggerClassName =
  "h-11! w-full min-w-0 justify-between rounded-md px-3.5 text-base shadow-none";

interface ExamCatalogFilterSelectProps {
  value: string;
  onChange: (examId: string) => void;
  exams: { id: string; name: string }[];
  disabled?: boolean;
  className?: string;
}

export function ExamCatalogFilterSelect({
  value,
  onChange,
  exams,
  disabled = false,
  className,
}: ExamCatalogFilterSelectProps) {
  const items = useMemo(
    () => [
      { value: ALL_EXAMS_FILTER_VALUE, label: "Todos os exames" },
      ...exams.map((exam) => ({
        value: exam.id,
        label: exam.name,
      })),
    ],
    [exams]
  );

  const selectValue = value || ALL_EXAMS_FILTER_VALUE;

  return (
    <div className={cn("flex w-full flex-col gap-2.5", className)}>
      <Label htmlFor="link-exam-filter" className="text-sm">
        Exame
      </Label>
      <Select
        value={selectValue}
        onValueChange={(next) =>
          onChange(
            next === ALL_EXAMS_FILTER_VALUE || !next ? "" : String(next)
          )
        }
        items={items}
        disabled={disabled}
      >
        <SelectTrigger id="link-exam-filter" className={triggerClassName}>
          <SelectValue placeholder="Todos os exames" className="truncate" />
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

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";

export const ALL_EXAMS_FILTER_VALUE = "all";

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
      <SearchableSelect
        id="link-exam-filter"
        value={selectValue}
        onValueChange={(next) =>
          onChange(next === ALL_EXAMS_FILTER_VALUE || !next ? "" : String(next))
        }
        options={items}
        placeholder="Todos os exames"
        searchPlaceholder="Buscar exame..."
        disabled={disabled}
      />
    </div>
  );
}

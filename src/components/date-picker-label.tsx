import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  FILTER_DATE_PICKER_CLASS,
  FILTER_FIELD_LABEL_CLASS,
  FILTER_FIELD_WRAPPER_CLASS,
} from "@/shared/constants/filter-field.constants";
import { cn } from "@/lib/utils";

interface DatePickerLabelProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

export function DatePickerLabel({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  compact = false,
}: DatePickerLabelProps) {
  return (
    <div
      className={cn(
        compact ? FILTER_FIELD_WRAPPER_CLASS : "flex w-full flex-col gap-2.5",
        className
      )}
    >
      <Label
        htmlFor={id}
        className={compact ? FILTER_FIELD_LABEL_CLASS : "text-sm"}
      >
        {label}
      </Label>
      <DatePicker
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={compact ? FILTER_DATE_PICKER_CLASS : undefined}
      />
    </div>
  );
}

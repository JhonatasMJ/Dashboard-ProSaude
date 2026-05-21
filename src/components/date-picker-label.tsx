import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

interface DatePickerLabelProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePickerLabel({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
}: DatePickerLabelProps) {
  return (
    <div className={cn("flex w-full flex-col gap-2.5", className)}>
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <DatePicker
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

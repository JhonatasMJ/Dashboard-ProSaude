import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FILTER_INPUT_CLASS } from "@/shared/constants/filter-field.constants";
import { cn } from "@/lib/utils";

interface DataTableSearchFilterProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

export function DataTableSearchFilter({
  id,
  value,
  onChange,
  placeholder = "Buscar por nome...",
  ariaLabel,
  className,
}: DataTableSearchFilterProps) {
  return (
    <div className={cn("relative max-w-full", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={FILTER_INPUT_CLASS}
        aria-label={ariaLabel ?? placeholder}
      />
    </div>
  );
}

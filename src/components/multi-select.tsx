import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { matchesSearchText } from "@/shared/helpers/search-text.helper";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  maxSelections?: number;
  disabled?: boolean;
  id?: string;
  "aria-invalid"?: boolean;
  className?: string;
};

function getDisplayLabel(
  value: string[],
  options: MultiSelectOption[],
  placeholder: string
) {
  if (value.length === 0) return placeholder;

  const labels = value
    .map((id) => options.find((option) => option.value === id)?.label)
    .filter((label): label is string => Boolean(label));

  if (labels.length === 0) return placeholder;
  if (labels.length === 1) return labels[0];

  return labels.join(", ");
}

export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  maxSelections,
  disabled = false,
  id,
  "aria-invalid": ariaInvalid,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const displayLabel = useMemo(
    () => getDisplayLabel(value, options, placeholder),
    [value, options, placeholder]
  );

  const filteredOptions = useMemo(
    () => options.filter((option) => matchesSearchText(option.label, searchQuery)),
    [options, searchQuery]
  );

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      return;
    }

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open]);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((id) => id !== optionValue));
      return;
    }

    if (maxSelections === 1) {
      onChange([optionValue]);
      return;
    }

    if (maxSelections !== undefined && value.length >= maxSelections) {
      return;
    }

    onChange([...value, optionValue]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="outline"
            id={id}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            className={cn(
              "h-11! w-full justify-between rounded-md px-3.5 text-base font-normal shadow-none",
              value.length === 0 && "text-muted-foreground",
              ariaInvalid && "border-destructive ring-3 ring-destructive/20",
              className
            )}
          />
        }
      >
        <span className="truncate text-left">{displayLabel}</span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        matchTriggerWidth
        className="gap-0 overflow-hidden p-0"
      >
        <div className="border-b border-border p-2">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 pl-9 text-sm shadow-none"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.stopPropagation();
                  setOpen(false);
                }
              }}
            />
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto p-1">
          {options.length === 0 ? (
            <p className="px-2 py-2 text-sm text-muted-foreground">
              Nenhuma opção disponível
            </p>
          ) : filteredOptions.length === 0 ? (
            <p className="px-2 py-2 text-sm text-muted-foreground">
              Nenhum resultado encontrado
            </p>
          ) : (
            filteredOptions.map((option) => {
              const selected = value.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={disabled}
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    selected && "bg-accent/50"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-sm border border-input",
                      selected &&
                        "border-primary bg-primary text-primary-foreground"
                    )}
                  >
                    {selected && <CheckIcon className="size-3" />}
                  </span>
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

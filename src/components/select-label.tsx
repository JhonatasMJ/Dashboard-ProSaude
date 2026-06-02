import { useMemo } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";

export type SelectOption = SearchableSelectOption;

const triggerClassName =
  "h-11! w-full min-w-0 justify-between rounded-md px-3.5 text-base shadow-none";

type SelectLabelProps<T extends FieldValues> = {
  label: string;
  name: FieldPath<T>;
  control: Control<T>;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  containerClassName?: string;
  disabled?: boolean;
  searchable?: boolean;
};

export function SelectLabel<T extends FieldValues>({
  label,
  name,
  control,
  options,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  containerClassName,
  disabled = false,
  searchable = true,
}: SelectLabelProps<T>) {
  const fieldId = String(name);

  const items = useMemo(
    () => options.map((option) => ({ value: option.value, label: option.label })),
    [options]
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={cn("flex w-full flex-col gap-2.5", containerClassName)}>
          <Label htmlFor={fieldId} className="text-sm">
            {label}
          </Label>

          {searchable ? (
            <SearchableSelect
              id={fieldId}
              value={field.value || null}
              onValueChange={(next) => field.onChange(next ?? "")}
              options={items}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
              disabled={disabled}
              aria-invalid={!!fieldState.error}
            />
          ) : (
            <Select
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? "")}
              items={items}
              disabled={disabled}
            >
              <SelectTrigger
                id={fieldId}
                aria-invalid={!!fieldState.error}
                className={cn(
                  triggerClassName,
                  fieldState.error &&
                    "border-destructive ring-3 ring-destructive/20"
                )}
              >
                <SelectValue placeholder={placeholder} className="truncate" />
              </SelectTrigger>
              <SelectContent align="start">
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    <span className="block truncate">{item.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {fieldState.error?.message && (
            <p className="text-sm text-destructive">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}

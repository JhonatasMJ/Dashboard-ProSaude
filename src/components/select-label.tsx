import { useMemo } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";

export type SelectOption = SearchableSelectOption;

type SelectLabelProps<T extends FieldValues> = {
  label: string;
  name: FieldPath<T>;
  control: Control<T>;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  containerClassName?: string;
  disabled?: boolean;
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

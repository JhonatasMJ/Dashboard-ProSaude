import { useMemo } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import {
  MultiSelect,
  type MultiSelectOption,
} from "@/components/multi-select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type MultiSelectLabelProps<T extends FieldValues> = {
  label: string;
  name: FieldPath<T>;
  control: Control<T>;
  options: MultiSelectOption[];
  placeholder?: string;
  maxSelections?: number;
  containerClassName?: string;
  disabled?: boolean;
};

export function MultiSelectLabel<T extends FieldValues>({
  label,
  name,
  control,
  options,
  placeholder = "Selecione...",
  maxSelections,
  containerClassName,
  disabled = false,
}: MultiSelectLabelProps<T>) {
  const fieldId = String(name);

  const items = useMemo(
    () =>
      options.map((option) => ({
        value: option.value,
        label: option.label,
      })),
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
          <MultiSelect
            id={fieldId}
            value={field.value ?? []}
            onChange={field.onChange}
            options={items}
            placeholder={placeholder}
            maxSelections={maxSelections}
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

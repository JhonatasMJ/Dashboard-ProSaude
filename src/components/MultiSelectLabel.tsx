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
} from "@/components/MultiSelect";
import { Label } from "@/components/ui/Label";
import {
  FILTER_FIELD_LABEL_CLASS,
  FILTER_SEARCHABLE_SELECT_CLASS,
} from "@/shared/constants/filter-field.constants";
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
  /** Usa o mesmo tamanho compacto dos campos de filtro. */
  compact?: boolean;
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
  compact = false,
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
        <div
          className={cn(
            "flex w-full flex-col",
            compact ? "gap-1.5" : "gap-2.5",
            containerClassName
          )}
        >
          <Label
            htmlFor={fieldId}
            className={compact ? FILTER_FIELD_LABEL_CLASS : "text-sm"}
          >
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
            className={cn(compact && FILTER_SEARCHABLE_SELECT_CLASS)}
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

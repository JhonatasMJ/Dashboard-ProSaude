import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import type { FocusEvent } from "react";
import { IMaskInput } from "react-imask";
import type { FactoryOpts } from "imask";
import { Label } from "@/components/ui/Label";
import { FILTER_FIELD_LABEL_CLASS } from "@/shared/constants/filter-field.constants";
import { cn } from "@/lib/utils";

type MaskedInputLabelProps<T extends FieldValues> = {
  label: string;
  name: FieldPath<T>;
  control: Control<T>;
  maskOptions: FactoryOpts;
  containerClassName?: string;
  placeholder?: string;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  /** Usa o mesmo tamanho compacto dos campos de filtro. */
  compact?: boolean;
};

const inputClassName =
  "h-11 w-full min-w-0 rounded-md border border-input bg-transparent px-3.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30";

const compactInputClassName =
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30";

export function MaskedInputLabel<T extends FieldValues>({
  label,
  name,
  control,
  maskOptions,
  containerClassName,
  placeholder,
  onBlur,
  compact = false,
}: MaskedInputLabelProps<T>) {
  const inputId = String(name);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div
          className={cn(
            "flex flex-col",
            compact ? "gap-1.5" : "gap-2.5",
            containerClassName
          )}
        >
          <Label
            htmlFor={inputId}
            className={compact ? FILTER_FIELD_LABEL_CLASS : "text-sm"}
          >
            {label}
          </Label>
          <IMaskInput
            {...maskOptions}
            id={inputId}
            value={field.value ?? ""}
            unmask={false}
            placeholder={placeholder}
            aria-invalid={!!fieldState.error}
            className={cn(
              compact ? compactInputClassName : inputClassName,
              fieldState.error &&
                "border-destructive ring-3 ring-destructive/20"
            )}
            onAccept={(_value, maskRef) => {
              field.onChange(maskRef.value);
            }}
            onBlur={(event) => {
              field.onBlur();
              onBlur?.(event);
            }}
            inputRef={field.ref}
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

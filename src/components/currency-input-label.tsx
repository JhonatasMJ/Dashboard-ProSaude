import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyPriceDigitInput } from "@/shared/helpers/currency-input.helper";
import { cn } from "@/lib/utils";

type CurrencyInputLabelProps<T extends FieldValues> = {
  label: string;
  name: FieldPath<T>;
  control: Control<T>;
  containerClassName?: string;
  placeholder?: string;
  disabled?: boolean;
};

export function CurrencyInputLabel<T extends FieldValues>({
  label,
  name,
  control,
  containerClassName,
  placeholder = "0,00",
  disabled = false,
}: CurrencyInputLabelProps<T>) {
  const inputId = String(name);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={cn("flex flex-col gap-2.5", containerClassName)}>
          <Label htmlFor={inputId} className="text-sm">
            {label}
          </Label>
          <div className="relative">
            <span
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-medium text-muted-foreground"
              aria-hidden
            >
              R$
            </span>
            <Input
              id={inputId}
              type="text"
              inputMode="numeric"
              disabled={disabled}
              placeholder={placeholder}
              aria-invalid={!!fieldState.error}
              className="h-11 pl-10"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(applyPriceDigitInput(e.target.value))}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          </div>
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

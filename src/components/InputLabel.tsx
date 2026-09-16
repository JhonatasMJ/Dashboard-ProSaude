import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FILTER_FIELD_LABEL_CLASS } from "@/shared/constants/filter-field.constants";
import { cn } from "@/lib/utils";

type InputLabelProps<T extends FieldValues> = {
  label: string;
  name: FieldPath<T>;
  control: Control<T>;
  containerClassName?: string;
  /** Usa o mesmo tamanho compacto dos campos de filtro. */
  compact?: boolean;
} & Omit<
  React.ComponentProps<typeof Input>,
  "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "ref"
>;

export function InputLabel<T extends FieldValues>({
  label,
  name,
  control,
  containerClassName,
  compact = false,
  className,
  id,
  type = "text",
  ...inputProps
}: InputLabelProps<T>) {
  const inputId = id ?? String(name);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

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
          <div className="relative">
            <Input
              id={inputId}
              type={inputType}
              aria-invalid={!!fieldState.error}
              className={cn(
                compact && "h-9 pl-3 text-sm",
                isPassword ? "pr-12" : compact && "pr-3",
                className
              )}
              {...field}
              {...inputProps}
            />
            {isPassword && (
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            )}
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

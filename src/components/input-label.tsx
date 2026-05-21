import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type InputLabelProps<T extends FieldValues> = {
  label: string;
  name: FieldPath<T>;
  control: Control<T>;
  containerClassName?: string;
} & Omit<
  React.ComponentProps<typeof Input>,
  "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "ref"
>;

export function InputLabel<T extends FieldValues>({
  label,
  name,
  control,
  containerClassName,
  className,
  id,
  ...inputProps
}: InputLabelProps<T>) {
  const inputId = id ?? String(name);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={cn("flex flex-col gap-2", containerClassName)}>
          <Label htmlFor={inputId}>{label}</Label>
          <Input
            id={inputId}
            aria-invalid={!!fieldState.error}
            className={className}
            {...field}
            {...inputProps}
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

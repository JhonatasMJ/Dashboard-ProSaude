import { addMonths } from "date-fns";
import { useState } from "react";
import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldArrayPath,
  type FieldPath,
  type UseFormGetValues,
  type UseFormSetValue,
} from "react-hook-form";
import { DatePickerLabel } from "@/components/DatePickerLabel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  FILTER_FIELD_LABEL_CLASS,
  FILTER_FIELD_WRAPPER_CLASS,
  FILTER_INPUT_CLASS,
} from "@/shared/constants/filter-field.constants";
import {
  applyPriceDigitInput,
  formatDigitsToPriceDisplay,
  formatNumberToPriceInput,
  parsePriceInputToNumber,
} from "@/shared/helpers/currency-input.helper";
import { dateToDateOnly, parseDateOnlyInput } from "@/shared/helpers/date.helper";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";
import { cn } from "@/lib/utils";

export const MIN_INSTALLMENTS = 2;
export const MAX_INSTALLMENTS = 12;

export interface InstallmentFormItem {
  amount: string;
  dueDate?: string;
}

interface InstallmentsFormValues {
  installments: InstallmentFormItem[];
}

interface InstallmentRowsFieldProps<T extends InstallmentsFormValues> {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  getValues: UseFormGetValues<T>;
  maxAmountValue: number;
  showDueDate?: boolean;
  totalAmount?: number;
  disabled?: boolean;
}

function CompactCurrencyField({
  label,
  value,
  maxCents,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  maxCents: number;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className={cn(FILTER_FIELD_WRAPPER_CLASS, "flex-1")}>
      <Label className={FILTER_FIELD_LABEL_CLASS}>{label}</Label>
      <div className="relative">
        <span
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-medium text-muted-foreground"
          aria-hidden
        >
          R$
        </span>
        <Input
          type="text"
          inputMode="numeric"
          className={cn(FILTER_INPUT_CLASS, "pl-8")}
          placeholder="0,00"
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(applyPriceDigitInput(event.target.value, maxCents))
          }
        />
      </div>
    </div>
  );
}

export function InstallmentRowsField<T extends InstallmentsFormValues>({
  control,
  setValue,
  getValues,
  maxAmountValue,
  showDueDate = true,
  totalAmount,
  disabled = false,
}: InstallmentRowsFieldProps<T>) {
  const maxCents = Math.round(maxAmountValue * 100);
  const arrayName = "installments" as FieldArrayPath<T>;
  const watchName = "installments" as FieldPath<T>;

  const { fields, replace } = useFieldArray({
    control,
    name: arrayName,
  });

  const installments = (useWatch({ control, name: watchName }) ??
    []) as InstallmentFormItem[];

  const [manualQuickTotal, setManualQuickTotal] = useState("");
  const [quickCount, setQuickCount] = useState("2");

  const quickTotal =
    totalAmount != null
      ? formatNumberToPriceInput(totalAmount, maxCents)
      : manualQuickTotal;

  const totalCents = installments.reduce((sum, item) => {
    const amount = parsePriceInputToNumber(item.amount, maxCents);
    return sum + (Number.isNaN(amount) ? 0 : Math.round(amount * 100));
  }, 0);

  const mismatch =
    totalAmount != null &&
    installments.length > 0 &&
    Math.round(totalAmount * 100) !== totalCents;

  const handleGenerateEqual = () => {
    const count = Math.max(
      MIN_INSTALLMENTS,
      Math.min(MAX_INSTALLMENTS, Number.parseInt(quickCount, 10) || MIN_INSTALLMENTS)
    );
    const baseAmount = parsePriceInputToNumber(quickTotal, maxCents);

    if (Number.isNaN(baseAmount) || baseAmount <= 0) return;

    const totalCentsToSplit = Math.round(baseAmount * 100);
    const baseCents = Math.floor(totalCentsToSplit / count);
    const remainder = totalCentsToSplit - baseCents * count;

    const firstDueDate = showDueDate
      ? getValues(`installments.0.dueDate` as FieldPath<T>)
      : undefined;
    const startDate =
      (typeof firstDueDate === "string"
        ? parseDateOnlyInput(firstDueDate)
        : undefined) ?? new Date();

    const items: InstallmentFormItem[] = Array.from({ length: count }, (_, index) => {
      const cents = baseCents + (index === count - 1 ? remainder : 0);
      const amount = formatDigitsToPriceDisplay(String(cents), maxCents);

      return showDueDate
        ? { amount, dueDate: dateToDateOnly(addMonths(startDate, index)) }
        : { amount };
    });

    replace(items as never[]);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-muted/30 p-4">
        <p className="mb-3 text-xs font-medium text-muted-foreground">
          Defina o número de parcelas e gere os valores automaticamente
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            <div className={cn(FILTER_FIELD_WRAPPER_CLASS, "min-w-[140px] flex-1")}>
              <Label className={FILTER_FIELD_LABEL_CLASS}>Valor a dividir</Label>
              <div className="relative">
                <span
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-medium text-muted-foreground"
                  aria-hidden
                >
                  R$
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  className={cn(FILTER_INPUT_CLASS, "pl-8")}
                  placeholder="0,00"
                  value={quickTotal}
                  disabled={disabled || totalAmount != null}
                  onChange={(event) =>
                    setManualQuickTotal(
                      applyPriceDigitInput(event.target.value, maxCents)
                    )
                  }
                />
              </div>
            </div>
            <div className={cn(FILTER_FIELD_WRAPPER_CLASS, "w-24")}>
              <Label className={FILTER_FIELD_LABEL_CLASS}>Parcelas</Label>
              <Input
                type="text"
                inputMode="numeric"
                className={FILTER_INPUT_CLASS}
                value={quickCount}
                disabled={disabled}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, "").slice(0, 2);
                  if (digits !== "" && Number.parseInt(digits, 10) > MAX_INSTALLMENTS) {
                    return;
                  }
                  setQuickCount(digits);
                }}
                onBlur={() => {
                  const parsed = Number.parseInt(quickCount, 10);
                  const clamped = Number.isNaN(parsed)
                    ? MIN_INSTALLMENTS
                    : Math.min(MAX_INSTALLMENTS, Math.max(MIN_INSTALLMENTS, parsed));
                  setQuickCount(String(clamped));
                }}
              />
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="h-9 w-full rounded-md text-sm"
            disabled={disabled}
            onClick={handleGenerateEqual}
          >
            Gerar parcelas
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-end gap-2">
            <CompactCurrencyField
              label={`Parcela ${index + 1}`}
              value={installments[index]?.amount ?? ""}
              maxCents={maxCents}
              disabled={disabled}
              onChange={(value) =>
                setValue(
                  `installments.${index}.amount` as FieldPath<T>,
                  value as never,
                  { shouldValidate: true }
                )
              }
            />
            {showDueDate && (
              <DatePickerLabel
                id={`installment-due-${index}`}
                label="Vencimento"
                value={installments[index]?.dueDate ?? ""}
                onChange={(value) =>
                  setValue(
                    `installments.${index}.dueDate` as FieldPath<T>,
                    value as never,
                    { shouldValidate: true }
                  )
                }
                placeholder="Selecione a data"
                disabled={disabled}
                className="flex-1"
                compact
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2">
        <div className="text-right text-sm">
          <span className="text-muted-foreground">Soma: </span>
          <span
            className={cn(
              "font-medium",
              mismatch ? "text-destructive" : "text-foreground"
            )}
          >
            {formatCurrency(totalCents / 100)}
          </span>
        </div>
      </div>

      {mismatch && (
        <p className="text-sm text-destructive">
          A soma das parcelas deve ser igual a {formatCurrency(totalAmount!)}.
        </p>
      )}
    </div>
  );
}

import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, type ReactNode } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { CurrencyInputLabel } from "@/components/currency-input-label";
import { DatePickerLabel } from "@/components/date-picker-label";
import { InputLabel } from "@/components/input-label";
import { SelectLabel } from "@/components/select-label";
import { Button } from "@/components/ui/button";
import { accountSchema } from "@/schemas/account.schema";
import { accountToFormValues } from "@/shared/helpers/account-form.helper";
import { dateToDateOnly } from "@/shared/helpers/date.helper";
import { MAX_ACCOUNT_VALUE } from "@/shared/helpers/currency-input.helper";
import type { IAccount } from "@/shared/interfaces/https/account";
import {
  ACCOUNT_STATUS_LABELS,
  type AccountStatus,
} from "@/shared/types/account-status.types";
import type { AccountFormData } from "@/types/account-form.types";
import { cn } from "@/lib/utils";

interface AccountFormProps {
  defaultValues?: IAccount;
  isSubmitting?: boolean;
  submitLabel: string;
  formId?: string;
  variant?: "default" | "sheet";
  onSubmit: (data: AccountFormData) => Promise<void>;
  onCancel?: () => void;
}

const emptyValues: AccountFormData = {
  name: "",
  amount: "",
  dueDate: "",
  status: "PENDING",
  paidAt: "",
};

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function AccountForm({
  defaultValues,
  isSubmitting = false,
  submitLabel,
  formId = "account-form",
  variant = "default",
  onSubmit,
  onCancel,
}: AccountFormProps) {
  const isSheet = variant === "sheet";

  const statusOptions = useMemo(
    () =>
      (Object.entries(ACCOUNT_STATUS_LABELS) as [AccountStatus, string][]).map(
        ([value, label]) => ({ value, label })
      ),
    []
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: yupResolver(accountSchema) as Resolver<AccountFormData>,
    defaultValues: defaultValues ? accountToFormValues(defaultValues) : emptyValues,
  });

  const status = useWatch({ control, name: "status" });
  const dueDate = useWatch({ control, name: "dueDate" });
  const paidAt = useWatch({ control, name: "paidAt" });
  const isPaid = status === "PAID";

  useEffect(() => {
    if (!isPaid) {
      setValue("paidAt", "", { shouldValidate: true });
      return;
    }

    if (!paidAt?.trim()) {
      setValue("paidAt", dateToDateOnly(new Date()), {
        shouldValidate: true,
      });
    }
  }, [isPaid, paidAt, setValue]);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className={cn(isSheet ? "space-y-8" : "flex flex-col gap-4")}
      noValidate
    >
      <FormSection
        title="Dados da conta"
        description="Informe os dados principais da conta."
      >
        <InputLabel
          control={control}
          name="name"
          label="Nome"
          placeholder="Ex.: Aluguel, Energia..."
        />

        <CurrencyInputLabel
          control={control}
          name="amount"
          label="Valor"
          placeholder="0,00"
          maxValue={MAX_ACCOUNT_VALUE}
          disabled={isSubmitting}
        />

        <div className="flex flex-col gap-2.5">
          <DatePickerLabel
            id="account-due-date"
            label="Data de vencimento"
            value={dueDate ?? ""}
            onChange={(value) =>
              setValue("dueDate", value, { shouldValidate: true })
            }
            placeholder="Selecione a data de vencimento"
            disabled={isSubmitting}
          />
          {errors.dueDate?.message && (
            <p className="text-sm text-destructive">
              {errors.dueDate.message}
            </p>
          )}
        </div>

        <SelectLabel
          control={control}
          name="status"
          label="Status"
          options={statusOptions}
          placeholder="Selecione o status"
          searchable={false}
          disabled={isSubmitting}
        />

        {isPaid && (
          <div className="flex flex-col gap-2.5">
            <DatePickerLabel
              id="account-paid-at"
              label="Data de pagamento"
              value={paidAt ?? ""}
              onChange={(value) =>
                setValue("paidAt", value, { shouldValidate: true })
              }
              placeholder="Selecione a data de pagamento"
              disabled={isSubmitting}
            />
            {errors.paidAt?.message && (
              <p className="text-sm text-destructive">
                {errors.paidAt.message}
              </p>
            )}
          </div>
        )}
      </FormSection>

      {!isSheet && onCancel && (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-md"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" className="rounded-md" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}

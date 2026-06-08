import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, type ReactNode } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { CurrencyInputLabel } from "@/components/currency-input-label";
import { DatePickerLabel } from "@/components/date-picker-label";
import { InputLabel } from "@/components/input-label";
import { SelectLabel } from "@/components/select-label";
import { Button } from "@/components/ui/button";
import { contaSchema } from "@/schemas/conta.schema";
import { contaToFormValues } from "@/shared/helpers/conta-form.helper";
import { dateToDateOnly } from "@/shared/helpers/date.helper";
import { MAX_CONTA_VALUE } from "@/shared/helpers/currency-input.helper";
import type { IConta } from "@/shared/interfaces/https/conta";
import {
  CONTA_STATUS_LABELS,
  type ContaStatus,
} from "@/shared/types/conta-status.types";
import type { ContaFormData } from "@/types/conta-form.types";
import { cn } from "@/lib/utils";

interface ContaFormProps {
  defaultValues?: IConta;
  isSubmitting?: boolean;
  submitLabel: string;
  formId?: string;
  variant?: "default" | "sheet";
  onSubmit: (data: ContaFormData) => Promise<void>;
  onCancel?: () => void;
}

const emptyValues: ContaFormData = {
  nome: "",
  valor: "",
  dataVencimento: "",
  status: "pendente",
  dataPagamento: "",
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

export function ContaForm({
  defaultValues,
  isSubmitting = false,
  submitLabel,
  formId = "conta-form",
  variant = "default",
  onSubmit,
  onCancel,
}: ContaFormProps) {
  const isSheet = variant === "sheet";

  const statusOptions = useMemo(
    () =>
      (Object.entries(CONTA_STATUS_LABELS) as [ContaStatus, string][]).map(
        ([value, label]) => ({ value, label })
      ),
    []
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ContaFormData>({
    resolver: yupResolver(contaSchema) as Resolver<ContaFormData>,
    defaultValues: defaultValues ? contaToFormValues(defaultValues) : emptyValues,
  });

  const status = useWatch({ control, name: "status" });
  const dataVencimento = useWatch({ control, name: "dataVencimento" });
  const dataPagamento = useWatch({ control, name: "dataPagamento" });
  const isPaid = status === "pago";

  useEffect(() => {
    if (!isPaid) {
      setValue("dataPagamento", "", { shouldValidate: true });
      return;
    }

    if (!dataPagamento?.trim()) {
      setValue("dataPagamento", dateToDateOnly(new Date()), {
        shouldValidate: true,
      });
    }
  }, [isPaid, dataPagamento, setValue]);

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
          name="nome"
          label="Nome"
          placeholder="Ex.: Aluguel, Energia..."
        />

        <CurrencyInputLabel
          control={control}
          name="valor"
          label="Valor"
          placeholder="0,00"
          maxValue={MAX_CONTA_VALUE}
          disabled={isSubmitting}
        />

        <div className="flex flex-col gap-2.5">
          <DatePickerLabel
            id="conta-data-vencimento"
            label="Data de vencimento"
            value={dataVencimento ?? ""}
            onChange={(value) =>
              setValue("dataVencimento", value, { shouldValidate: true })
            }
            placeholder="Selecione a data de vencimento"
            disabled={isSubmitting}
          />
          {errors.dataVencimento?.message && (
            <p className="text-sm text-destructive">
              {errors.dataVencimento.message}
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
              id="conta-data-pagamento"
              label="Data de pagamento"
              value={dataPagamento ?? ""}
              onChange={(value) =>
                setValue("dataPagamento", value, { shouldValidate: true })
              }
              placeholder="Selecione a data de pagamento"
              disabled={isSubmitting}
            />
            {errors.dataPagamento?.message && (
              <p className="text-sm text-destructive">
                {errors.dataPagamento.message}
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

import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo, type ReactNode } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { CurrencyInputLabel } from "@/components/currency-input-label";
import { InputLabel } from "@/components/input-label";
import { Button } from "@/components/ui/button";
import { examSchema } from "@/schemas/exam.schema";
import { formatExamProfitLabel } from "@/shared/helpers/exam-financials.helper";
import { examToFormValues } from "@/shared/helpers/exam-form.helper";
import { parsePriceInputToNumber } from "@/shared/helpers/currency-input.helper";
import type { IExam } from "@/shared/interfaces/https/exam";
import type { ExamFormData } from "@/types/exam-form.types";
import { cn } from "@/lib/utils";

interface ExamFormProps {
  defaultValues?: IExam;
  isSubmitting?: boolean;
  submitLabel: string;
  formId?: string;
  variant?: "default" | "sheet";
  onSubmit: (data: ExamFormData) => Promise<void>;
  onCancel?: () => void;
}

const emptyValues: ExamFormData = {
  name: "",
  price: "",
  cost: "",
  notes: "",
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

export function ExamForm({
  defaultValues,
  isSubmitting = false,
  submitLabel,
  formId = "exam-form",
  variant = "default",
  onSubmit,
  onCancel,
}: ExamFormProps) {
  const isSheet = variant === "sheet";

  const { control, handleSubmit } = useForm<ExamFormData>({
    resolver: yupResolver(examSchema) as Resolver<ExamFormData>,
    defaultValues: defaultValues ? examToFormValues(defaultValues) : emptyValues,
  });

  const priceValue = useWatch({ control, name: "price" });
  const costValue = useWatch({ control, name: "cost" });

  const profitHint = useMemo(() => {
    const price = parsePriceInputToNumber(priceValue);
    const cost = parsePriceInputToNumber(costValue);

    if (Number.isNaN(price) || Number.isNaN(cost) || price <= 0 || cost <= 0) {
      return null;
    }

    return formatExamProfitLabel(price, cost);
  }, [priceValue, costValue]);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className={cn(isSheet ? "space-y-8" : "flex flex-col gap-4")}
      noValidate
    >
      <FormSection
        title="Dados do exame"
        description="Catálogo global de exames com preço e custo."
      >
        <InputLabel
          control={control}
          name="name"
          label="Nome do exame"
          placeholder="Ex.: Audiometria"
        />

        <CurrencyInputLabel
          control={control}
          name="price"
          label="Preço (valor cobrado)"
          placeholder="0,00"
          disabled={isSubmitting}
        />

        <div className="space-y-1">
          <CurrencyInputLabel
            control={control}
            name="cost"
            label="Custo (valor pago)"
            placeholder="0,00"
            disabled={isSubmitting}
          />
          {profitHint && (
            <p className="text-xs text-muted-foreground">{profitHint}</p>
          )}
        </div>

        <InputLabel
          control={control}
          name="notes"
          label="Observações"
          placeholder="Informações adicionais (opcional)"
        />
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

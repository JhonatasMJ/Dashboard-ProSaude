import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo, type ReactNode } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { CurrencyInputLabel } from "@/components/CurrencyInputLabel";
import { InputLabel } from "@/components/InputLabel";
import { SelectLabel } from "@/components/SelectLabel";
import { Button } from "@/components/ui/Button";
import { examSchema } from "@/schemas/exam.schema";
import {
  ALL_COMPANIES_EXAM_VALUE,
  isAllCompaniesExamSelection,
} from "@/shared/constants/exam.constants";
import { formatExamProfitLabel } from "@/shared/helpers/exam-financials.helper";
import { examToFormValues } from "@/schemas/exam.schema";
import {
  extractPriceDigits,
  parsePriceInputToNumber,
} from "@/shared/helpers/currency-input.helper";
import type { IExam } from "@/shared/interfaces/https/exam";
import type { ExamFormData } from "@/schemas/exam.schema";
import { cn } from "@/lib/utils";

interface ExamFormProps {
  defaultValues?: IExam;
  companies: { id: string; name: string }[];
  isSubmitting?: boolean;
  submitLabel: string;
  formId?: string;
  variant?: "default" | "sheet";
  onSubmit: (data: ExamFormData) => Promise<void>;
  onCancel?: () => void;
}

const emptyValues: ExamFormData = {
  companyId: "",
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
  companies,
  isSubmitting = false,
  submitLabel,
  formId = "exam-form",
  variant = "default",
  onSubmit,
  onCancel,
}: ExamFormProps) {
  const isSheet = variant === "sheet";
  const isEditing = !!defaultValues;

  const companyOptions = useMemo(() => {
    const options = companies.map((company) => ({
      value: company.id,
      label: company.name,
    }));

    return [
      {
        value: ALL_COMPANIES_EXAM_VALUE,
        label: "Todas as empresas (mesmo exame)",
      },
      ...options,
    ];
  }, [companies]);

  const { control, handleSubmit } = useForm<ExamFormData>({
    resolver: yupResolver(examSchema) as Resolver<ExamFormData>,
    defaultValues: defaultValues ? examToFormValues(defaultValues) : emptyValues,
  });

  const companyIdValue = useWatch({ control, name: "companyId" });
  const priceValue = useWatch({ control, name: "price" });
  const costValue = useWatch({ control, name: "cost" });

  const isAllCompaniesSelected = isAllCompaniesExamSelection(
    companyIdValue ?? ""
  );

  const profitHint = useMemo(() => {
    const price = parsePriceInputToNumber(priceValue);
    if (Number.isNaN(price) || price <= 0) {
      return null;
    }

    const costDigits = extractPriceDigits(costValue ?? "");
    const cost = costDigits ? parsePriceInputToNumber(costValue) : 0;
    if (Number.isNaN(cost)) {
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
        description={
          isEditing
            ? "Altere a empresa, valores e demais informações deste exame."
            : "Vincule a uma empresa ou cadastre o mesmo exame para todas de uma vez."
        }
      >
        <SelectLabel
          control={control}
          name="companyId"
          label="Empresa"
          options={companyOptions}
          placeholder={
            companies.length === 0
              ? "Nenhuma empresa cadastrada"
              : "Selecione a empresa"
          }
          disabled={companies.length === 0 || isSubmitting}
        />

        {isAllCompaniesSelected && (
          <p className="rounded-md border border-border/80 bg-muted/20 px-3.5 py-2.5 text-xs text-muted-foreground">
            {isEditing
              ? "As alterações serão aplicadas a todos os exames com o mesmo nome em"
              : "O exame será cadastrado com os mesmos dados para"}{" "}
            <span className="font-medium text-foreground">
              {companies.length} empresas
            </span>
            .
          </p>
        )}

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
            placeholder="0,00 (opcional)"
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

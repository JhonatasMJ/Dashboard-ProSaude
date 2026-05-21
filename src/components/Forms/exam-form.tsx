import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo, type ReactNode } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { CurrencyInputLabel } from "@/components/currency-input-label";
import { InputLabel } from "@/components/input-label";
import { SelectLabel } from "@/components/select-label";
import { Button } from "@/components/ui/button";
import { examSchema } from "@/schemas/exam.schema";
import { examToFormValues } from "@/shared/helpers/exam-form.helper";
import type { ICompany } from "@/shared/interfaces/https/company";
import type { IExam } from "@/shared/interfaces/https/exam";
import type { ExamFormData } from "@/types/exam-form.types";
import { cn } from "@/lib/utils";

interface ExamFormProps {
  defaultValues?: IExam;
  companies: ICompany[];
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

  const companyOptions = useMemo(
    () =>
      companies.map((company) => ({
        value: company.id,
        label: company.name,
      })),
    [companies]
  );

  const { control, handleSubmit } = useForm<ExamFormData>({
    resolver: yupResolver(examSchema) as Resolver<ExamFormData>,
    defaultValues: defaultValues ? examToFormValues(defaultValues) : emptyValues,
  });

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
            ? "A empresa não pode ser alterada após o cadastro."
            : "Vincule o exame a uma empresa e informe nome e preço."
        }
      >
        {isEditing ? (
          <div className="flex flex-col gap-2.5">
            <p className="text-sm font-medium text-foreground">Empresa</p>
            <p className="h-11 rounded-md border border-input bg-muted/30 px-3.5 py-2.5 text-sm text-foreground">
              {defaultValues.company.name}
            </p>
          </div>
        ) : (
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
            disabled={companies.length === 0}
          />
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
          label="Preço"
          placeholder="0,00"
          disabled={isSubmitting}
        />

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

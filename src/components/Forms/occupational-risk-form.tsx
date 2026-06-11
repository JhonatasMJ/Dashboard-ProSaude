import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo, type ReactNode } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { InputLabel } from "@/components/input-label";
import { SelectLabel } from "@/components/select-label";
import { Button } from "@/components/ui/button";
import { occupationalRiskSchema } from "@/schemas/occupational-risk.schema";
import { occupationalRiskToFormValues } from "@/shared/helpers/occupational-risk-form.helper";
import type { IOccupationalRisk } from "@/shared/interfaces/https/occupational-risk";
import {
  OCCUPATIONAL_RISK_CATEGORY_LABELS,
  type OccupationalRiskCategory,
} from "@/shared/types/occupational-risk-category.types";
import type { OccupationalRiskFormData } from "@/types/occupational-risk-form.types";
import { cn } from "@/lib/utils";

interface OccupationalRiskFormProps {
  defaultValues?: IOccupationalRisk;
  isSubmitting?: boolean;
  submitLabel: string;
  formId?: string;
  variant?: "default" | "sheet";
  onSubmit: (data: OccupationalRiskFormData) => Promise<void>;
  onCancel?: () => void;
}

const emptyValues: OccupationalRiskFormData = {
  category: "FISICOS",
  description: "",
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

export function OccupationalRiskForm({
  defaultValues,
  isSubmitting = false,
  submitLabel,
  formId = "occupational-risk-form",
  variant = "default",
  onSubmit,
  onCancel,
}: OccupationalRiskFormProps) {
  const isSheet = variant === "sheet";

  const categoryOptions = useMemo(
    () =>
      (
        Object.entries(OCCUPATIONAL_RISK_CATEGORY_LABELS) as [
          OccupationalRiskCategory,
          string,
        ][]
      ).map(([value, label]) => ({ value, label })),
    []
  );

  const { control, handleSubmit } = useForm<OccupationalRiskFormData>({
    resolver: yupResolver(occupationalRiskSchema) as Resolver<OccupationalRiskFormData>,
    defaultValues: defaultValues
      ? occupationalRiskToFormValues(defaultValues)
      : emptyValues,
  });

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className={cn(isSheet ? "space-y-8" : "flex flex-col gap-4")}
      noValidate
    >
      <FormSection
        title="Risco ocupacional"
        description="Informe a categoria e a descrição do risco."
      >
        <SelectLabel
          control={control}
          name="category"
          label="Categoria"
          options={categoryOptions}
          placeholder="Selecione a categoria"
          searchable={false}
          disabled={isSubmitting}
        />

        <InputLabel
          control={control}
          name="description"
          label="Descrição"
          placeholder="Ex.: Ruído contínuo acima de 85 dB..."
          disabled={isSubmitting}
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

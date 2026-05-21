import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo, type ReactNode } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { InputLabel } from "@/components/input-label";
import { MaskedInputLabel } from "@/components/masked-input-label";
import { SelectLabel } from "@/components/select-label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { employeeSchema } from "@/schemas/employee.schema";
import { employeeToFormValues } from "@/shared/helpers/employee-form.helper";
import { formatAgeFromBirthDate } from "@/shared/helpers/date.helper";
import { birthDateMask, cpfMask } from "@/shared/helpers/input-masks.helper";
import type { ICompany } from "@/shared/interfaces/https/company";
import type { IEmployee } from "@/shared/interfaces/https/employee";
import type { EmployeeFormData } from "@/types/employee-form.types";
import { cn } from "@/lib/utils";

interface EmployeeFormProps {
  defaultValues?: IEmployee;
  companies: ICompany[];
  isSubmitting?: boolean;
  submitLabel: string;
  formId?: string;
  variant?: "default" | "sheet";
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel?: () => void;
}

const emptyValues: EmployeeFormData = {
  companyId: "",
  name: "",
  documentNumber: "",
  jobTitle: "",
  birthDate: "",
  active: true,
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

export function EmployeeForm({
  defaultValues,
  companies,
  isSubmitting = false,
  submitLabel,
  formId = "employee-form",
  variant = "default",
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
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

  const { control, handleSubmit, watch } = useForm<EmployeeFormData>({
    resolver: yupResolver(employeeSchema) as Resolver<EmployeeFormData>,
    defaultValues: defaultValues
      ? employeeToFormValues(defaultValues)
      : emptyValues,
  });

  const birthDateValue = watch("birthDate");
  const ageLabel = formatAgeFromBirthDate(birthDateValue);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className={cn(isSheet ? "space-y-8" : "flex flex-col gap-4")}
      noValidate
    >
      <FormSection
        title="Dados do funcionário"
        description={
          isEditing
            ? "A empresa não pode ser alterada após o cadastro."
            : "Vincule o funcionário a uma empresa."
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
            disabled={companies.length === 0 || isSubmitting}
          />
        )}

        <InputLabel
          control={control}
          name="name"
          label="Nome completo"
          placeholder="Nome do funcionário"
        />

        <MaskedInputLabel
          control={control}
          name="documentNumber"
          label="CPF"
          maskOptions={cpfMask}
          placeholder="000.000.000-00"
        />

        <InputLabel
          control={control}
          name="jobTitle"
          label="Cargo"
          placeholder="Ex.: Analista administrativo"
        />

        <div className="space-y-1">
          <MaskedInputLabel
            control={control}
            name="birthDate"
            label="Data de nascimento *"
            maskOptions={birthDateMask}
            placeholder="DD/MM/AAAA"
          />
          {ageLabel && (
            <p className="text-xs text-muted-foreground">
              Idade:{" "}
              <span className="font-medium text-foreground">{ageLabel}</span>
            </p>
          )}
        </div>

        <Controller
          name="active"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-2.5">
              <Checkbox
                id={`${formId}-active`}
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                disabled={isSubmitting}
              />
              <Label
                htmlFor={`${formId}-active`}
                className="cursor-pointer text-sm font-normal text-foreground"
              >
                Funcionário ativo
              </Label>
            </div>
          )}
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

import { yupResolver } from "@hookform/resolvers/yup";
import type { ReactNode } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { InputLabel } from "@/components/input-label";
import { MaskedInputLabel } from "@/components/masked-input-label";
import { Button } from "@/components/ui/button";
import { companySchema } from "@/schemas/company.schema";
import { cnpjMask, phoneMask } from "@/shared/helpers/input-masks.helper";
import type { CompanyFormData } from "@/types/company-form.types";
import type { ICompany } from "@/shared/interfaces/https/company";
import { cn } from "@/lib/utils";

interface CompanyFormProps {
  defaultValues?: ICompany;
  isSubmitting?: boolean;
  submitLabel: string;
  formId?: string;
  variant?: "default" | "sheet";
  onSubmit: (data: CompanyFormData) => Promise<void>;
  onCancel?: () => void;
}

const emptyValues: CompanyFormData = {
  legalName: "",
  tradeName: "",
  taxId: "",
  email: "",
  phone: "",
  address: "",
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

export function CompanyForm({
  defaultValues,
  isSubmitting = false,
  submitLabel,
  formId = "company-form",
  variant = "default",
  onSubmit,
  onCancel,
}: CompanyFormProps) {
  const isSheet = variant === "sheet";

  const { control, handleSubmit } = useForm<CompanyFormData>({
    resolver: yupResolver(companySchema) as Resolver<CompanyFormData>,
    defaultValues: defaultValues
      ? {
          legalName: defaultValues.legalName,
          tradeName: defaultValues.tradeName,
          taxId: defaultValues.taxId,
          email: defaultValues.email,
          phone: defaultValues.phone,
          address: defaultValues.address,
        }
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
        title="Identificação"
        description="Dados cadastrais da empresa."
      >
        <InputLabel
          control={control}
          name="legalName"
          label="Razão social"
          placeholder="Razão social da empresa"
        />
        <InputLabel
          control={control}
          name="tradeName"
          label="Nome fantasia"
          placeholder="Nome fantasia"
        />
        <MaskedInputLabel
          control={control}
          name="taxId"
          label="CNPJ"
          maskOptions={cnpjMask}
          placeholder="00.000.000/0000-00"
        />
      </FormSection>

      <FormSection
        title="Contato"
        description="Informações para comunicação com a empresa."
      >
        <InputLabel
          control={control}
          name="email"
          label="E-mail"
          type="email"
          placeholder="contato@empresa.com"
        />
        <MaskedInputLabel
          control={control}
          name="phone"
          label="Telefone"
          maskOptions={phoneMask}
          placeholder="(00) 00000-0000"
        />
      </FormSection>

      <FormSection title="Endereço">
        <InputLabel
          control={control}
          name="address"
          label="Endereço completo"
          placeholder="Rua, número, bairro, cidade — UF"
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

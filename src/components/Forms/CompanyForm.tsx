import { yupResolver } from "@hookform/resolvers/yup";
import { Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { InputLabel } from "@/components/InputLabel";
import { MaskedInputLabel } from "@/components/MaskedInputLabel";
import { Button } from "@/components/ui/Button";
import {
  companySchema,
  companyToFormValues,
  type CompanyFormData,
} from "@/schemas/company.schema";
import { cpfCnpjMask, phoneMask, zipCodeMask } from "@/shared/helpers/input-masks.helper";
import { viacepService } from "@/shared/services/viacep.service";
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
  name: "",
  taxId: "",
  email: "",
  phone: "",
  zipCode: "",
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
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
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const { control, handleSubmit, setValue, watch } = useForm<CompanyFormData>({
    resolver: yupResolver(companySchema) as Resolver<CompanyFormData>,
    defaultValues: defaultValues
      ? companyToFormValues(defaultValues)
      : emptyValues,
  });

  const zipCode = watch("zipCode");

  const handleFetchAddress = async () => {
    const digits = zipCode?.replace(/\D/g, "") ?? "";

    if (digits.length !== 8) {
      toast.error("Informe um CEP válido com 8 dígitos.");
      return;
    }

    setIsFetchingCep(true);

    try {
      const address = await viacepService.getAddressByCep(digits);

      if (!address) {
        toast.error("CEP não encontrado.");
        return;
      }

      setValue("street", address.street, { shouldValidate: true });
      setValue("neighborhood", address.neighborhood, {
        shouldValidate: true,
      });
      setValue("city", address.city, { shouldValidate: true });
      setValue("state", address.state, { shouldValidate: true });
      toast.success("Endereço preenchido pelo CEP.");
    } catch {
      toast.error("Não foi possível buscar o CEP. Tente novamente.");
    } finally {
      setIsFetchingCep(false);
    }
  };

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
          name="name"
          label="Nome da empresa"
          placeholder="Nome da empresa"
        />
        <MaskedInputLabel
          control={control}
          name="taxId"
          label="CPF ou CNPJ"
          maskOptions={cpfCnpjMask}
          placeholder="000.000.000-00 ou 00.000.000/0000-00"
        />
      </FormSection>

      <FormSection
        title="Contato"
        description="Opcional — preencha se desejar."
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

      <FormSection
        title="Endereço"
        description="Opcional — informe o CEP para preencher rua, bairro, cidade e UF automaticamente."
      >
        <MaskedInputLabel
          control={control}
          name="zipCode"
          label="CEP"
          maskOptions={zipCodeMask}
          placeholder="00000-000"
          onBlur={() => {
            const digits = zipCode?.replace(/\D/g, "") ?? "";
            if (digits.length === 8) {
              void handleFetchAddress();
            }
          }}
        />
        <Button
            type="button"
            variant="secondary"
            className="w-full rounded-md py-5"
            disabled={isFetchingCep || isSubmitting}
            onClick={handleFetchAddress}
          >
            {isFetchingCep ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Buscando CEP...
              </>
            ) : (
              "Buscar endereço pelo CEP"
            )}
          </Button>

        <div className="grid gap-4 sm:grid-cols-3">
          <InputLabel
            control={control}
            name="street"
            label="Rua"
            placeholder="Rua, avenida..."
            containerClassName="sm:col-span-2"
          />
          <InputLabel
            control={control}
            name="number"
            label="Número"
            placeholder="123"
          />
        </div>

        <InputLabel
          control={control}
          name="neighborhood"
          label="Bairro"
          placeholder="Bairro"
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <InputLabel
            control={control}
            name="city"
            label="Cidade"
            placeholder="Cidade"
            containerClassName="sm:col-span-2"
          />
          <InputLabel
            control={control}
            name="state"
            label="UF"
            placeholder="SP"
            maxLength={2}
          />
        </div>
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

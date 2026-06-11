import { toast } from "sonner";
import { CompanyForm } from "@/components/Forms/company-form";
import { FormSheet } from "@/components/form-sheet";
import { useCompanies } from "@/contexts/companies.context";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import type { ICompany } from "@/shared/interfaces/https/company";
import type { CompanyFormData } from "@/types/company-form.types";

const COMPANY_FORM_ID = "company-form";

interface CompanyFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: ICompany | null;
}

export function CompanyFormSheet({
  open,
  onOpenChange,
  company,
}: CompanyFormSheetProps) {
  const { createCompany, updateCompany, isSubmitting } = useCompanies();
  const isEditing = !!company;

  const handleSubmit = async (data: CompanyFormData) => {
    try {
      if (isEditing && company) {
        await updateCompany(company.id, data);
        toast.success("Empresa atualizada com sucesso.");
      } else {
        await createCompany(data);
        toast.success("Empresa cadastrada com sucesso.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEditing
            ? "Não foi possível atualizar a empresa."
            : "Não foi possível cadastrar a empresa."
        )
      );
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar empresa" : "Nova empresa"}
      description={
        isEditing
          ? "Atualize os dados da empresa selecionada."
          : "Preencha os campos para cadastrar uma nova empresa no sistema."
      }
      formId={COMPANY_FORM_ID}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? "Salvar alterações" : "Cadastrar empresa"}
    >
      <CompanyForm
        key={company?.id ?? "new"}
        formId={COMPANY_FORM_ID}
        variant="sheet"
        defaultValues={company ?? undefined}
        isSubmitting={isSubmitting}
        submitLabel={isEditing ? "Salvar alterações" : "Cadastrar empresa"}
        onSubmit={handleSubmit}
      />
    </FormSheet>
  );
}

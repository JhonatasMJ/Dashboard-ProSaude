import { toast } from "sonner";
import { CompanyForm } from "@/components/Forms/company-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCompanies } from "@/contexts/companies-context";
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex h-full w-full max-w-[min(100vw,560px)] flex-col gap-0 rounded-none border-l bg-background p-0 shadow-xl sm:max-w-[560px]"
      >
        <SheetHeader className="shrink-0 space-y-1.5 border-b border-border px-6 py-5 text-left">
          <SheetTitle className="text-xl font-semibold tracking-tight">
            {isEditing ? "Editar empresa" : "Nova empresa"}
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">
            {isEditing
              ? "Atualize os dados da empresa selecionada."
              : "Preencha os campos para cadastrar uma nova empresa no sistema."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <CompanyForm
            key={company?.id ?? "new"}
            formId={COMPANY_FORM_ID}
            variant="sheet"
            defaultValues={company ?? undefined}
            isSubmitting={isSubmitting}
            submitLabel={isEditing ? "Salvar alterações" : "Cadastrar empresa"}
            onSubmit={handleSubmit}
          />
        </div>

        <SheetFooter className="shrink-0 gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button
            type="submit"
            form={COMPANY_FORM_ID}
            className="h-11 w-full rounded-md"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Cadastrar empresa"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-11 w-full rounded-md"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

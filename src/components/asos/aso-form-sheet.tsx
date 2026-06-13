import { toast } from "sonner";
import { AsoForm } from "@/components/Forms/aso-form";
import { FormSheet } from "@/components/form-sheet";
import { useAsos } from "@/contexts/asos.context";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import type { IAso } from "@/shared/interfaces/https/aso";
import type { AsoFormData } from "@/types/aso-form.types";

const ASO_FORM_ID = "aso-form";

interface AsoFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aso?: IAso | null;
}

export function AsoFormSheet({ open, onOpenChange, aso }: AsoFormSheetProps) {
  const {
    createAso,
    updateAso,
    isSubmitting,
    employees,
    occupationalRisks,
  } = useAsos();
  const isEditing = !!aso;

  const handleSubmit = async (data: AsoFormData) => {
    try {
      if (isEditing && aso) {
        await updateAso(aso.id, data);
        toast.success("ASO atualizado com sucesso.");
      } else {
        await createAso(data);
        toast.success("ASO emitido com sucesso.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEditing
            ? "Não foi possível atualizar o ASO."
            : "Não foi possível emitir o ASO."
        )
      );
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar ASO" : "Emitir ASO"}
      description={
        isEditing
          ? "Atualize os dados do atestado de saúde ocupacional selecionado."
          : "Preencha os campos para emitir um novo atestado de saúde ocupacional."
      }
      formId={ASO_FORM_ID}
      isSubmitting={isSubmitting}
      isSubmitDisabled={employees.length === 0}
      submitLabel={isEditing ? "Salvar alterações" : "Emitir ASO"}
    >
      <AsoForm
        key={aso?.id ?? "new"}
        formId={ASO_FORM_ID}
        variant="sheet"
        defaultValues={aso ?? undefined}
        employees={employees}
        occupationalRisks={occupationalRisks}
        isSubmitting={isSubmitting}
        submitLabel={isEditing ? "Salvar alterações" : "Emitir ASO"}
        onSubmit={handleSubmit}
      />
    </FormSheet>
  );
}

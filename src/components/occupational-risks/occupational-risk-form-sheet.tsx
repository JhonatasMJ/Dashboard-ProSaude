import { toast } from "sonner";
import { OccupationalRiskForm } from "@/components/Forms/occupational-risk-form";
import { FormSheet } from "@/components/form-sheet";
import { useOccupationalRisks } from "@/contexts/occupational-risks.context";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import type { IOccupationalRisk } from "@/shared/interfaces/https/occupational-risk";
import type { OccupationalRiskFormData } from "@/types/occupational-risk-form.types";

const OCCUPATIONAL_RISK_FORM_ID = "occupational-risk-form";

interface OccupationalRiskFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk?: IOccupationalRisk | null;
}

export function OccupationalRiskFormSheet({
  open,
  onOpenChange,
  risk,
}: OccupationalRiskFormSheetProps) {
  const { createRisk, updateRisk, isSubmitting } = useOccupationalRisks();
  const isEditing = !!risk;

  const handleSubmit = async (data: OccupationalRiskFormData) => {
    try {
      if (isEditing && risk) {
        await updateRisk(risk.id, data);
        toast.success("Risco ocupacional atualizado com sucesso.");
      } else {
        await createRisk(data);
        toast.success("Risco ocupacional cadastrado com sucesso.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEditing
            ? "Não foi possível atualizar o risco ocupacional."
            : "Não foi possível cadastrar o risco ocupacional."
        )
      );
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar risco ocupacional" : "Novo risco ocupacional"}
      description={
        isEditing
          ? "Atualize a categoria e a descrição do risco selecionado."
          : "Preencha os campos para cadastrar um novo risco ocupacional."
      }
      formId={OCCUPATIONAL_RISK_FORM_ID}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? "Salvar alterações" : "Cadastrar risco"}
    >
      <OccupationalRiskForm
        key={risk?.id ?? "new"}
        formId={OCCUPATIONAL_RISK_FORM_ID}
        variant="sheet"
        defaultValues={risk ?? undefined}
        isSubmitting={isSubmitting}
        submitLabel={isEditing ? "Salvar alterações" : "Cadastrar risco"}
        onSubmit={handleSubmit}
      />
    </FormSheet>
  );
}

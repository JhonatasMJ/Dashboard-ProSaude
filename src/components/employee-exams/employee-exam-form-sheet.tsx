import { toast } from "sonner";
import { EmployeeExamForm } from "@/components/Forms/employee-exam-form";
import { FormSheet } from "@/components/form-sheet";
import { useEmployeeExams } from "@/contexts/employee-exams.context";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import type { IEmployeeExam } from "@/shared/interfaces/https/employee-exam";
import type { EmployeeExamFormData } from "@/types/employee-exam-form.types";

const EMPLOYEE_EXAM_FORM_ID = "employee-exam-form";

interface EmployeeExamFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link?: IEmployeeExam | null;
}

export function EmployeeExamFormSheet({
  open,
  onOpenChange,
  link,
}: EmployeeExamFormSheetProps) {
  const { createLink, updateLink, isSubmitting, employees } = useEmployeeExams();
  const isEditing = !!link;

  const handleSubmit = async (data: EmployeeExamFormData) => {
    try {
      if (isEditing && link) {
        await updateLink(link.id, data);
        toast.success("Vínculo atualizado com sucesso.");
      } else {
        await createLink(data);
        const count = data.examIds.length;
        toast.success(
          count === 1
            ? "Vínculo cadastrado com sucesso."
            : `${count} vínculos cadastrados com sucesso.`
        );
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEditing
            ? "Não foi possível atualizar o vínculo."
            : "Não foi possível cadastrar o vínculo."
        )
      );
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar vínculo" : "Novo vínculo"}
      description={
        isEditing
          ? "Atualize funcionário, exame, profissional e data/hora."
          : "Vincule um funcionário a um ou mais exames do catálogo na mesma data e hora."
      }
      formId={EMPLOYEE_EXAM_FORM_ID}
      isSubmitting={isSubmitting}
      isSubmitDisabled={employees.length === 0}
      submitLabel={
        isEditing ? "Salvar alterações" : "Cadastrar vínculo(s)"
      }
    >
      <EmployeeExamForm
        key={link?.id ?? "new"}
        formId={EMPLOYEE_EXAM_FORM_ID}
        variant="sheet"
        defaultValues={link ?? undefined}
        employees={employees}
        isSubmitting={isSubmitting}
        submitLabel={isEditing ? "Salvar alterações" : "Cadastrar vínculo"}
        onSubmit={handleSubmit}
      />
    </FormSheet>
  );
}

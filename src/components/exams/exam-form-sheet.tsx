import { toast } from "sonner";
import { ExamForm } from "@/components/Forms/exam-form";
import { FormSheet } from "@/components/form-sheet";
import { useExams } from "@/contexts/exams.context";
import { isAllCompaniesExamSelection } from "@/shared/constants/exam.constants";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import type { IExam } from "@/shared/interfaces/https/exam";
import type { ExamFormData } from "@/types/exam-form.types";

const EXAM_FORM_ID = "exam-form";

interface ExamFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam?: IExam | null;
}

export function ExamFormSheet({ open, onOpenChange, exam }: ExamFormSheetProps) {
  const { createExam, updateExam, isSubmitting, companies } = useExams();
  const isEditing = !!exam;

  const handleSubmit = async (data: ExamFormData) => {
    try {
      if (isEditing && exam) {
        await updateExam(exam.id, data);
        const updatedCount = isAllCompaniesExamSelection(data.companyId)
          ? companies.length
          : 1;
        toast.success(
          updatedCount === 1
            ? "Exame atualizado com sucesso."
            : `Exame atualizado em ${updatedCount} empresas com sucesso.`
        );
      } else {
        await createExam(data);
        const count = isAllCompaniesExamSelection(data.companyId)
          ? companies.length
          : 1;
        toast.success(
          count === 1
            ? "Exame cadastrado com sucesso."
            : `Exame cadastrado em ${count} empresas com sucesso.`
        );
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEditing
            ? "Não foi possível atualizar o exame."
            : "Não foi possível cadastrar o exame."
        )
      );
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar exame" : "Novo exame"}
      description={
        isEditing
          ? "Atualize empresa, valores e demais informações do exame."
          : "Escolha uma empresa ou cadastre o mesmo exame para todas."
      }
      formId={EXAM_FORM_ID}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? "Salvar alterações" : "Cadastrar exame"}
    >
      <ExamForm
        key={exam?.id ?? "new"}
        formId={EXAM_FORM_ID}
        variant="sheet"
        defaultValues={exam ?? undefined}
        companies={companies}
        isSubmitting={isSubmitting}
        submitLabel={isEditing ? "Salvar alterações" : "Cadastrar exame"}
        onSubmit={handleSubmit}
      />
    </FormSheet>
  );
}

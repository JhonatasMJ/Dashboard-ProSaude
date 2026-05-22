import { toast } from "sonner";
import { ExamForm } from "@/components/Forms/exam-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useExams } from "@/contexts/exams-context";
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
  const { createExam, updateExam, isSubmitting } = useExams();
  const isEditing = !!exam;

  const handleSubmit = async (data: ExamFormData) => {
    try {
      if (isEditing && exam) {
        await updateExam(exam.id, data);
        toast.success("Exame atualizado com sucesso.");
      } else {
        await createExam(data);
        toast.success("Exame cadastrado com sucesso.");
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex h-full w-full max-w-[min(100vw,560px)] flex-col gap-0 rounded-none border-l bg-background p-0 shadow-xl sm:max-w-[560px]"
      >
        <SheetHeader className="shrink-0 space-y-1.5 border-b border-border px-6 py-5 text-left">
          <SheetTitle className="text-xl font-semibold tracking-tight">
            {isEditing ? "Editar exame" : "Novo exame"}
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">
            {isEditing
              ? "Atualize nome, preço, custo e observações do exame."
              : "Cadastre um exame no catálogo global."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <ExamForm
            key={exam?.id ?? "new"}
            formId={EXAM_FORM_ID}
            variant="sheet"
            defaultValues={exam ?? undefined}
            isSubmitting={isSubmitting}
            submitLabel={isEditing ? "Salvar alterações" : "Cadastrar exame"}
            onSubmit={handleSubmit}
          />
        </div>

        <SheetFooter className="shrink-0 gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button
            type="submit"
            form={EXAM_FORM_ID}
            className="h-11 w-full rounded-md"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Cadastrar exame"}
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

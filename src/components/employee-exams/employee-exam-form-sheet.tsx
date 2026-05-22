import { toast } from "sonner";
import { EmployeeExamForm } from "@/components/Forms/employee-exam-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEmployeeExams } from "@/contexts/employee-exams-context";
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
  const {
    createLink,
    updateLink,
    isSubmitting,
    employees,
    exams,
  } = useEmployeeExams();
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

  const canSubmit = employees.length > 0 && exams.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex h-full w-full max-w-[min(100vw,560px)] flex-col gap-0 rounded-none border-l bg-background p-0 shadow-xl sm:max-w-[560px]"
      >
        <SheetHeader className="shrink-0 space-y-1.5 border-b border-border px-6 py-5 text-left">
          <SheetTitle className="text-xl font-semibold tracking-tight">
            {isEditing ? "Editar vínculo" : "Novo vínculo"}
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">
            {isEditing
              ? "Atualize funcionário, exame, profissional e data/hora."
              : "Vincule um funcionário a um ou mais exames do catálogo na mesma data e hora."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <EmployeeExamForm
            key={link?.id ?? "new"}
            formId={EMPLOYEE_EXAM_FORM_ID}
            variant="sheet"
            defaultValues={link ?? undefined}
            employees={employees}
            exams={exams}
            isSubmitting={isSubmitting}
            submitLabel={isEditing ? "Salvar alterações" : "Cadastrar vínculo"}
            onSubmit={handleSubmit}
          />
        </div>

        <SheetFooter className="shrink-0 gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button
            type="submit"
            form={EMPLOYEE_EXAM_FORM_ID}
            className="h-11 w-full rounded-md"
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Cadastrar vínculo(s)"}
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

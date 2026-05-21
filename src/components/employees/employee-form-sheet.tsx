import { toast } from "sonner";
import { EmployeeForm } from "@/components/Forms/employee-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEmployees } from "@/hooks/use-employees";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import type { IEmployee } from "@/shared/interfaces/https/employee";
import type { EmployeeFormData } from "@/types/employee-form.types";

const EMPLOYEE_FORM_ID = "employee-form";

interface EmployeeFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: IEmployee | null;
}

export function EmployeeFormSheet({
  open,
  onOpenChange,
  employee,
}: EmployeeFormSheetProps) {
  const { createEmployee, updateEmployee, isSubmitting, companies } =
    useEmployees();
  const isEditing = !!employee;

  const handleSubmit = async (data: EmployeeFormData) => {
    try {
      if (isEditing && employee) {
        await updateEmployee(employee.id, data);
        toast.success("Funcionário atualizado com sucesso.");
      } else {
        await createEmployee(data);
        toast.success("Funcionário cadastrado com sucesso.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEditing
            ? "Não foi possível atualizar o funcionário."
            : "Não foi possível cadastrar o funcionário."
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
            {isEditing ? "Editar funcionário" : "Novo funcionário"}
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">
            {isEditing
              ? "Atualize os dados do funcionário."
              : "Cadastre um funcionário vinculado a uma empresa."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <EmployeeForm
            key={employee?.id ?? "new"}
            formId={EMPLOYEE_FORM_ID}
            variant="sheet"
            defaultValues={employee ?? undefined}
            companies={companies}
            isSubmitting={isSubmitting}
            submitLabel={
              isEditing ? "Salvar alterações" : "Cadastrar funcionário"
            }
            onSubmit={handleSubmit}
          />
        </div>

        <SheetFooter className="shrink-0 gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button
            type="submit"
            form={EMPLOYEE_FORM_ID}
            className="h-11 w-full rounded-md"
            disabled={isSubmitting || companies.length === 0}
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Cadastrar funcionário"}
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

import { toast } from "sonner";
import { EmployeeForm } from "@/components/Forms/employee-form";
import { FormSheet } from "@/components/form-sheet";
import { useEmployees } from "@/contexts/employees.context";
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
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar funcionário" : "Novo funcionário"}
      description={
        isEditing
          ? "Atualize os dados do funcionário."
          : "Cadastre um funcionário vinculado a uma empresa."
      }
      formId={EMPLOYEE_FORM_ID}
      isSubmitting={isSubmitting}
      isSubmitDisabled={companies.length === 0}
      submitLabel={isEditing ? "Salvar alterações" : "Cadastrar funcionário"}
    >
      <EmployeeForm
        key={employee?.id ?? "new"}
        formId={EMPLOYEE_FORM_ID}
        variant="sheet"
        defaultValues={employee ?? undefined}
        companies={companies}
        isSubmitting={isSubmitting}
        submitLabel={isEditing ? "Salvar alterações" : "Cadastrar funcionário"}
        onSubmit={handleSubmit}
      />
    </FormSheet>
  );
}

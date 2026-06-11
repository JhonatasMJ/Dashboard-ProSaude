import { useState } from "react";
import { toast } from "sonner";
import { UserForm } from "@/components/Forms/user-form";
import { FormSheet } from "@/components/form-sheet";
import { useUsers } from "@/contexts/users.context";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import type { UserRegisterFormData } from "@/types/user-register-form.types";

const USER_FORM_ID = "user-form";

interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserFormSheet({ open, onOpenChange }: UserFormSheetProps) {
  const { createUser, isSubmitting } = useUsers();
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (data: UserRegisterFormData) => {
    try {
      await createUser(data);
      toast.success("Usuário cadastrado com sucesso.");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Não foi possível cadastrar o usuário. Verifique os dados e tente novamente."
        )
      );
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Novo usuário"
      description="Cadastre uma pessoa autorizada a acessar o dashboard com e-mail e senha."
      formId={USER_FORM_ID}
      isSubmitting={isSubmitting}
      submitLabel="Cadastrar usuário"
      onBeforeOpen={() => setFormKey((current) => current + 1)}
    >
      <UserForm
        key={formKey}
        formId={USER_FORM_ID}
        variant="sheet"
        isSubmitting={isSubmitting}
        submitLabel="Cadastrar usuário"
        onSubmit={handleSubmit}
      />
    </FormSheet>
  );
}

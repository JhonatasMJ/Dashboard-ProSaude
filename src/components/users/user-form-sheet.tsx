import { useState } from "react";
import { toast } from "sonner";
import { UserForm } from "@/components/Forms/user-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setFormKey((current) => current + 1);
    }
    onOpenChange(nextOpen);
  };

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
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex h-full w-full max-w-[min(100vw,560px)] flex-col gap-0 rounded-none border-l bg-background p-0 shadow-xl sm:max-w-[560px]"
      >
        <SheetHeader className="shrink-0 space-y-1.5 border-b border-border px-6 py-5 text-left">
          <SheetTitle className="text-xl font-semibold tracking-tight">
            Novo usuário
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">
            Cadastre uma pessoa autorizada a acessar o dashboard com e-mail e
            senha.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <UserForm
            key={formKey}
            formId={USER_FORM_ID}
            variant="sheet"
            isSubmitting={isSubmitting}
            submitLabel="Cadastrar usuário"
            onSubmit={handleSubmit}
          />
        </div>

        <SheetFooter className="shrink-0 gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button
            type="submit"
            form={USER_FORM_ID}
            className="h-11 w-full rounded-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Cadastrar usuário"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-11 w-full rounded-md"
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

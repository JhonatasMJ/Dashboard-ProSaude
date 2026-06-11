import { toast } from "sonner";
import { AccountForm } from "@/components/Forms/account-form";
import { FormSheet } from "@/components/form-sheet";
import { useAccounts } from "@/contexts/accounts.context";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import type { IAccount } from "@/shared/interfaces/https/account";
import type { AccountFormData } from "@/types/account-form.types";

const ACCOUNT_FORM_ID = "account-form";

interface AccountFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: IAccount | null;
}

export function AccountFormSheet({
  open,
  onOpenChange,
  account,
}: AccountFormSheetProps) {
  const { createAccount, updateAccount, isSubmitting } = useAccounts();
  const isEditing = !!account;

  const handleSubmit = async (data: AccountFormData) => {
    try {
      if (isEditing && account) {
        await updateAccount(account.id, data);
        toast.success("Conta atualizada com sucesso.");
      } else {
        await createAccount(data);
        toast.success("Conta cadastrada com sucesso.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEditing
            ? "Não foi possível atualizar a conta."
            : "Não foi possível cadastrar a conta."
        )
      );
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar conta" : "Nova conta"}
      description={
        isEditing
          ? "Atualize os dados da conta selecionada."
          : "Preencha os campos para cadastrar uma nova conta."
      }
      formId={ACCOUNT_FORM_ID}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? "Salvar alterações" : "Cadastrar conta"}
    >
      <AccountForm
        key={account?.id ?? "new"}
        formId={ACCOUNT_FORM_ID}
        variant="sheet"
        defaultValues={account ?? undefined}
        isSubmitting={isSubmitting}
        submitLabel={isEditing ? "Salvar alterações" : "Cadastrar conta"}
        onSubmit={handleSubmit}
      />
    </FormSheet>
  );
}

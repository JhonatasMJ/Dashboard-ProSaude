import { toast } from "sonner";
import { ContaForm } from "@/components/Forms/conta-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useContas } from "@/contexts/contas.context";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import type { IConta } from "@/shared/interfaces/https/conta";
import type { ContaFormData } from "@/types/conta-form.types";

const CONTA_FORM_ID = "conta-form";

interface ContaFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conta?: IConta | null;
}

export function ContaFormSheet({
  open,
  onOpenChange,
  conta,
}: ContaFormSheetProps) {
  const { createConta, updateConta, isSubmitting } = useContas();
  const isEditing = !!conta;

  const handleSubmit = async (data: ContaFormData) => {
    try {
      if (isEditing && conta) {
        await updateConta(conta.id, data);
        toast.success("Conta atualizada com sucesso.");
      } else {
        await createConta(data);
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex h-full w-full max-w-[min(100vw,560px)] flex-col gap-0 rounded-none border-l bg-background p-0 shadow-xl sm:max-w-[560px]"
      >
        <SheetHeader className="shrink-0 space-y-1.5 border-b border-border px-6 py-5 text-left">
          <SheetTitle className="text-xl font-semibold tracking-tight">
            {isEditing ? "Editar conta" : "Nova conta"}
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">
            {isEditing
              ? "Atualize os dados da conta selecionada."
              : "Preencha os campos para cadastrar uma nova conta."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <ContaForm
            key={conta?.id ?? "new"}
            formId={CONTA_FORM_ID}
            variant="sheet"
            defaultValues={conta ?? undefined}
            isSubmitting={isSubmitting}
            submitLabel={isEditing ? "Salvar alterações" : "Cadastrar conta"}
            onSubmit={handleSubmit}
          />
        </div>

        <SheetFooter className="shrink-0 gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button
            type="submit"
            form={CONTA_FORM_ID}
            className="h-11 w-full rounded-md"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Cadastrar conta"}
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

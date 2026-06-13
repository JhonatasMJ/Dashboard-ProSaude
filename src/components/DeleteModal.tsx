import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { Button } from "@/components/ui/Button";

interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function DeleteModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  isLoading = false,
  onConfirm,
}: DeleteModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="flex flex-col gap-0 overflow-hidden rounded-md p-0 sm:max-w-md">
        <AlertDialogHeader className="px-5 pt-5 pb-4 text-left">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex w-full gap-2 border-t border-border bg-muted/50 px-5 py-4">
          <AlertDialogCancel
            disabled={isLoading}
            className="h-9.5 min-w-0 flex-1 rounded-md"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            variant="destructive"
            className="h-9.5 min-w-0 flex-1 rounded-md"
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading ? "Excluindo..." : confirmLabel}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  confirmVariant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false,
  confirmVariant = "default",
  onConfirm,
}: ConfirmModalProps) {
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
          <AlertDialogAction
            variant={confirmVariant}
            className={cn("h-9.5 min-w-0 flex-1 rounded-md")}
            disabled={isLoading}
            onClick={() => void onConfirm()}
          >
            {isLoading ? "Aguarde..." : confirmLabel}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  formId: string;
  isSubmitting?: boolean;
  isSubmitDisabled?: boolean;
  submitLabel: string;
  savingLabel?: string;
  cancelLabel?: string;
  children: ReactNode;
  /** Executado ao abrir o sheet (ex.: reset do formulário). */
  onBeforeOpen?: () => void;
}

const SHEET_CONTENT_CLASS =
  "flex h-full w-full max-w-[min(100vw,560px)] flex-col gap-0 rounded-none border-l bg-background p-0 shadow-xl sm:max-w-[560px]";

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  formId,
  isSubmitting = false,
  isSubmitDisabled = false,
  submitLabel,
  savingLabel = "Salvando...",
  cancelLabel = "Cancelar",
  children,
  onBeforeOpen,
}: FormSheetProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && onBeforeOpen) {
      onBeforeOpen();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" showCloseButton className={SHEET_CONTENT_CLASS}>
        <SheetHeader className="shrink-0 space-y-1.5 border-b border-border px-6 py-5 text-left">
          <SheetTitle className="text-xl font-semibold tracking-tight">
            {title}
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">
            {description}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>

        <SheetFooter className="shrink-0 gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button
            type="submit"
            form={formId}
            className="h-11 w-full rounded-md"
            disabled={isSubmitting || isSubmitDisabled}
          >
            {isSubmitting ? savingLabel : submitLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-11 w-full rounded-md"
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
          >
            {cancelLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

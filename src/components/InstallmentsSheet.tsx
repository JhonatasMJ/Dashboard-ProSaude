import { useState } from "react";
import { DatePickerLabel } from "@/components/DatePickerLabel";
import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { dateToDateOnly, formatDateBr } from "@/shared/helpers/date.helper";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";
import { cn } from "@/lib/utils";

export interface InstallmentSummary {
  id: string;
  number: number;
  amount: number;
  dueDate?: string | null;
  paidAt: string | null;
  status: string;
}

interface InstallmentsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  installments: InstallmentSummary[];
  isSubmitting?: boolean;
  statusLabel: (status: string) => string;
  statusClassName: (status: string) => string;
  onMarkPaid: (installmentId: string, paidAtDateOnly: string) => Promise<void>;
}

// Mesmo problema de especificidade do FormSheet: o Sheet base aplica
// `data-[side=right]:sm:max-w-sm`, cujo seletor com atributo vence uma
// classe simples — por isso o `!` é necessário aqui.
const SHEET_CONTENT_CLASS =
  "flex h-full w-full max-w-[min(100vw,480px)]! flex-col gap-0 rounded-none border-l bg-background p-0 shadow-xl sm:max-w-[480px]!";

export function InstallmentsSheet({
  open,
  onOpenChange,
  title,
  description,
  installments,
  isSubmitting = false,
  statusLabel,
  statusClassName,
  onMarkPaid,
}: InstallmentsSheetProps) {
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payDate, setPayDate] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPayingId(null);
      setPayDate("");
    }
    onOpenChange(nextOpen);
  };

  const handleStartPay = (installmentId: string) => {
    setPayingId(installmentId);
    setPayDate(dateToDateOnly(new Date()));
  };

  const handleConfirmPay = async (installmentId: string) => {
    if (!payDate) return;
    await onMarkPaid(installmentId, payDate);
    setPayingId(null);
    setPayDate("");
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" showCloseButton className={SHEET_CONTENT_CLASS}>
        <SheetHeader className="shrink-0 space-y-1.5 border-b border-border px-6 py-5 text-left">
          <SheetTitle className="text-xl font-semibold tracking-tight">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-sm leading-relaxed">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {installments.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma parcela cadastrada.
            </p>
          ) : (
            <div className="overflow-hidden rounded-md border border-border bg-white">
              <ul className="divide-y divide-border">
                {installments.map((installment, index) => {
                  const isPaid = installment.status === "PAID";
                  const isPaying = payingId === installment.id;

                  return (
                    <li
                      key={installment.id}
                      className={cn(
                        "flex flex-col gap-3 px-5 py-4",
                        index % 2 === 1 && "bg-muted/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            Parcela {installment.number}
                          </p>
                          {installment.dueDate && (
                            <p className="text-xs text-muted-foreground">
                              Vencimento: {formatDateBr(installment.dueDate)}
                            </p>
                          )}
                          {installment.paidAt && (
                            <p className="text-xs text-muted-foreground">
                              Pago em: {formatDateBr(installment.paidAt)}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 space-y-1.5 text-right">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                              statusClassName(installment.status)
                            )}
                          >
                            {statusLabel(installment.status)}
                          </span>
                          <p className="text-sm font-semibold text-foreground">
                            {formatCurrency(installment.amount)}
                          </p>
                        </div>
                      </div>

                      {!isPaid &&
                        (isPaying ? (
                          <div className="space-y-3 border-t border-border/60 pt-3">
                            <DatePickerLabel
                              id={`installment-pay-${installment.id}`}
                              label="Data de pagamento"
                              value={payDate}
                              onChange={setPayDate}
                              compact
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="h-9 flex-1 rounded-md"
                                disabled={isSubmitting}
                                onClick={() => setPayingId(null)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                className="h-9 flex-1 rounded-md"
                                disabled={isSubmitting || !payDate}
                                onClick={() => void handleConfirmPay(installment.id)}
                              >
                                Confirmar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-t border-border/60 pt-3">
                            <Button
                              type="button"
                              size="sm"
                              className="h-9 w-full rounded-md"
                              disabled={isSubmitting}
                              onClick={() => handleStartPay(installment.id)}
                            >
                              Marcar como paga
                            </Button>
                          </div>
                        ))}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

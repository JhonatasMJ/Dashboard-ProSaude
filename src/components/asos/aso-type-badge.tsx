import { ASO_TYPE_LABELS, type AsoType } from "@/shared/types/aso-type.types";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<AsoType, string> = {
  ADMISSIONAL: "bg-emerald-100 text-emerald-800",
  PERIODICO: "bg-sky-100 text-sky-800",
  RETORNO_AO_TRABALHO: "bg-amber-100 text-amber-900",
  MUDANCA_DE_RISCO: "bg-violet-100 text-violet-800",
  MONITORACAO_PONTUAL: "bg-orange-100 text-orange-800",
  DEMISSIONAL: "bg-red-100 text-red-800",
};

export function AsoTypeBadge({ type }: { type: AsoType }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
        TYPE_STYLES[type]
      )}
    >
      {ASO_TYPE_LABELS[type]}
    </span>
  );
}

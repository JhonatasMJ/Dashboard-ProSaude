import {
  OCCUPATIONAL_RISK_CATEGORY_LABELS,
  type OccupationalRiskCategory,
} from "@/shared/types/occupational-risk-category.types";
import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<OccupationalRiskCategory, string> = {
  FISICOS: "bg-sky-100 text-sky-800",
  QUIMICOS: "bg-violet-100 text-violet-800",
  BIOLOGICOS: "bg-lime-100 text-lime-900",
  ERGONOMICOS: "bg-orange-100 text-orange-800",
  ACIDENTES: "bg-red-100 text-red-800",
};

export function OccupationalRiskCategoryBadge({
  category,
}: {
  category: OccupationalRiskCategory;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
        CATEGORY_STYLES[category]
      )}
    >
      {OCCUPATIONAL_RISK_CATEGORY_LABELS[category]}
    </span>
  );
}

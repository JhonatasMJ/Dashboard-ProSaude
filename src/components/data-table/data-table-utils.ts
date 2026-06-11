import { cn } from "@/lib/utils";

export const DATA_TABLE_HEAD_CLASS =
  "h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase";

export const DATA_TABLE_CELL_CLASS = "px-5 py-4";

export const DATA_TABLE_COMPACT_CELL_CLASS = "px-3 py-2.5";

export const DATA_TABLE_HEADER_ROW_CLASS =
  "border-border/80 bg-muted/40 hover:bg-muted/40";

export function getDataTableRowClassName(rowIndex: number) {
  return cn(
    "border-border/60 transition-colors",
    rowIndex % 2 === 0
      ? "bg-background hover:bg-muted/40"
      : "bg-muted/30 hover:bg-muted/50"
  );
}

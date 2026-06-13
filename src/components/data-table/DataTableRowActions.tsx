import type { ReactElement, ReactNode } from "react";
import { ButtonAnimatedIcon } from "@/components/ButtonAnimatedIcon";
import { Button } from "@/components/ui/Button";
import { ClipboardCheckIcon } from "@/components/ui/ClipboardCheck";
import { DeleteIcon } from "@/components/ui/Delete";
import { FileTextIcon } from "@/components/ui/FileText";
import { SquarePenIcon } from "@/components/ui/SquarePen";
import { TableActionTooltip } from "@/components/data-table/TableActionTooltip";
import { useButtonAnimatedIcon } from "@/hooks/use-button-animated-icon";
import { cn } from "@/lib/utils";

interface DataTableRowActionsProps {
  editLabel: string;
  deleteLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  downloadLabel?: string;
  onDownload?: () => void;
  isDownloading?: boolean;
  fichaDownloadLabel?: string;
  onDownloadFicha?: () => void;
  showEdit?: boolean;
  showDelete?: boolean;
  showDownload?: boolean;
  showDownloadFicha?: boolean;
  size?: "default" | "compact";
  className?: string;
}

export function DataTableRowActions({
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
  downloadLabel,
  onDownload,
  isDownloading = false,
  fichaDownloadLabel = "Baixar ficha",
  onDownloadFicha,
  showEdit = true,
  showDelete = true,
  showDownload = false,
  showDownloadFicha = false,
  size = "default",
  className,
}: DataTableRowActionsProps) {
  const editIcon = useButtonAnimatedIcon();
  const deleteIcon = useButtonAnimatedIcon();
  const downloadIcon = useButtonAnimatedIcon();
  const fichaIcon = useButtonAnimatedIcon();
  const iconSize = size === "compact" ? 14 : 16;
  const buttonSize = size === "compact" ? "size-8" : "icon-lg";

  const wrap = (label: string, disabled: boolean | undefined, button: ReactNode) => (
    <TableActionTooltip label={label} disabled={disabled}>
      {button as ReactElement}
    </TableActionTooltip>
  );

  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      {showEdit &&
        wrap(
          "Editar",
          false,
          <Button
            variant="ghost"
            size={size === "compact" ? "icon" : "icon-lg"}
            className={cn(
              "rounded-md bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
              buttonSize
            )}
            aria-label={editLabel}
            onClick={onEdit}
            {...editIcon.rowHandlers}
          >
            <ButtonAnimatedIcon
              icon={SquarePenIcon}
              iconRef={editIcon.iconRef}
              size={iconSize}
              className="text-primary"
            />
          </Button>
        )}
      {showDownload &&
        onDownload &&
        wrap(
          "Baixar ASO",
          isDownloading,
          <Button
            variant="ghost"
            size={size === "compact" ? "icon" : "icon-lg"}
            className={cn(
              "rounded-md bg-secondary/10 text-secondary hover:bg-secondary/20 hover:text-secondary",
              buttonSize
            )}
            aria-label={downloadLabel ?? "Baixar ASO"}
            onClick={onDownload}
            disabled={isDownloading}
            {...downloadIcon.rowHandlers}
          >
            <ButtonAnimatedIcon
              icon={FileTextIcon}
              iconRef={downloadIcon.iconRef}
              size={iconSize}
              className="text-secondary"
            />
          </Button>
        )}
      {showDownloadFicha &&
        onDownloadFicha &&
        wrap(
          fichaDownloadLabel,
          false,
          <Button
            variant="ghost"
            size={size === "compact" ? "icon" : "icon-lg"}
            className={cn(
              "rounded-md bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 hover:text-emerald-800",
              buttonSize
            )}
            aria-label={fichaDownloadLabel}
            onClick={onDownloadFicha}
            {...fichaIcon.rowHandlers}
          >
            <ButtonAnimatedIcon
              icon={ClipboardCheckIcon}
              iconRef={fichaIcon.iconRef}
              size={iconSize}
              className="text-emerald-700"
            />
          </Button>
        )}
      {showDelete &&
        wrap(
          "Excluir",
          false,
          <Button
            variant="ghost"
            size={size === "compact" ? "icon" : "icon-lg"}
            className={cn(
              "rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive",
              buttonSize
            )}
            aria-label={deleteLabel}
            onClick={onDelete}
            {...deleteIcon.rowHandlers}
          >
            <ButtonAnimatedIcon
              icon={DeleteIcon}
              iconRef={deleteIcon.iconRef}
              size={iconSize}
              className="text-destructive"
            />
          </Button>
        )}
    </div>
  );
}

import { ButtonAnimatedIcon } from "@/components/button-animated-icon";
import { Button } from "@/components/ui/button";
import { DeleteIcon } from "@/components/ui/delete";
import { SquarePenIcon } from "@/components/ui/square-pen";
import { useButtonAnimatedIcon } from "@/hooks/use-button-animated-icon";
import { cn } from "@/lib/utils";

interface DataTableRowActionsProps {
  editLabel: string;
  deleteLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  showEdit?: boolean;
  showDelete?: boolean;
  size?: "default" | "compact";
  className?: string;
}

export function DataTableRowActions({
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
  size = "default",
  className,
}: DataTableRowActionsProps) {
  const editIcon = useButtonAnimatedIcon();
  const deleteIcon = useButtonAnimatedIcon();
  const iconSize = size === "compact" ? 14 : 16;
  const buttonSize = size === "compact" ? "size-8" : "icon-lg";

  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      {showEdit && (
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
      {showDelete && (
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

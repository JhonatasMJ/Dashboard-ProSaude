import type { ReactElement } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

interface TableActionTooltipProps {
  label: string;
  disabled?: boolean;
  children: ReactElement;
}

export function TableActionTooltip({
  label,
  disabled,
  children,
}: TableActionTooltipProps) {
  const trigger = disabled ? (
    <span className="inline-flex cursor-not-allowed">{children}</span>
  ) : (
    children
  );

  return (
    <Tooltip>
      <TooltipTrigger render={trigger} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

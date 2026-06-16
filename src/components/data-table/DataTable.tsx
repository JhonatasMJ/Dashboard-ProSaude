import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTableSkeleton } from "@/components/data-table/DataTableSkeleton";

export interface DataTableEmptyState {
  title: string;
  description: ReactNode;
  action?: ReactNode;
}

export interface DataTableProps {
  title?: string;
  description?: ReactNode;
  headerActions?: ReactNode;
  filters?: ReactNode;
  warning?: ReactNode;
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  isEmpty: boolean;
  hasActiveFilters?: boolean;
  emptyState: DataTableEmptyState;
  filteredEmptyState?: DataTableEmptyState;
  skeleton?: ReactNode;
  skeletonColumns?: number;
  children: ReactNode;
  overlays?: ReactNode;
}

export function DataTable({
  title,
  description,
  headerActions,
  filters,
  warning,
  isLoading,
  error,
  onRetry,
  isEmpty,
  hasActiveFilters = false,
  emptyState,
  filteredEmptyState,
  skeleton,
  skeletonColumns,
  children,
  overlays,
}: DataTableProps) {
  const filteredState = filteredEmptyState ?? {
    title: "Nenhum resultado encontrado",
    description: "Ajuste os filtros e tente novamente.",
  };

  return (
    <>
      <Card className="gap-0 overflow-hidden rounded-sm border border-border bg-white py-0 shadow-sm ring-0">
        <div className="flex flex-col gap-4 border-b border-border bg-muted/20 px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-foreground">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            {headerActions ? (
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                {headerActions}
              </div>
            ) : null}
          </div>

          {filters}
          {warning}
        </div>

        {isLoading &&
          (skeleton ?? <DataTableSkeleton columns={skeletonColumns} />)}

        {!isLoading && error && (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <p className="text-sm text-destructive">{error}</p>
            {onRetry ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-md"
                onClick={onRetry}
              >
                Tentar novamente
              </Button>
            ) : null}
          </div>
        )}

        {isEmpty && !hasActiveFilters && !isLoading && !error && (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <div className="space-y-1">
              <p className="font-medium text-foreground">{emptyState.title}</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {emptyState.description}
              </p>
            </div>
            {emptyState.action}
          </div>
        )}

        {isEmpty && hasActiveFilters && !isLoading && !error && (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <p className="font-medium text-foreground">{filteredState.title}</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {filteredState.description}
            </p>
            {filteredState.action}
          </div>
        )}

        {!isLoading && !error && !isEmpty && children}
      </Card>

      {overlays}
    </>
  );
}

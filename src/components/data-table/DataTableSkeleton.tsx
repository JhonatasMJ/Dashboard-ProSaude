import { TABLE_PAGE_SIZE } from "@/shared/constants/app.constants";

interface DataTableSkeletonProps {
  rowCount?: number;
  columns?: number;
}

export function DataTableSkeleton({
  rowCount = TABLE_PAGE_SIZE,
  columns = 4,
}: DataTableSkeletonProps) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rowCount }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 px-5 py-4"
        >
          <div className="h-4 w-40 flex-1 rounded-md bg-muted" />
          {columns > 1 && (
            <div className="hidden h-4 w-24 rounded-md bg-muted md:block" />
          )}
          {columns > 2 && (
            <div className="hidden h-4 w-28 rounded-md bg-muted lg:block" />
          )}
          {columns > 3 && (
            <div className="hidden h-4 w-32 rounded-md bg-muted xl:block" />
          )}
          <div className="h-8 w-16 rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}

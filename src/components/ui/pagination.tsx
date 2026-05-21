import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";

function PaginationRoot({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="Paginação"
      className={cn("flex w-full justify-end", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("", className)} {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
  disabled?: boolean;
} & Pick<React.ComponentProps<"button">, "onClick" | "aria-label" | "children"> &
  React.ComponentProps<"button">;

function PaginationLink({
  className,
  isActive,
  disabled,
  children,
  ...props
}: PaginationLinkProps) {
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      disabled={disabled}
      className={cn(
        buttonVariants({
          variant: isActive ? "default" : "ghost",
          size: "icon",
        }),
        "size-9",
        isActive && "border-primary",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function PaginationPrevious({
  className,
  disabled,
  onClick,
  label = "Anterior",
}: {
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-label="Ir para página anterior"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        buttonVariants({ variant: "ghost", size: "default" }),
        "gap-1 px-2.5 sm:pl-2.5",
        className
      )}
    >
      <ChevronLeft className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function PaginationNext({
  className,
  disabled,
  onClick,
  label = "Próxima",
}: {
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-label="Ir para próxima página"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        buttonVariants({ variant: "ghost", size: "default" }),
        "gap-1 px-2.5 sm:pr-2.5",
        className
      )}
    >
      <span className="hidden sm:inline">{label}</span>
      <ChevronRight className="size-4" />
    </button>
  );
}

function PaginationEllipsis({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 items-center justify-center",
        className
      )}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">Mais páginas</span>
    </span>
  );
}

export {
  PaginationRoot,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};

// --- Paginação com dados (uso em listas/tabelas) ---

export type PaginationProps = {
  onPageChange: (page: number) => void;
  disabled?: boolean;
  hideWhenSinglePage?: boolean;
  className?: string;
  previousLabel?: string;
  nextLabel?: string;
} & (
  | { meta: IPaginationMeta }
  | {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    }
);

type PaginationDataProps =
  | { meta: IPaginationMeta }
  | {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };

function resolvePaginationProps(props: PaginationDataProps): IPaginationMeta {
  if ("meta" in props) {
    return props.meta;
  }

  return {
    page: props.page,
    pageSize: props.pageSize,
    total: props.total,
    totalPages: props.totalPages,
  };
}

function getVisiblePages(
  currentPage: number,
  totalPages: number
): (number | "ellipsis")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

export function Pagination({
  onPageChange,
  disabled = false,
  hideWhenSinglePage = true,
  className,
  previousLabel = "Anterior",
  nextLabel = "Próxima",
  ...props
}: PaginationProps) {
  const { page, pageSize, total, totalPages } = resolvePaginationProps(props);

  if (hideWhenSinglePage && totalPages <= 1) {
    return null;
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const visiblePages = getVisiblePages(page, totalPages);

  const goTo = (target: number) => {
    if (target >= 1 && target <= totalPages && target !== page && !disabled) {
      onPageChange(target);
    }
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        Exibindo{" "}
        <span className="font-medium text-foreground">
          {start}–{end}
        </span>{" "}
        de{" "}
        <span className="font-medium text-foreground">{total}</span>
      </p>

      <PaginationRoot className="w-auto shrink-0 self-end sm:self-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              disabled={disabled || page <= 1}
              onClick={() => goTo(page - 1)}
              label={previousLabel}
            />
          </PaginationItem>

          {visiblePages.map((item, index) =>
            item === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  isActive={item === page}
                  disabled={disabled}
                  onClick={() => goTo(item)}
                  aria-label={`Página ${item}`}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              disabled={disabled || page >= totalPages}
              onClick={() => goTo(page + 1)}
              label={nextLabel}
            />
          </PaginationItem>
        </PaginationContent>
      </PaginationRoot>
    </div>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageLayout({
  title,
  description,
  children,
  className,
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-8 p-8",
        className
      )}
    >
      <header className="space-y-1">
        <h1 className="flex items-center gap-1 text-3xl font-bold tracking-tight text-foreground">
          {title}
          <span className="text-primary">.</span>
        </h1>
        {description ? (
          <p className="max-w-xl text-muted-foreground">
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </div>
  );
}

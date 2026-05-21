import type { ComponentType } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const formatTotal = (value: number) =>
  value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

interface SummaryStatCardProps {
  title: string;
  description: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
}

export function SummaryStatCard({
  title,
  description,
  value,
  icon: Icon,
}: SummaryStatCardProps) {
  return (
    <Card
      className={cn(
        "gap-0 rounded-md border border-border bg-white py-0 shadow-none ring-0",
        "transition-shadow hover:shadow-sm"
      )}
    >
      <div className="flex flex-col gap-6 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="font-semibold leading-snug text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
        </div>
        <p className="text-3xl font-bold tracking-tight text-foreground">
          {formatTotal(value)}
        </p>
      </div>
    </Card>
  );
}

export function SummaryStatCardSkeleton() {
  return (
    <Card className="gap-0 rounded-md border border-border bg-white py-0 shadow-none ring-0">
      <div className="flex animate-pulse flex-col gap-6 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded-md bg-muted" />
            <div className="h-3 w-24 rounded-md bg-muted/70" />
          </div>
          <div className="size-10 rounded-md bg-muted" />
        </div>
        <div className="h-9 w-20 rounded-md bg-muted" />
      </div>
    </Card>
  );
}

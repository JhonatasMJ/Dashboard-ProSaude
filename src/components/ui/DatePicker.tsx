"use client";

import { ptBR } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { cn } from "@/lib/utils";
import {
  dateToDateOnly,
  formatBrDateInput,
  parseDateOnlyInput,
} from "@/shared/helpers/date.helper";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function DatePicker({
  value = "",
  onChange,
  placeholder = "Selecione a data",
  disabled = false,
  className,
  id,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseDateOnlyInput(value);

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onChange("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative w-full">
        <PopoverTrigger
          disabled={disabled}
          render={
            <Button
              type="button"
              variant="outline"
              id={id}
              disabled={disabled}
              className={cn(
                "h-11 w-full justify-start rounded-md px-3.5 font-normal shadow-none",
                !selected && "text-muted-foreground",
                value && !disabled && "pr-10",
                className
              )}
            />
          }
        >
          <CalendarIcon className="mr-2 size-4 shrink-0 opacity-60" />
          <span className="truncate">
            {selected ? formatBrDateInput(selected) : placeholder}
          </span>
        </PopoverTrigger>

        {value && !disabled && (
          <button
            type="button"
            aria-label="Limpar data"
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            onChange(date ? dateToDateOnly(date) : "");
            setOpen(false);
          }}
          locale={ptBR}
          defaultMonth={selected}
        />
      </PopoverContent>
    </Popover>
  );
}

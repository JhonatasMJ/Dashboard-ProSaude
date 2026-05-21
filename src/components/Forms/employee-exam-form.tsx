import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo, type ReactNode } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { InputLabel } from "@/components/input-label";
import { MaskedInputLabel } from "@/components/masked-input-label";
import { SelectLabel } from "@/components/select-label";
import { Button } from "@/components/ui/button";
import { employeeExamSchema } from "@/schemas/employee-exam.schema";
import { employeeExamToFormValues } from "@/shared/helpers/employee-exam-form.helper";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";
import { birthDateMask, examTimeMask } from "@/shared/helpers/input-masks.helper";
import type { IEmployee } from "@/shared/interfaces/https/employee";
import type { IEmployeeExam } from "@/shared/interfaces/https/employee-exam";
import type { IExam } from "@/shared/interfaces/https/exam";
import type { EmployeeExamFormData } from "@/types/employee-exam-form.types";
import { cn } from "@/lib/utils";

interface EmployeeExamFormProps {
  defaultValues?: IEmployeeExam;
  employees: IEmployee[];
  exams: IExam[];
  isSubmitting?: boolean;
  submitLabel: string;
  formId?: string;
  variant?: "default" | "sheet";
  onSubmit: (data: EmployeeExamFormData) => Promise<void>;
  onCancel?: () => void;
}

const emptyValues: EmployeeExamFormData = {
  employeeId: "",
  examId: "",
  professionalName: "",
  examDate: "",
  examTime: "",
};

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function EmployeeExamForm({
  defaultValues,
  employees,
  exams,
  isSubmitting = false,
  submitLabel,
  formId = "employee-exam-form",
  variant = "default",
  onSubmit,
  onCancel,
}: EmployeeExamFormProps) {
  const isSheet = variant === "sheet";

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee.id,
        label: `${employee.name} · ${employee.company.name}`,
      })),
    [employees]
  );

  const examOptions = useMemo(
    () =>
      exams.map((exam) => ({
        value: exam.id,
        label: exam.name,
      })),
    [exams]
  );

  const { control, handleSubmit, watch } = useForm<EmployeeExamFormData>({
    resolver: yupResolver(employeeExamSchema) as Resolver<EmployeeExamFormData>,
    defaultValues: defaultValues
      ? employeeExamToFormValues(defaultValues)
      : emptyValues,
  });

  const examId = watch("examId");
  const selectedExam = useMemo(
    () => exams.find((exam) => exam.id === examId),
    [exams, examId]
  );

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className={cn(isSheet ? "space-y-8" : "flex flex-col gap-4")}
      noValidate
    >
      <FormSection
        title="Vínculo funcionário × exame"
        description="Registre qual exame do catálogo foi realizado por qual funcionário."
      >
        <SelectLabel
          control={control}
          name="employeeId"
          label="Funcionário"
          options={employeeOptions}
          placeholder={
            employees.length === 0
              ? "Nenhum funcionário cadastrado"
              : "Selecione o funcionário"
          }
          disabled={employees.length === 0 || isSubmitting}
        />

        <SelectLabel
          control={control}
          name="examId"
          label="Exame (catálogo)"
          options={examOptions}
          placeholder={
            exams.length === 0
              ? "Nenhum exame no catálogo"
              : "Selecione o exame"
          }
          disabled={exams.length === 0 || isSubmitting}
        />

        {selectedExam && (
          <p className="rounded-md border border-border/80 bg-muted/20 px-3.5 py-2.5 text-xs text-muted-foreground">
            Preço:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(selectedExam.price)}
            </span>
            {" · "}
            Lucro:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(selectedExam.profit)}
            </span>
          </p>
        )}

        <InputLabel
          control={control}
          name="professionalName"
          label="Profissional responsável"
          placeholder="Nome do profissional"
        />

        <MaskedInputLabel
          control={control}
          name="examDate"
          label="Data do exame"
          maskOptions={birthDateMask}
          placeholder="DD/MM/AAAA"
        />

        <MaskedInputLabel
          control={control}
          name="examTime"
          label="Hora do exame"
          maskOptions={examTimeMask}
          placeholder="HH:mm"
        />
      </FormSection>

      {!isSheet && onCancel && (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-md"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" className="rounded-md" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}

import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { DatePickerLabel } from "@/components/date-picker-label";
import { InputLabel } from "@/components/input-label";
import { MaskedInputLabel } from "@/components/masked-input-label";
import { MultiSelectLabel } from "@/components/multi-select-label";
import { SelectLabel } from "@/components/select-label";
import { Button } from "@/components/ui/button";
import { employeeExamSchema } from "@/schemas/employee-exam.schema";
import { employeeExamToFormValues } from "@/shared/helpers/employee-exam-form.helper";
import { dateToDateOnly } from "@/shared/helpers/date.helper";
import { fetchAllPaginated } from "@/shared/helpers/fetch-all-paginated.helper";
import { birthDateMask, examTimeMask } from "@/shared/helpers/input-masks.helper";
import type { IEmployee } from "@/shared/interfaces/https/employee";
import type { IEmployeeExam } from "@/shared/interfaces/https/employee-exam";
import type { IExam } from "@/shared/interfaces/https/exam";
import { examService } from "@/shared/services/exam.service";
import type { EmployeeExamFormData } from "@/types/employee-exam-form.types";
import { cn } from "@/lib/utils";

interface EmployeeExamFormProps {
  defaultValues?: IEmployeeExam;
  employees: IEmployee[];
  isSubmitting?: boolean;
  submitLabel: string;
  formId?: string;
  variant?: "default" | "sheet";
  onSubmit: (data: EmployeeExamFormData) => Promise<void>;
  onCancel?: () => void;
}

const emptyValues: EmployeeExamFormData = {
  employeeId: "",
  examIds: [],
  professionalName: "",
  examDate: "",
  examTime: "",
  paymentStatus: "PENDING",
  paidAt: "",
};

const paymentStatusOptions = [
  { value: "PENDING", label: "Pendente" },
  { value: "PAID", label: "Pago" },
];

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
  isSubmitting = false,
  submitLabel,
  formId = "employee-exam-form",
  variant = "default",
  onSubmit,
  onCancel,
}: EmployeeExamFormProps) {
  const isEditing = !!defaultValues;
  const isSheet = variant === "sheet";

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee.id,
        label: `${employee.name} · ${employee.company.name}`,
      })),
    [employees]
  );

  const { control, handleSubmit, setValue, getValues } =
    useForm<EmployeeExamFormData>({
      resolver: yupResolver(employeeExamSchema) as Resolver<EmployeeExamFormData>,
      defaultValues: defaultValues
        ? employeeExamToFormValues(defaultValues)
        : emptyValues,
    });

  const employeeIdValue = useWatch({ control, name: "employeeId" });
  const paymentStatus = useWatch({ control, name: "paymentStatus" });
  const paidAtValue = useWatch({ control, name: "paidAt" });
  const isPaid = paymentStatus === "PAID";

  useEffect(() => {
    if (!isPaid) {
      setValue("paidAt", "", { shouldValidate: true });
      return;
    }

    if (!paidAtValue?.trim()) {
      setValue("paidAt", dateToDateOnly(new Date()), {
        shouldValidate: true,
      });
    }
  }, [isPaid, paidAtValue, setValue]);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === employeeIdValue),
    [employees, employeeIdValue]
  );

  const selectedCompanyId =
    selectedEmployee?.company?.id ?? defaultValues?.employee.company.id;

  const [examsForCompany, setExamsForCompany] = useState<IExam[]>([]);
  const [isLoadingCompanyExams, setIsLoadingCompanyExams] = useState(false);

  useEffect(() => {
    if (!selectedCompanyId) {
      setExamsForCompany([]);
      return;
    }

    let active = true;
    setIsLoadingCompanyExams(true);

    fetchAllPaginated((page, pageSize) =>
      examService.list({ page, pageSize, companyId: selectedCompanyId })
    )
      .then((data) => {
        if (active) {
          setExamsForCompany(data);
        }
      })
      .catch(() => {
        if (active) {
          setExamsForCompany([]);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingCompanyExams(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedCompanyId]);

  const examsForEmployee = examsForCompany;

  useEffect(() => {
    if (isLoadingCompanyExams || examsForEmployee.length === 0) {
      return;
    }

    const validExamIds = new Set(examsForEmployee.map((exam) => exam.id));
    const currentExamIds = getValues("examIds");

    if (!currentExamIds.some((examId) => !validExamIds.has(examId))) {
      return;
    }

    setValue(
      "examIds",
      currentExamIds.filter((examId) => validExamIds.has(examId)),
      { shouldValidate: true }
    );
  }, [
    employeeIdValue,
    examsForEmployee,
    isLoadingCompanyExams,
    getValues,
    setValue,
  ]);

  const examOptions = useMemo(() => {
    const options = examsForEmployee.map((exam) => ({
      value: exam.id,
      label: exam.name,
    }));

    if (!defaultValues) {
      return options;
    }

    const currentExamId = defaultValues.exam.id;
    if (options.some((option) => option.value === currentExamId)) {
      return options;
    }

    return [
      { value: currentExamId, label: defaultValues.exam.name },
      ...options,
    ];
  }, [examsForEmployee, defaultValues]);

  const canSelectExams =
    !!selectedEmployee ||
    (isEditing && employeeIdValue === defaultValues?.employee.id);

  const examPlaceholder = !canSelectExams
    ? "Selecione o funcionário primeiro"
    : isLoadingCompanyExams
      ? "Carregando exames..."
      : examOptions.length === 0
        ? "Nenhum exame para esta empresa"
        : "Selecione o(s) exame(s)";

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className={cn(isSheet ? "space-y-8" : "flex flex-col gap-4")}
      noValidate
    >
      <FormSection
        title="Vínculo funcionário × exame"
        description={
          isEditing
            ? "Atualize os dados deste vínculo."
            : "Selecione um ou mais exames realizados pelo funcionário na mesma data."
        }
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

        <MultiSelectLabel
          control={control}
          name="examIds"
          label={isEditing ? "Exame (catálogo)" : "Exames (catálogo)"}
          options={examOptions}
          placeholder={examPlaceholder}
          maxSelections={isEditing ? 1 : undefined}
          disabled={
            !canSelectExams ||
            isLoadingCompanyExams ||
            examOptions.length === 0 ||
            isSubmitting
          }
        />

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
          label="Hora do exame (opcional)"
          maskOptions={examTimeMask}
          placeholder="HH:mm"
        />
      </FormSection>

      <FormSection
        title="Pagamento"
        description="Informe se o vínculo está pendente ou já foi pago."
      >
        <SelectLabel
          control={control}
          name="paymentStatus"
          label="Status"
          options={paymentStatusOptions}
          placeholder="Selecione o status"
          disabled={isSubmitting}
          searchable={false}
        />

        {isPaid && (
          <DatePickerLabel
            id={`${formId}-paid-at`}
            label="Data de pagamento"
            value={paidAtValue ?? ""}
            onChange={(value) =>
              setValue("paidAt", value, { shouldValidate: true })
            }
            placeholder="Selecione a data"
            disabled={isSubmitting}
          />
        )}
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

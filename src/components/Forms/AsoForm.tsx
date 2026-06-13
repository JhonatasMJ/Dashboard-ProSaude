import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { MaskedInputLabel } from "@/components/MaskedInputLabel";
import { MultiSelectLabel } from "@/components/MultiSelectLabel";
import { SelectLabel } from "@/components/SelectLabel";
import { Button } from "@/components/ui/Button";
import {
  asoSchema,
  asoToFormValues,
  type AsoFormData,
} from "@/schemas/aso.schema";
import { fetchAllPaginated } from "@/shared/helpers/fetch-all-paginated.helper";
import { birthDateMask } from "@/shared/helpers/input-masks.helper";
import type { IAso } from "@/shared/interfaces/https/aso";
import {
  ASO_TYPE_LABELS,
  type AsoType,
} from "@/shared/interfaces/https/aso";
import type { IEmployee } from "@/shared/interfaces/https/employee";
import type { IExam } from "@/shared/interfaces/https/exam";
import type { IOccupationalRisk } from "@/shared/interfaces/https/occupational-risk";
import { examService } from "@/shared/services/exam.service";
import { cn } from "@/lib/utils";

interface AsoFormProps {
  defaultValues?: IAso;
  employees: IEmployee[];
  occupationalRisks: IOccupationalRisk[];
  isSubmitting?: boolean;
  submitLabel: string;
  formId?: string;
  variant?: "default" | "sheet";
  onSubmit: (data: AsoFormData) => Promise<void>;
  onCancel?: () => void;
}

const emptyValues: AsoFormData = {
  employeeId: "",
  type: "ADMISSIONAL",
  date: "",
  examIds: [],
  occupationalRiskIds: [],
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

export function AsoForm({
  defaultValues,
  employees,
  occupationalRisks,
  isSubmitting = false,
  submitLabel,
  formId = "aso-form",
  variant = "default",
  onSubmit,
  onCancel,
}: AsoFormProps) {
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

  const typeOptions = useMemo(
    () =>
      (Object.entries(ASO_TYPE_LABELS) as [AsoType, string][]).map(
        ([value, label]) => ({ value, label })
      ),
    []
  );

  const occupationalRiskOptions = useMemo(
    () =>
      occupationalRisks.map((risk) => ({
        value: risk.id,
        label: risk.description,
      })),
    [occupationalRisks]
  );

  const { control, handleSubmit, setValue, getValues } = useForm<AsoFormData>({
    resolver: yupResolver(asoSchema) as Resolver<AsoFormData>,
    defaultValues: defaultValues ? asoToFormValues(defaultValues) : emptyValues,
  });

  const employeeIdValue = useWatch({ control, name: "employeeId" });

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

  useEffect(() => {
    if (isLoadingCompanyExams || examsForCompany.length === 0) {
      return;
    }

    const validExamIds = new Set(examsForCompany.map((exam) => exam.id));
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
    examsForCompany,
    isLoadingCompanyExams,
    getValues,
    setValue,
  ]);

  const examOptions = useMemo(() => {
    const options = examsForCompany.map((exam) => ({
      value: exam.id,
      label: exam.name,
    }));

    if (!defaultValues) {
      return options;
    }

    const missingExams = defaultValues.exams.filter(
      (exam) => !options.some((option) => option.value === exam.id)
    );

    return [
      ...missingExams.map((exam) => ({ value: exam.id, label: exam.name })),
      ...options,
    ];
  }, [examsForCompany, defaultValues]);

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
        title="Dados do ASO"
        description={
          isEditing
            ? "Atualize os dados deste atestado de saúde ocupacional."
            : "Informe funcionário, tipo e data de emissão do ASO."
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

        <SelectLabel
          control={control}
          name="type"
          label="Tipo de ASO"
          options={typeOptions}
          placeholder="Selecione o tipo"
          searchable={false}
          disabled={isSubmitting}
        />

        <MaskedInputLabel
          control={control}
          name="date"
          label="Data do ASO"
          maskOptions={birthDateMask}
          placeholder="DD/MM/AAAA"
        />
      </FormSection>

      <FormSection
        title="Exames e riscos"
        description="Selecione os exames realizados e os riscos ocupacionais associados."
      >
        <MultiSelectLabel
          control={control}
          name="examIds"
          label="Exames"
          options={examOptions}
          placeholder={examPlaceholder}
          disabled={
            !canSelectExams ||
            isLoadingCompanyExams ||
            examOptions.length === 0 ||
            isSubmitting
          }
        />

        <MultiSelectLabel
          control={control}
          name="occupationalRiskIds"
          label="Riscos ocupacionais (opcional)"
          options={occupationalRiskOptions}
          placeholder={
            occupationalRisks.length === 0
              ? "Nenhum risco cadastrado"
              : "Selecione os riscos"
          }
          disabled={occupationalRisks.length === 0 || isSubmitting}
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

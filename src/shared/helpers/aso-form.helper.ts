import { brDateInputToDateOnly, dateOnlyToBrDateInput } from "@/shared/helpers/date.helper";
import type {
  IAso,
  IAsoCreatePayload,
  IAsoUpdatePayload,
} from "@/shared/interfaces/https/aso";
import type { AsoFormData } from "@/types/aso-form.types";

export function asoToFormValues(aso: IAso): AsoFormData {
  return {
    employeeId: aso.employee.id,
    type: aso.type,
    date: dateOnlyToBrDateInput(aso.date),
    examIds: aso.exams.map((exam) => exam.id),
    occupationalRiskIds: aso.occupationalRisks.map((risk) => risk.id),
  };
}

function formToAsoSharedFields(data: AsoFormData) {
  const date = brDateInputToDateOnly(data.date);
  if (!date) {
    throw new Error("Data do ASO inválida");
  }

  return {
    type: data.type,
    date,
    employee: { id: data.employeeId },
    exams: data.examIds.map((id) => ({ id })),
    occupationalRisks: data.occupationalRiskIds.map((id) => ({ id })),
  };
}

export function formToAsoCreatePayload(data: AsoFormData): IAsoCreatePayload {
  return formToAsoSharedFields(data);
}

export function formToAsoUpdatePayload(data: AsoFormData): IAsoUpdatePayload {
  return formToAsoSharedFields(data);
}

import {
  brDateInputToDateOnly,
  dateOnlyToBrDateInput,
} from "@/shared/helpers/date.helper";
import type {
  IEmployeeExam,
  IEmployeeExamCreatePayload,
  IEmployeeExamUpdatePayload,
} from "@/shared/interfaces/https/employee-exam";
import type { EmployeeExamFormData } from "@/types/employee-exam-form.types";

export function employeeExamToFormValues(
  link: IEmployeeExam
): EmployeeExamFormData {
  return {
    employeeId: link.employee.id,
    examIds: [link.exam.id],
    professionalName: link.professionalName,
    examDate: dateOnlyToBrDateInput(link.examDate),
    examTime: link.examTime,
  };
}

function formToEmployeeExamSharedFields(data: EmployeeExamFormData) {
  const examDate = brDateInputToDateOnly(data.examDate);
  if (!examDate) {
    throw new Error("Data do exame inválida");
  }

  return {
    employee: { id: data.employeeId },
    professionalName: data.professionalName.trim(),
    examDate,
    examTime: data.examTime.trim(),
  };
}

export function formToEmployeeExamCreatePayloads(
  data: EmployeeExamFormData
): IEmployeeExamCreatePayload[] {
  const shared = formToEmployeeExamSharedFields(data);

  return data.examIds.map((examId) => ({
    ...shared,
    exam: { id: examId },
  }));
}

export function formToEmployeeExamUpdatePayload(
  data: EmployeeExamFormData
): IEmployeeExamUpdatePayload {
  const examId = data.examIds[0];
  if (!examId) {
    throw new Error("Exame é obrigatório");
  }

  return {
    ...formToEmployeeExamSharedFields(data),
    exam: { id: examId },
  };
}

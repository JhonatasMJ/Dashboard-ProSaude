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
    examId: link.exam.id,
    professionalName: link.professionalName,
    examDate: dateOnlyToBrDateInput(link.examDate),
    examTime: link.examTime,
  };
}

export function formToEmployeeExamCreatePayload(
  data: EmployeeExamFormData
): IEmployeeExamCreatePayload {
  const examDate = brDateInputToDateOnly(data.examDate);
  if (!examDate) {
    throw new Error("Data do exame inválida");
  }

  return {
    employee: { id: data.employeeId },
    exam: { id: data.examId },
    professionalName: data.professionalName.trim(),
    examDate,
    examTime: data.examTime.trim(),
  };
}

export function formToEmployeeExamUpdatePayload(
  data: EmployeeExamFormData
): IEmployeeExamUpdatePayload {
  const examDate = brDateInputToDateOnly(data.examDate);
  if (!examDate) {
    throw new Error("Data do exame inválida");
  }

  return {
    employee: { id: data.employeeId },
    exam: { id: data.examId },
    professionalName: data.professionalName.trim(),
    examDate,
    examTime: data.examTime.trim(),
  };
}

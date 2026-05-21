import { EMPLOYEE_EXAMS_REPORT_PAGE_SIZE } from "@/shared/constants/employee-exams.constants";
import type {
  IEmployeeExam,
  IEmployeeExamsListParams,
} from "@/shared/interfaces/https/employee-exam";
import { employeeExamService } from "@/shared/services/employee-exam.service";
import type { EmployeeExamsReportListParams } from "@/pdf/employee-exams-report.types";

export async function fetchEmployeeExamsForReport(
  params: EmployeeExamsReportListParams
): Promise<IEmployeeExam[]> {
  const all: IEmployeeExam[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await employeeExamService.list({
      ...params,
      page,
      pageSize: EMPLOYEE_EXAMS_REPORT_PAGE_SIZE,
    } satisfies IEmployeeExamsListParams);

    all.push(...response.data);
    totalPages = response.meta.totalPages;
    page += 1;
  } while (page <= totalPages);

  return all;
}

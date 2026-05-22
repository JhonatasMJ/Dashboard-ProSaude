import { BULK_LIST_PAGE_SIZE } from "@/shared/constants/app.constants";
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
  let hasMore = true;

  while (hasMore) {
    const response = await employeeExamService.list({
      ...params,
      page,
      pageSize: BULK_LIST_PAGE_SIZE,
    } satisfies IEmployeeExamsListParams);

    all.push(...response.data);
    hasMore = page < response.meta.totalPages;
    page += 1;
  }

  return all;
}

import { BULK_LIST_PAGE_SIZE } from "@/shared/constants/app.constants";
import type { IConta, IContasListParams } from "@/shared/interfaces/https/conta";
import { contaService } from "@/shared/services/conta.service";
import type { ContasReportListParams } from "@/pdf/contas-report.types";

export async function fetchContasForReport(
  params: ContasReportListParams
): Promise<IConta[]> {
  const all: IConta[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await contaService.list({
      ...params,
      page,
      pageSize: BULK_LIST_PAGE_SIZE,
    } satisfies IContasListParams);

    all.push(...response.data);
    hasMore = page < response.meta.totalPages;
    page += 1;
  }

  return all;
}

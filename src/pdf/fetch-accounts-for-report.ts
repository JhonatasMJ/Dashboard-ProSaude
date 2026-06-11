import { BULK_LIST_PAGE_SIZE } from "@/shared/constants/app.constants";
import type { IAccount, IAccountsListParams } from "@/shared/interfaces/https/account";
import { accountService } from "@/shared/services/account.service";
import type { AccountsReportListParams } from "@/pdf/accounts-report.types";

export async function fetchAccountsForReport(
  params: AccountsReportListParams
): Promise<IAccount[]> {
  const all: IAccount[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await accountService.list({
      ...params,
      page,
      pageSize: BULK_LIST_PAGE_SIZE,
    } satisfies IAccountsListParams);

    all.push(...response.data);
    hasMore = page < response.meta.totalPages;
    page += 1;
  }

  return all;
}

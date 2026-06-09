import { BULK_LIST_PAGE_SIZE } from "@/shared/constants/app.constants";
import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";

export async function fetchAllPaginated<T>(
  fetchPage: (
    page: number,
    pageSize: number
  ) => Promise<{ data: T[]; meta: IPaginationMeta }>,
  pageSize = BULK_LIST_PAGE_SIZE
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;

  while (true) {
    const response = await fetchPage(page, pageSize);
    all.push(...response.data);

    if (page >= response.meta.totalPages) {
      break;
    }

    page += 1;
  }

  return all;
}

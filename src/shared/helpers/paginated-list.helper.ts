import type { IPaginationMeta } from "@/shared/interfaces/https/pagination";

export function removeItemFromPaginatedList<T extends { id: string }>(
  items: T[],
  id: string,
  meta: IPaginationMeta | null
): { items: T[]; meta: IPaginationMeta | null } {
  const itemsAfterRemoval = items.filter((item) => item.id !== id);

  if (!meta) {
    return { items: itemsAfterRemoval, meta: null };
  }

  const total = Math.max(0, meta.total - 1);
  const totalPages = Math.max(1, Math.ceil(total / meta.pageSize) || 1);

  return {
    items: itemsAfterRemoval,
    meta: {
      ...meta,
      total,
      totalPages,
    },
  };
}

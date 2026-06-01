/** Valor do select para cadastrar o mesmo exame em todas as empresas. */
export const ALL_COMPANIES_EXAM_VALUE = "all";

/** Valor do filtro de listagem (todas as empresas). */
export const ALL_COMPANIES_FILTER_VALUE = ALL_COMPANIES_EXAM_VALUE;

export function isAllCompaniesExamSelection(companyId: string): boolean {
  return companyId === ALL_COMPANIES_EXAM_VALUE;
}

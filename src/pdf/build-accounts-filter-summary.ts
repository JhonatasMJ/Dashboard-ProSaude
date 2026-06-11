import { dateOnlyToBrDateInput } from "@/shared/helpers/date.helper";
import {
  ACCOUNT_STATUS_LABELS,
  type AccountStatus,
} from "@/shared/types/account-status.types";
import type { AccountsReportListParams } from "@/pdf/accounts-report.types";

export function buildAccountsFilterSummary(
  params: AccountsReportListParams
): string[] {
  const lines: string[] = [];

  if (params.name) {
    lines.push(`Nome: contém "${params.name}"`);
  }

  if (params.status) {
    lines.push(
      `Status: ${ACCOUNT_STATUS_LABELS[params.status as AccountStatus] ?? params.status}`
    );
  }

  if (params.dueDateFrom) {
    lines.push(
      `Vencimento (de): ${dateOnlyToBrDateInput(params.dueDateFrom)}`
    );
  }

  if (params.dueDateTo) {
    lines.push(
      `Vencimento (até): ${dateOnlyToBrDateInput(params.dueDateTo)}`
    );
  }

  if (params.paidAtFrom) {
    lines.push(
      `Pagamento (de): ${dateOnlyToBrDateInput(params.paidAtFrom)}`
    );
  }

  if (params.paidAtTo) {
    lines.push(
      `Pagamento (até): ${dateOnlyToBrDateInput(params.paidAtTo)}`
    );
  }

  if (lines.length === 0) {
    lines.push("Nenhum filtro aplicado (todas as contas)");
  }

  return lines;
}

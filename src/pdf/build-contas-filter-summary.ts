import { dateOnlyToBrDateInput } from "@/shared/helpers/date.helper";
import {
  CONTA_STATUS_LABELS,
  type ContaStatus,
} from "@/shared/types/conta-status.types";
import type { ContasReportListParams } from "@/pdf/contas-report.types";

export function buildContasFilterSummary(
  params: ContasReportListParams
): string[] {
  const lines: string[] = [];

  if (params.nome) {
    lines.push(`Nome: contém "${params.nome}"`);
  }

  if (params.status) {
    lines.push(
      `Status: ${CONTA_STATUS_LABELS[params.status as ContaStatus] ?? params.status}`
    );
  }

  if (params.dataVencimentoFrom) {
    lines.push(
      `Vencimento (de): ${dateOnlyToBrDateInput(params.dataVencimentoFrom)}`
    );
  }

  if (params.dataVencimentoTo) {
    lines.push(
      `Vencimento (até): ${dateOnlyToBrDateInput(params.dataVencimentoTo)}`
    );
  }

  if (params.dataPagamentoFrom) {
    lines.push(
      `Pagamento (de): ${dateOnlyToBrDateInput(params.dataPagamentoFrom)}`
    );
  }

  if (params.dataPagamentoTo) {
    lines.push(
      `Pagamento (até): ${dateOnlyToBrDateInput(params.dataPagamentoTo)}`
    );
  }

  if (lines.length === 0) {
    lines.push("Nenhum filtro aplicado (todas as contas)");
  }

  return lines;
}

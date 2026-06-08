import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PDF_BRAND, PDF_LAYOUT } from "@/pdf/brand-theme";
import { loadLogoForPdf } from "@/pdf/load-logo-for-pdf";
import type { GenerateContasReportPdfInput } from "@/pdf/contas-report.types";
import { formatDateBr } from "@/shared/helpers/date.helper";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";
import {
  CONTA_STATUS_LABELS,
  type ContaStatus,
} from "@/shared/types/conta-status.types";
import type { IConta } from "@/shared/interfaces/https/conta";

const REPORT_TITLE = "Relatório de Contas";
const BRAND_NAME = "ProSaúde";

const TABLE_HEAD = [
  "Nome",
  "Valor",
  "Status",
  "Vencimento",
  "Pagamento",
] as const;

const COLUMN_WIDTH_RATIOS = [0.32, 0.14, 0.14, 0.2, 0.2] as const;

const LOGO_DISPLAY = { width: 22, height: 18.6 };

function buildReportFilename(generatedAt: Date): string {
  const stamp = format(generatedAt, "yyyy-MM-dd-HHmm");
  return `relatorio-contas-${stamp}.pdf`;
}

function getContentWidth(doc: jsPDF): number {
  return doc.internal.pageSize.getWidth() - PDF_LAYOUT.marginX * 2;
}

function getColumnStyles(tableWidth: number) {
  return Object.fromEntries(
    COLUMN_WIDTH_RATIOS.map((ratio, index) => [
      index,
      {
        cellWidth: tableWidth * ratio,
        ...(index === 1
          ? { halign: "right" as const, fontStyle: "bold" as const }
          : {}),
        ...(index === 2 ? { halign: "center" as const } : {}),
      },
    ])
  );
}

function mapContaToRow(conta: IConta): string[] {
  return [
    conta.nome,
    formatCurrency(conta.valor),
    CONTA_STATUS_LABELS[conta.status as ContaStatus] ?? conta.status,
    formatDateBr(conta.dataVencimento),
    conta.dataPagamento ? formatDateBr(conta.dataPagamento) : "—",
  ];
}

function setRgb(
  doc: jsPDF,
  color: readonly [number, number, number],
  type: "fill" | "text" | "draw" = "fill"
) {
  if (type === "text") {
    doc.setTextColor(color[0], color[1], color[2]);
    return;
  }
  if (type === "draw") {
    doc.setDrawColor(color[0], color[1], color[2]);
    return;
  }
  doc.setFillColor(color[0], color[1], color[2]);
}

function drawReportHeader(doc: jsPDF, logoDataUrl: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  setRgb(doc, PDF_BRAND.secondary);
  doc.rect(0, 0, pageWidth, PDF_LAYOUT.headerHeight, "F");

  doc.addImage(
    logoDataUrl,
    "PNG",
    PDF_LAYOUT.marginX,
    5.5,
    LOGO_DISPLAY.width,
    LOGO_DISPLAY.height
  );

  setRgb(doc, PDF_BRAND.white, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text(REPORT_TITLE, pageWidth - PDF_LAYOUT.marginX, 13, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(BRAND_NAME, pageWidth - PDF_LAYOUT.marginX, 21, { align: "right" });

  setRgb(doc, PDF_BRAND.primary);
  doc.rect(0, PDF_LAYOUT.headerHeight, pageWidth, PDF_LAYOUT.accentHeight, "F");
}

function drawOutlinedCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number
) {
  setRgb(doc, PDF_BRAND.surface);
  setRgb(doc, PDF_BRAND.border, "draw");
  doc.setLineWidth(0.25);
  doc.rect(x, y, width, height, "FD");
}

function drawSectionTitle(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  fill: readonly [number, number, number]
) {
  setRgb(doc, fill);
  doc.rect(x, y, width, height, "F");
  setRgb(doc, PDF_BRAND.secondary, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(title, x + 5, y + 4.8);
}

function drawInfoSection(
  doc: jsPDF,
  generatedAt: Date,
  totalRecords: number,
  totalValue: number,
  filterSummary: string[]
): number {
  const contentWidth = getContentWidth(doc);
  const boxX = PDF_LAYOUT.marginX;
  let cursorY = PDF_LAYOUT.headerHeight + PDF_LAYOUT.accentHeight + 8;
  const innerPadding = 5;
  const textWidth = contentWidth - innerPadding * 2;

  const titleBandH = 7;
  const resumoBodyH = 14;
  const resumoCardH = titleBandH + resumoBodyH;

  drawOutlinedCard(doc, boxX, cursorY, contentWidth, resumoCardH);
  drawSectionTitle(
    doc,
    boxX,
    cursorY,
    contentWidth,
    titleBandH,
    "Resumo do relatório",
    PDF_BRAND.primaryLight
  );

  const kpiY = cursorY + titleBandH + 5;
  const kpiCenters = [
    boxX + contentWidth * 0.17,
    boxX + contentWidth * 0.5,
    boxX + contentWidth * 0.83,
  ];

  const kpiItems = [
    {
      label: "Gerado em",
      value: format(generatedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
      emphasize: false,
    },
    { label: "Registros", value: String(totalRecords), emphasize: false },
    {
      label: "Total das contas",
      value: formatCurrency(totalValue),
      emphasize: true,
    },
  ];

  kpiItems.forEach((item, index) => {
    const centerX = kpiCenters[index];

    setRgb(doc, PDF_BRAND.textMuted, "text");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(item.label, centerX, kpiY, { align: "center" });

    setRgb(doc, item.emphasize ? PDF_BRAND.primary : PDF_BRAND.text, "text");
    doc.setFont("helvetica", item.emphasize ? "bold" : "normal");
    doc.setFontSize(item.emphasize ? 9.5 : 8.5);
    doc.text(item.value, centerX, kpiY + 5, { align: "center" });
  });

  cursorY += resumoCardH + 4;

  const filterLines = filterSummary.flatMap((line) =>
    doc.splitTextToSize(line, textWidth)
  );
  const filtersBodyH = Math.max(filterLines.length * 4.2, 5);
  const filtersCardH = titleBandH + filtersBodyH + innerPadding;

  drawOutlinedCard(doc, boxX, cursorY, contentWidth, filtersCardH);
  drawSectionTitle(
    doc,
    boxX,
    cursorY,
    contentWidth,
    titleBandH,
    "Filtros aplicados",
    PDF_BRAND.secondaryLight
  );

  let filterTextY = cursorY + titleBandH + 5;
  setRgb(doc, PDF_BRAND.text, "text");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  filterLines.forEach((line) => {
    doc.text(line, boxX + innerPadding, filterTextY);
    filterTextY += 4.2;
  });

  return cursorY + filtersCardH + 6;
}

function drawCompactHeader(doc: jsPDF, logoDataUrl: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const compactHeight = 14;

  setRgb(doc, PDF_BRAND.secondary);
  doc.rect(0, 0, pageWidth, compactHeight, "F");

  doc.addImage(logoDataUrl, "PNG", PDF_LAYOUT.marginX, 2.5, 10, 8.5);

  setRgb(doc, PDF_BRAND.white, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(REPORT_TITLE, pageWidth - PDF_LAYOUT.marginX, 9, { align: "right" });

  setRgb(doc, PDF_BRAND.primary);
  doc.rect(0, compactHeight, pageWidth, 0.8, "F");
}

function drawPageFooter(doc: jsPDF, pageNumber: number, pageCount: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - PDF_LAYOUT.footerHeight;

  setRgb(doc, PDF_BRAND.border, "draw");
  doc.setLineWidth(0.3);
  doc.line(
    PDF_LAYOUT.marginX,
    footerY,
    pageWidth - PDF_LAYOUT.marginX,
    footerY
  );

  setRgb(doc, PDF_BRAND.textMuted, "text");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    `${BRAND_NAME} · Relatório de contas`,
    PDF_LAYOUT.marginX,
    footerY + 5.5
  );
  doc.text(
    `Página ${pageNumber} de ${pageCount}`,
    pageWidth - PDF_LAYOUT.marginX,
    footerY + 5.5,
    { align: "right" }
  );
}

export async function generateContasReportPdf(
  contas: IConta[],
  options: GenerateContasReportPdfInput
): Promise<void> {
  const generatedAt = options.generatedAt ?? new Date();
  const logoDataUrl = await loadLogoForPdf();
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const tableWidth = getContentWidth(doc);
  const totalValue = contas.reduce((sum, conta) => sum + conta.valor, 0);

  drawReportHeader(doc, logoDataUrl);
  const tableStartY = drawInfoSection(
    doc,
    generatedAt,
    contas.length,
    totalValue,
    options.filterSummary
  );

  autoTable(doc, {
    startY: tableStartY,
    tableWidth,
    head: [TABLE_HEAD as unknown as string[]],
    body: contas.map(mapContaToRow),
    margin: {
      top: 18,
      left: PDF_LAYOUT.marginX,
      right: PDF_LAYOUT.marginX,
      bottom: PDF_LAYOUT.footerHeight + 4,
    },
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
      lineColor: PDF_BRAND.border,
      lineWidth: 0.15,
      textColor: PDF_BRAND.text,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: PDF_BRAND.primary,
      textColor: PDF_BRAND.white,
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: PDF_BRAND.surface,
    },
    columnStyles: getColumnStyles(tableWidth),
    foot: [["", "", "", "Total geral", formatCurrency(totalValue)]],
    footStyles: {
      fillColor: PDF_BRAND.primaryLight,
      textColor: PDF_BRAND.secondary,
      fontStyle: "bold",
      fontSize: 8.5,
    },
    showFoot: "lastPage",
    showHead: "everyPage",
  });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    if (page > 1) {
      drawCompactHeader(doc, logoDataUrl);
    }
    drawPageFooter(doc, page, pageCount);
  }

  doc.save(buildReportFilename(generatedAt));
}

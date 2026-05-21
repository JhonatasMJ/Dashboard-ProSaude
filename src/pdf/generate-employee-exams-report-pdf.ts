import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PDF_BRAND, PDF_LAYOUT } from "@/pdf/brand-theme";
import { loadLogoForPdf } from "@/pdf/load-logo-for-pdf";
import type { GenerateEmployeeExamsReportPdfInput } from "@/pdf/employee-exams-report.types";
import { formatDateBr } from "@/shared/helpers/date.helper";
import { formatCurrency } from "@/shared/helpers/format-currency.helper";
import type { IEmployeeExam } from "@/shared/interfaces/https/employee-exam";

const REPORT_TITLE = "Relatório de Vínculos";
const BRAND_NAME = "ProSaúde";

const TABLE_HEAD = [
  "Data",
  "Hora",
  "Exame",
  "Funcionário",
  "Profissional",
  "Empresa",
  "Valor exame",
] as const;

const LOGO_DISPLAY = { width: 22, height: 18.6 };

function buildReportFilename(generatedAt: Date): string {
  const stamp = format(generatedAt, "yyyy-MM-dd-HHmm");
  return `relatorio-vinculos-${stamp}.pdf`;
}

function mapLinkToRow(link: IEmployeeExam): string[] {
  return [
    formatDateBr(link.examDate),
    link.examTime,
    link.exam.name,
    link.employee.name,
    link.professionalName,
    link.employee.company.name,
    formatCurrency(link.exam.price),
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

function drawInfoSection(
  doc: jsPDF,
  generatedAt: Date,
  totalRecords: number,
  totalValue: number,
  filterSummary: string[]
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PDF_LAYOUT.marginX * 2;
  const gap = 5;
  const boxY = PDF_LAYOUT.headerHeight + PDF_LAYOUT.accentHeight + 8;
  const boxH = 30;
  const colWidth = (contentWidth - gap) / 2;

  const drawBox = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill: readonly [number, number, number]
  ) => {
    setRgb(doc, fill);
    setRgb(doc, PDF_BRAND.border, "draw");
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, width, height, 2, 2, "FD");
  };

  drawBox(PDF_LAYOUT.marginX, boxY, colWidth, boxH, PDF_BRAND.primaryLight);

  let textY = boxY + 7;
  const leftX = PDF_LAYOUT.marginX + 4;

  setRgb(doc, PDF_BRAND.secondary, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Resumo", leftX, textY);

  textY += 5;
  setRgb(doc, PDF_BRAND.text, "text");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(
    `Gerado em ${format(generatedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    leftX,
    textY
  );

  textY += 4.5;
  doc.text(`Registros: ${totalRecords}`, leftX, textY);

  textY += 4.5;
  doc.setFont("helvetica", "bold");
  setRgb(doc, PDF_BRAND.primary, "text");
  doc.text(`Total: ${formatCurrency(totalValue)}`, leftX, textY);

  const filtersX = PDF_LAYOUT.marginX + colWidth + gap;
  drawBox(filtersX, boxY, colWidth, boxH, PDF_BRAND.surface);

  textY = boxY + 7;
  const filtersTextX = filtersX + 4;
  const filtersMaxWidth = colWidth - 8;

  setRgb(doc, PDF_BRAND.secondary, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Filtros aplicados", filtersTextX, textY);

  textY += 5;
  setRgb(doc, PDF_BRAND.textMuted, "text");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  filterSummary.forEach((line) => {
    const wrapped = doc.splitTextToSize(`• ${line}`, filtersMaxWidth);
    wrapped.forEach((part: string) => {
      if (textY > boxY + boxH - 3) return;
      doc.text(part, filtersTextX, textY);
      textY += 3.8;
    });
  });

  return boxY + boxH + 8;
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
    `${BRAND_NAME} · Relatório de vínculos funcionário–exame`,
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

export async function generateEmployeeExamsReportPdf(
  links: IEmployeeExam[],
  options: GenerateEmployeeExamsReportPdfInput
): Promise<void> {
  const generatedAt = options.generatedAt ?? new Date();
  const logoDataUrl = await loadLogoForPdf();
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const totalExamValue = links.reduce((sum, link) => sum + link.exam.price, 0);

  drawReportHeader(doc, logoDataUrl);
  const tableStartY = drawInfoSection(
    doc,
    generatedAt,
    links.length,
    totalExamValue,
    options.filterSummary
  );

  autoTable(doc, {
    startY: tableStartY,
    head: [TABLE_HEAD as unknown as string[]],
    body: links.map(mapLinkToRow),
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
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 14, halign: "center" },
      2: { cellWidth: 42 },
      3: { cellWidth: 38 },
      4: { cellWidth: 38 },
      5: { cellWidth: 42 },
      6: { cellWidth: 28, halign: "right", fontStyle: "bold" },
    },
    foot: [
      ["", "", "", "", "", "Total geral", formatCurrency(totalExamValue)],
    ],
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

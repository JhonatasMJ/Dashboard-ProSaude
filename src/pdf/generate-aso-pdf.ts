import { addYears, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PDF_BRAND } from "@/pdf/brand-theme";
import {
  loadLogoForPdf,
  type LoadedPdfLogo,
} from "@/pdf/load-logo-for-pdf";
import { formatCpf, formatTaxId } from "@/shared/helpers/input-masks.helper";
import { formatDateBr, parseDateOnlyInput } from "@/shared/helpers/date.helper";
import { fetchAllPaginated } from "@/shared/helpers/fetch-all-paginated.helper";
import type {
  IAso,
  IAsoExamRef,
  IAsoOccupationalRiskRef,
} from "@/shared/interfaces/https/aso";
import {
  ASO_TYPE_LABELS,
  type AsoType,
} from "@/shared/interfaces/https/aso";
import type { IEmployee } from "@/shared/interfaces/https/employee";
import { companyService } from "@/shared/services/company.service";
import type { OccupationalRiskCategory } from "@/shared/types/occupational-risk-category.types";

export interface AsoPdfData {
  aso: IAso;
  employeeName: string;
  employeeCpf: string;
  employeeBirthDate: string;
  employeeJobTitle: string;
  companyName: string;
  companyTaxId: string;
}

const MARGIN = 10;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LOGO_WIDTH = 16;

const LEGAL_TEXT =
  "Em cumprimento à Legislação Trabalhista Art. 168 e 169 da Seção V do Título II da CLT - Consolidação das Leis do Trabalho e Leis 7855-89 e 6514/77. Portaria 3214/78 (NR-7) e Portaria n° 24 de 29/12/1994 - PCMSO - Programa de Controle Médico e Saúde Ocupacional.";

const PHYSICIAN = {
  name: "DRA YASMIM TERSIGNI COSTA MELLO",
  role: "Médico Examinador",
  crm: "CRM 283083 - SP",
} as const;

const EXAM_TYPE_ORDER: AsoType[] = [
  "ADMISSIONAL",
  "PERIODICO",
  "RETORNO_AO_TRABALHO",
  "MUDANCA_DE_RISCO",
  "MONITORACAO_PONTUAL",
  "DEMISSIONAL",
];

const RISK_GROUP_LABELS: Record<OccupationalRiskCategory, string> = {
  FISICOS: "Grupo 1 - Riscos Físicos",
  QUIMICOS: "Grupo 2 - Riscos Químicos",
  BIOLOGICOS: "Grupo 3 - Riscos Biológicos",
  ERGONOMICOS: "Grupo 4 - Riscos Ergonômicos",
  ACIDENTES: "Grupo 5 - Riscos de Acidentes",
};

const TABLE_HEAD_FILL = PDF_BRAND.secondaryLight;
const TABLE_HEAD_TEXT = PDF_BRAND.secondary;
const SECTION_HEAD_FILL = PDF_BRAND.primary;
const SECTION_HEAD_TEXT = PDF_BRAND.white;
const DOCUMENT_HEAD_FILL = PDF_BRAND.secondary;

function buildAsoFilename(asoDate: string, asoId: string): string {
  const parsed = parseDateOnlyInput(asoDate);
  const stamp = parsed
    ? format(parsed, "dd-MM-yyyy")
    : asoDate.replace(/\//g, "-");
  const shortId = asoId.slice(-4) || asoId;
  return `aso-${stamp}-${shortId}.pdf`;
}

function getValidityDate(asoDate: string): string {
  const parsed = parseDateOnlyInput(asoDate);
  if (!parsed) return formatDateBr(asoDate);

  return format(addYears(parsed, 1), "dd/MM/yyyy", { locale: ptBR });
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

function setTextColor(doc: jsPDF) {
  doc.setTextColor(0, 0, 0);
}

function drawBorderRect(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number
) {
  setRgb(doc, [0, 0, 0], "draw");
  doc.setLineWidth(0.25);
  doc.rect(x, y, width, height);
}

function drawSectionTitleBar(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  title: string
): number {
  const barHeight = 6;
  setRgb(doc, SECTION_HEAD_FILL);
  setRgb(doc, [0, 0, 0], "draw");
  doc.setLineWidth(0.25);
  doc.rect(x, y, width, barHeight, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  setRgb(doc, SECTION_HEAD_TEXT, "text");
  doc.text(title, x + width / 2, y + 4.2, { align: "center" });
  return y + barHeight;
}

function drawDocumentHeader(
  doc: jsPDF,
  logo: LoadedPdfLogo,
  startY: number
): number {
  const headerPadding = 2;
  const logoHeight = LOGO_WIDTH * logo.aspectRatio;
  const logoX = MARGIN + headerPadding;
  const logoY = startY + headerPadding;
  const textX = logoX + LOGO_WIDTH + 4;
  const textWidth = CONTENT_WIDTH - LOGO_WIDTH - headerPadding * 2 - 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  const titleLines = doc.splitTextToSize(
    "ASO - ATESTADO DE SAÚDE OCUPACIONAL",
    textWidth
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  const legalLines = doc.splitTextToSize(LEGAL_TEXT, textWidth);

  const textBlockHeight = titleLines.length * 4 + legalLines.length * 2.6 + 1;
  const headerHeight =
    headerPadding * 2 + Math.max(logoHeight, textBlockHeight);

  setRgb(doc, DOCUMENT_HEAD_FILL);
  setRgb(doc, [0, 0, 0], "draw");
  doc.setLineWidth(0.25);
  doc.rect(MARGIN, startY, CONTENT_WIDTH, headerHeight, "FD");

  doc.addImage(
    logo.dataUrl,
    "PNG",
    logoX,
    logoY,
    LOGO_WIDTH,
    logoHeight
  );

  setRgb(doc, PDF_BRAND.white, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(titleLines, textX, logoY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(legalLines, textX, logoY + 4 + titleLines.length * 4 + 1);

  return startY + headerHeight;
}

function drawEmployeeInfoSection(
  doc: jsPDF,
  startY: number,
  data: AsoPdfData,
  asoDateFormatted: string
): number {
  const infoBoxHeight = 24;
  drawBorderRect(doc, MARGIN, startY, CONTENT_WIDTH, infoBoxHeight);

  const col1X = MARGIN + 2;
  const col2X = MARGIN + CONTENT_WIDTH / 2 + 1;
  const row1Y = startY + 5;
  const row2Y = startY + 10.5;
  const row3Y = startY + 16;
  const row4Y = startY + 21.5;

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  setTextColor(doc);
  doc.text("Funcionário (a):", col1X, row1Y);
  doc.setFont("helvetica", "normal");
  doc.text(data.employeeName, col1X + 24, row1Y);

  doc.setFont("helvetica", "bold");
  doc.text("CPF:", col2X, row1Y);
  doc.setFont("helvetica", "normal");
  doc.text(data.employeeCpf, col2X + 10, row1Y);

  doc.setFont("helvetica", "bold");
  doc.text("Empresa:", col1X, row2Y);
  doc.setFont("helvetica", "normal");
  const companyLines = doc.splitTextToSize(
    data.companyName,
    CONTENT_WIDTH / 2 - 18
  );
  doc.text(companyLines, col1X + 16, row2Y);

  doc.setFont("helvetica", "bold");
  doc.text("Função:", col2X, row2Y);
  doc.setFont("helvetica", "normal");
  doc.text(data.employeeJobTitle, col2X + 13, row2Y);

  doc.setFont("helvetica", "bold");
  doc.text("Data de Nascimento:", col1X, row3Y);
  doc.setFont("helvetica", "normal");
  doc.text(data.employeeBirthDate, col1X + 30, row3Y);

  doc.setFont("helvetica", "bold");
  doc.text("CNPJ/CAEPF:", col2X, row3Y);
  doc.setFont("helvetica", "normal");
  doc.text(data.companyTaxId, col2X + 22, row3Y);

  doc.setFont("helvetica", "bold");
  doc.text("Data do ASO:", col1X, row4Y);
  doc.setFont("helvetica", "normal");
  doc.text(asoDateFormatted, col1X + 22, row4Y);

  return startY + infoBoxHeight;
}

function drawCheckbox(
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  checked: boolean
) {
  const boxSize = 3;
  setRgb(doc, [0, 0, 0], "draw");
  doc.rect(x, y - 2.6, boxSize, boxSize);

  if (checked) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    setTextColor(doc);
    doc.text("X", x + 0.55, y - 0.1);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  setTextColor(doc);
  doc.text(label, x + boxSize + 1.2, y);
}

function drawCenteredCheckbox(
  doc: jsPDF,
  centerX: number,
  y: number,
  label: string,
  checked: boolean
) {
  const labelWidth = doc.getTextWidth(label);
  const totalWidth = 3 + 1.2 + labelWidth;
  drawCheckbox(doc, centerX - totalWidth / 2, y, label, checked);
}

function mapRiskRow(risk: IAsoOccupationalRiskRef): [string, string] {
  return [RISK_GROUP_LABELS[risk.category], risk.description];
}

function mapExamRow(exam: IAsoExamRef, asoDate: string): [string, string] {
  return [formatDateBr(asoDate), exam.name];
}

function splitInHalf<T>(items: T[]): [T[], T[]] {
  const midpoint = Math.ceil(items.length / 2);
  return [items.slice(0, midpoint), items.slice(midpoint)];
}

function drawDualColumnTable(
  doc: jsPDF,
  startY: number,
  leftRows: string[][],
  rightRows: string[][],
  head: [string, string]
): number {
  const gap = 2;
  const columnWidth = (CONTENT_WIDTH - gap) / 2;
  const leftX = MARGIN;
  const rightX = MARGIN + columnWidth + gap;

  const tableOptions = {
    theme: "grid" as const,
    margin: { left: 0, right: 0 },
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 1.5,
      lineColor: [0, 0, 0] as [number, number, number],
      lineWidth: 0.15,
      textColor: [0, 0, 0] as [number, number, number],
      overflow: "linebreak" as const,
      valign: "top" as const,
    },
    headStyles: {
      fillColor: TABLE_HEAD_FILL,
      textColor: TABLE_HEAD_TEXT,
      fontStyle: "bold" as const,
      fontSize: 7,
      halign: "center" as const,
    },
    columnStyles: {
      0: { cellWidth: columnWidth * 0.42 },
      1: { cellWidth: columnWidth * 0.58 },
    },
  };

  autoTable(doc, {
    ...tableOptions,
    startY,
    tableWidth: columnWidth,
    margin: { left: leftX, right: PAGE_WIDTH - leftX - columnWidth },
    head: [head],
    body: leftRows.length > 0 ? leftRows : [["—", "—"]],
  });

  const leftFinalY =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? startY;

  autoTable(doc, {
    ...tableOptions,
    startY,
    tableWidth: columnWidth,
    margin: { left: rightX, right: MARGIN },
    head: [head],
    body: rightRows.length > 0 ? rightRows : [["", ""]],
  });

  const rightFinalY =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? startY;

  return Math.max(leftFinalY, rightFinalY);
}

function drawConclusionSection(doc: jsPDF, startY: number): number {
  const conclusionBarY = drawSectionTitleBar(
    doc,
    MARGIN,
    startY,
    CONTENT_WIDTH,
    "CONCLUSÃO DO EXAME"
  );
  const conclusionHeight = 20;
  drawBorderRect(doc, MARGIN, conclusionBarY, CONTENT_WIDTH, conclusionHeight);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  setTextColor(doc);
  const conclusionText =
    "Em cumprimento à NR-7, conforme item 7.5.19.1, letra 'e', atesto que o funcionário abaixo assinado foi examinado nesta data, sendo o resultado da avaliação considerado:";
  const conclusionLines = doc.splitTextToSize(
    conclusionText,
    CONTENT_WIDTH - 10
  );
  doc.text(conclusionLines, PAGE_WIDTH / 2, conclusionBarY + 5, {
    align: "center",
  });

  const aptoY = conclusionBarY + conclusionHeight - 5;
  const centerX = PAGE_WIDTH / 2;
  drawCenteredCheckbox(doc, centerX - 14, aptoY, "APTO", false);
  drawCenteredCheckbox(doc, centerX + 14, aptoY, "INAPTO", false);

  return conclusionBarY + conclusionHeight;
}

function drawPhysicianSection(
  doc: jsPDF,
  startY: number,
  asoDateFormatted: string
): number {
  const sectionHeight = 24;
  drawBorderRect(doc, MARGIN, startY, CONTENT_WIDTH, sectionHeight);

  const centerX = PAGE_WIDTH / 2;
  const signatureY = startY + 6;
  setRgb(doc, [0, 0, 0], "draw");
  doc.setLineWidth(0.2);
  doc.line(centerX - 35, signatureY, centerX + 35, signatureY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  setTextColor(doc);
  doc.text(PHYSICIAN.name, centerX, signatureY + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(PHYSICIAN.role, centerX, signatureY + 8, { align: "center" });
  doc.text(PHYSICIAN.crm, centerX, signatureY + 12, { align: "center" });
  doc.text(asoDateFormatted, centerX, signatureY + 16, { align: "center" });

  return startY + sectionHeight;
}

function drawValiditySection(
  doc: jsPDF,
  startY: number,
  validityDate: string
): number {
  const sectionHeight = 8;
  drawBorderRect(doc, MARGIN, startY, CONTENT_WIDTH, sectionHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  setTextColor(doc);
  doc.text(
    `Validade do ASO: ${validityDate}`,
    PAGE_WIDTH / 2,
    startY + 5,
    { align: "center" }
  );

  return startY + sectionHeight;
}

export async function generateAsoPdf(
  aso: IAso,
  employees: IEmployee[]
): Promise<void> {
  const employee =
    employees.find((item) => item.id === aso.employee.id) ?? null;

  const companies = await fetchAllPaginated((page, pageSize) =>
    companyService.list({ page, pageSize })
  );
  const company = companies.find(
    (item) => item.id === aso.employee.company.id
  );

  const data: AsoPdfData = {
    aso,
    employeeName: employee?.name ?? aso.employee.name,
    employeeCpf: employee?.documentNumber
      ? formatCpf(employee.documentNumber)
      : "—",
    employeeBirthDate: employee?.birthDate
      ? formatDateBr(employee.birthDate)
      : "—",
    employeeJobTitle: employee?.jobTitle?.trim() || "—",
    companyName: company?.name ?? aso.employee.company.name,
    companyTaxId: company?.taxId ? formatTaxId(company.taxId) : "—",
  };

  const logo = await loadLogoForPdf("white");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const asoDateFormatted = formatDateBr(aso.date);
  const validityDate = getValidityDate(aso.date);

  let y = drawDocumentHeader(doc, logo, MARGIN);
  y = drawEmployeeInfoSection(doc, y, data, asoDateFormatted);
  y += 3;

  const examTypeBarY = drawSectionTitleBar(
    doc,
    MARGIN,
    y,
    CONTENT_WIDTH,
    "TIPO DO EXAME"
  );
  const examTypeBoxHeight = 14;
  drawBorderRect(doc, MARGIN, examTypeBarY, CONTENT_WIDTH, examTypeBoxHeight);

  const checkboxRows = [
    EXAM_TYPE_ORDER.slice(0, 3),
    EXAM_TYPE_ORDER.slice(3),
  ];

  checkboxRows.forEach((rowTypes, rowIndex) => {
    const checkboxY = examTypeBarY + 5 + rowIndex * 5.5;
    let checkboxX = MARGIN + 2;
    const checkboxGap = 62;

    rowTypes.forEach((type) => {
      drawCheckbox(
        doc,
        checkboxX,
        checkboxY,
        ASO_TYPE_LABELS[type],
        aso.type === type
      );
      checkboxX += checkboxGap;
    });
  });

  y = examTypeBarY + examTypeBoxHeight + 3;

  const risksBarY = drawSectionTitleBar(
    doc,
    MARGIN,
    y,
    CONTENT_WIDTH,
    "RISCOS OCUPACIONAIS"
  );
  const [leftRisks, rightRisks] = splitInHalf(aso.occupationalRisks);
  y = drawDualColumnTable(
    doc,
    risksBarY,
    leftRisks.map(mapRiskRow),
    rightRisks.map(mapRiskRow),
    ["Grupo", "Descrição do Perigo"]
  );
  y += 3;

  const examsBarY = drawSectionTitleBar(
    doc,
    MARGIN,
    y,
    CONTENT_WIDTH,
    "EXAMES COMPLEMENTARES A QUE FOI SUBMETIDO"
  );
  const [leftExams, rightExams] = splitInHalf(aso.exams);
  y = drawDualColumnTable(
    doc,
    examsBarY,
    leftExams.map((exam) => mapExamRow(exam, aso.date)),
    rightExams.map((exam) => mapExamRow(exam, aso.date)),
    ["Data", "Procedimento"]
  );
  y += 3;

  y = drawConclusionSection(doc, y);
  y = drawPhysicianSection(doc, y, asoDateFormatted);
  y = drawValiditySection(doc, y, validityDate);
  y += 3;

  const receiptBarY = drawSectionTitleBar(
    doc,
    MARGIN,
    y,
    CONTENT_WIDTH,
    "RECIBO"
  );
  const receiptHeight = 22;
  drawBorderRect(doc, MARGIN, receiptBarY, CONTENT_WIDTH, receiptHeight);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  setTextColor(doc);
  const receiptText =
    "Declaro para fins de direitos que fui clinicamente examinado(a) e recebi a 2ª via do ASO - Atestado de Saúde Ocupacional - Nesta Data.";
  const receiptLines = doc.splitTextToSize(receiptText, CONTENT_WIDTH - 4);
  doc.text(receiptLines, MARGIN + 2, receiptBarY + 5);

  const receiptSignatureY = receiptBarY + receiptHeight - 5;
  doc.line(MARGIN + 20, receiptSignatureY, MARGIN + 90, receiptSignatureY);
  doc.line(MARGIN + 110, receiptSignatureY, MARGIN + 180, receiptSignatureY);
  doc.setFontSize(6.5);
  doc.text("Assinatura do Funcionário", MARGIN + 55, receiptSignatureY + 3.5, {
    align: "center",
  });

  doc.save(buildAsoFilename(aso.date, aso.id));
}

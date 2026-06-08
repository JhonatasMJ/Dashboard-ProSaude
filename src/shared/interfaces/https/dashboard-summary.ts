export interface IDashboardPaymentSummaryGroup {
  paymentStatus?: "PENDING" | "PAID";
  count: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface IDashboardPayments {
  pending: IDashboardPaymentSummaryGroup;
  paid: IDashboardPaymentSummaryGroup;
  total: IDashboardPaymentSummaryGroup;
}

export interface IDashboardSummaryTotals {
  companies: number;
  employees: number;
  employeesActive: number;
  employeesInactive: number;
  exams: number;
  employeeExams: number;
  users: number;
  employeesWithoutExam: number;
  upcomingExamsNext7Days: number;
  employeeExamsThisMonth: number;
  contas: number;
}

export interface IDashboardFinancialAveragePerExam {
  revenue: number;
  examCost: number;
  contaCost: number;
  cost: number;
  profit: number;
}

export interface IDashboardFinancialPeriod {
  revenue: number;
  examCost: number;
  contaCost: number;
  cost: number;
  profit: number;
  marginPercent: number;
  employeeExamCount: number;
  averagePerExam: IDashboardFinancialAveragePerExam;
}

export interface IDashboardExamCatalogFinancial {
  examCount: number;
  averagePrice: number;
  averageCost: number;
  totalCatalogPrice: number;
  totalCatalogCost: number;
  averageProfitPerExam: number;
}

export interface IDashboardFinancial {
  allTime: IDashboardFinancialPeriod;
  thisMonth: IDashboardFinancialPeriod;
  examCatalog: IDashboardExamCatalogFinancial;
}

export interface IDashboardTopCompanyByEmployees {
  companyId: string;
  name: string;
  employeeCount: number;
}

export interface IDashboardTopCompanyByEmployeeExams {
  companyId: string;
  name: string;
  employeeExamCount: number;
}

export interface IDashboardTopCompanyByRevenue {
  companyId: string;
  name: string;
  employeeExamCount: number;
  revenue: number;
  examCost: number;
  contaCost: number;
  cost: number;
  profit: number;
  marginPercent: number;
  averageProfitPerExam: number;
}

export interface IDashboardTopExamByVolume {
  examId: string;
  name: string;
  employeeExamCount: number;
  revenue: number;
  examCost: number;
  contaCost: number;
  cost: number;
  profit: number;
  marginPercent: number;
}

export interface IDashboardRecentEmployeeExam {
  id: string;
  professionalName: string;
  examDate: string;
  examTime: string;
  employee: { id: string; name: string };
  company: { id: string; name: string };
  exam: { id: string; name: string };
  revenue: number;
  cost: number;
  profit: number;
}

export interface IDashboardSummaryData {
  totals: IDashboardSummaryTotals;
  payments: IDashboardPayments;
  financial: IDashboardFinancial;
  topCompaniesByEmployees: IDashboardTopCompanyByEmployees[];
  topCompaniesByEmployeeExams: IDashboardTopCompanyByEmployeeExams[];
  topCompaniesByRevenue: IDashboardTopCompanyByRevenue[];
  topExamsByVolume: IDashboardTopExamByVolume[];
  recentEmployeeExams: IDashboardRecentEmployeeExam[];
  generatedAt: string;
}

export interface IDashboardSummaryResponse {
  data: IDashboardSummaryData;
}

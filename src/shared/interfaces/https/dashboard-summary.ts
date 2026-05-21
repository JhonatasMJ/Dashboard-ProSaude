export interface IDashboardSummaryTotals {
  companies: number;
  employees: number;
  employeesActive: number;
  employeesInactive: number;
  exams: number;
  users: number;
}

export interface IDashboardSummaryExamsByType {
  type: string;
  count: number;
}

export interface IDashboardSummaryExams {
  byType: IDashboardSummaryExamsByType[];
  last30Days: number;
  expiringWithin30Days: number;
  expired: number;
}

export interface IDashboardTopCompany {
  companyId: string;
  legalName: string;
  tradeName: string;
  employeeCount: number;
}

export interface IDashboardSummaryData {
  totals: IDashboardSummaryTotals;
  exams: IDashboardSummaryExams;
  topCompaniesByEmployees: IDashboardTopCompany[];
  generatedAt: string;
}

export interface IDashboardSummaryResponse {
  data: IDashboardSummaryData;
}

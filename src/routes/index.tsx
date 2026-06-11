import { createBrowserRouter } from "react-router-dom";
import { CompaniesProvider } from "@/contexts/companies.context";
import { AccountsProvider } from "@/contexts/accounts.context";
import { EmployeeExamsProvider } from "@/contexts/employee-exams.context";
import { EmployeesProvider } from "@/contexts/employees.context";
import { ExamsProvider } from "@/contexts/exams.context";
import { UsersProvider } from "@/contexts/users.context";
import { OccupationalRisksProvider } from "@/contexts/occupational-risks.context";
import DashboardLayout from "@/layouts/dashboard-layout";
import CompaniesPage from "@/pages/companies";
import AccountsPage from "@/pages/accounts";
import Dashboard from "@/pages/dashboard";
import EmployeesPage from "@/pages/employees";
import ExamsPage from "@/pages/exams";
import UsersPage from "@/pages/users";
import EmployeeExamsPage from "@/pages/employee-exams";
import OccupationalRisksPage from "@/pages/occupational-risks";
import Login from "@/pages/login";
import { AdminRoute } from "@/routes/admin-route";
import { RootLayout } from "@/routes/root-layout";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Login />,
        handle: { title: "Login" },
      },
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
            handle: { title: "Início" },
          },
          {
            path: "companies",
            element: (
              <CompaniesProvider>
                <CompaniesPage />
              </CompaniesProvider>
            ),
            handle: { title: "Empresas" },
          },
          {
            path: "accounts",
            element: (
              <AccountsProvider>
                <AccountsPage />
              </AccountsProvider>
            ),
            handle: { title: "Contas" },
          },
          {
            path: "exams",
            element: (
              <ExamsProvider>
                <ExamsPage />
              </ExamsProvider>
            ),
            handle: { title: "Exames" },
          },
          {
            path: "occupational-risks",
            element: (
              <OccupationalRisksProvider>
                <OccupationalRisksPage />
              </OccupationalRisksProvider>
            ),
            handle: { title: "Riscos Ocupacionais" },
          },
          {
            path: "employees",
            element: (
              <EmployeesProvider>
                <EmployeesPage />
              </EmployeesProvider>
            ),
            handle: { title: "Funcionários" },
          },
          {
            path: "employee-exams",
            element: (
              <EmployeeExamsProvider>
                <EmployeeExamsPage />
              </EmployeeExamsProvider>
            ),
            handle: { title: "Vínculos" },
          },
          {
            path: "users",
            element: (
              <AdminRoute>
                <UsersProvider>
                  <UsersPage />
                </UsersProvider>
              </AdminRoute>
            ),
            handle: { title: "Usuários" },
          },
        ],
      },
    ],
  },
]);

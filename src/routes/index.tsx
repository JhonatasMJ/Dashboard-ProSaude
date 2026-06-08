import { createBrowserRouter } from "react-router-dom";
import { CompaniesProvider } from "@/contexts/companies.context";
import { ContasProvider } from "@/contexts/contas.context";
import { EmployeeExamsProvider } from "@/contexts/employee-exams.context";
import { EmployeesProvider } from "@/contexts/employees.context";
import { ExamsProvider } from "@/contexts/exams.context";
import { UsersProvider } from "@/contexts/users.context";
import DashboardLayout from "@/layouts/dashboard-layout";
import CompaniesPage from "@/pages/companies";
import ContasPage from "@/pages/contas";
import Dashboard from "@/pages/dashboard";
import EmployeesPage from "@/pages/employees";
import ExamsPage from "@/pages/exams";
import UsersPage from "@/pages/users";
import VinculosPage from "@/pages/vinculos";
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
            path: "empresas",
            element: (
              <CompaniesProvider>
                <CompaniesPage />
              </CompaniesProvider>
            ),
            handle: { title: "Empresas" },
          },
          {
            path: "contas",
            element: (
              <ContasProvider>
                <ContasPage />
              </ContasProvider>
            ),
            handle: { title: "Contas" },
          },
          {
            path: "exames",
            element: (
              <ExamsProvider>
                <ExamsPage />
              </ExamsProvider>
            ),
            handle: { title: "Exames" },
          },
          {
            path: "funcionarios",
            element: (
              <EmployeesProvider>
                <EmployeesPage />
              </EmployeesProvider>
            ),
            handle: { title: "Funcionários" },
          },
          {
            path: "vinculos",
            element: (
              <EmployeeExamsProvider>
                <VinculosPage />
              </EmployeeExamsProvider>
            ),
            handle: { title: "Vínculos" },
          },
          {
            path: "usuarios",
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

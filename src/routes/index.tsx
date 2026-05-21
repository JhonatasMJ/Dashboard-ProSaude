import { createBrowserRouter } from "react-router-dom";
import { CompaniesProvider } from "@/contexts/companies.context";
import { ExamsProvider } from "@/contexts/exams.context";
import DashboardLayout from "@/layouts/dashboard-layout";
import CompaniesPage from "@/pages/companies";
import Dashboard from "@/pages/dashboard";
import ExamsPage from "@/pages/exams";
import Login from "@/pages/login";
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
            path: "exames",
            element: (
              <ExamsProvider>
                <ExamsPage />
              </ExamsProvider>
            ),
            handle: { title: "Exames" },
          },
        ],
      },
    ],
  },
]);

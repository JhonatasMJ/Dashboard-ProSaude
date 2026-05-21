import { createBrowserRouter } from "react-router-dom";
import { CompaniesProvider } from "@/contexts/companies.context";
import DashboardLayout from "@/layouts/dashboard-layout";
import CompaniesPage from "@/pages/companies";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "empresas",
        element: (
          <CompaniesProvider>
            <CompaniesPage />
          </CompaniesProvider>
        ),
      },
    ],
  },
]);

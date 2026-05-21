import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "@/layouts/dashboard-layout";
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
    ],
  },
]);

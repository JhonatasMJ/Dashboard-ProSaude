import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAuth } from "@/contexts/auth.context";

export default function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-svh w-full">
      <AppSidebar />
      <main className="flex flex-1 flex-col overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}

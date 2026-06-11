import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.svg";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth.context";
import { DashboardProvider } from "@/contexts/dashboard.context";

export default function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!sidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setSidebarOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-svh w-full overflow-hidden">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-3 lg:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Abrir menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <img
            src={logo}
            alt="ProSaúde"
            className="h-8 w-auto max-w-[140px] object-contain"
          />
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-background">
          <DashboardProvider>
            <Outlet />
          </DashboardProvider>
        </main>
      </div>
    </div>
  );
}

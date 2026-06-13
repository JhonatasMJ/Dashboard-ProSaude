import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth.context";
import { canManageUsers } from "@/shared/helpers/user.helper";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !canManageUsers(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

import type { UserRole } from "@/shared/interfaces/https/authenticate-response";

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  STAFF: "Equipe",
};

export function formatUserRole(role: UserRole): string {
  return ROLE_LABELS[role] ?? role;
}

export function isAdmin(role: UserRole | null | undefined): boolean {
  return role === "ADMIN";
}

export function canManageUsers(role: UserRole | null | undefined): boolean {
  return isAdmin(role);
}

export function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

import type { UserRole } from "@/shared/interfaces/https/authenticate-response";

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  STAFF: "Equipe",
};

export function formatUserRole(role: UserRole): string {
  return ROLE_LABELS[role] ?? role;
}

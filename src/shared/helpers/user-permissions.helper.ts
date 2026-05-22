import type { UserRole } from "@/shared/interfaces/https/authenticate-response";

export function isAdmin(role: UserRole | null | undefined): boolean {
  return role === "ADMIN";
}

export function canManageUsers(role: UserRole | null | undefined): boolean {
  return isAdmin(role);
}

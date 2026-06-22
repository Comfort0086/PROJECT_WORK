import type { UserRole } from "@/models/User";

/** Where each role lands after logging in. */
export function roleHome(role: UserRole | undefined | null): string {
  switch (role) {
    case "student":
      return "/student/dashboard";
    case "company":
      return "/company/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/";
  }
}

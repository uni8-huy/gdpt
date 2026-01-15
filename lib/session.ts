import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, type Session } from "./auth";

type Role = "ADMIN" | "LEADER" | "PARENT";

/**
 * Get the current session. Returns null if not authenticated.
 */
export async function getSession(): Promise<Session | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch {
    return null;
  }
}

/**
 * Get the current session or redirect to login if not authenticated.
 */
export async function requireSession(locale: string = "vi"): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login`);
  }
  return session;
}

/**
 * Require a specific role. Redirects to login if not authenticated,
 * or to home page if authenticated but wrong role.
 */
export async function requireRole(
  role: Role | Role[],
  locale: string = "vi"
): Promise<Session> {
  const session = await requireSession(locale);
  const allowedRoles = Array.isArray(role) ? role : [role];

  const userRole = session.user.role as Role;
  if (!allowedRoles.includes(userRole)) {
    // User is authenticated but doesn't have the required role
    redirect(`/${locale}`);
  }

  return session;
}

/**
 * Check if the current user needs to change their password.
 * If so, redirect to the password change page.
 */
export async function checkPasswordChange(locale: string = "vi"): Promise<void> {
  const session = await getSession();
  if (session?.user.forcePasswordChange) {
    redirect(`/${locale}/change-password`);
  }
}

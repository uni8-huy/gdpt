import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Routes that require authentication
const protectedPatterns = ["/admin", "/leader", "/parent"];

// Routes that should redirect authenticated users away
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Handle internationalization first
  const response = intlMiddleware(request);

  // Extract locale-stripped path for route matching
  const pathWithoutLocale = pathname.replace(/^\/(vi|en)/, "") || "/";

  // Check if user has a session cookie
  const sessionCookie = getSessionCookie(request);
  const isAuthenticated = !!sessionCookie;

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthenticated && authRoutes.some((r) => pathWithoutLocale.startsWith(r))) {
    const locale = pathname.match(/^\/(vi|en)/)?.[1] || "vi";
    return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, request.url));
  }

  // Redirect authenticated users from root to dashboard
  if (isAuthenticated && (pathWithoutLocale === "/" || pathWithoutLocale === "")) {
    const locale = pathname.match(/^\/(vi|en)/)?.[1] || "vi";
    return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, request.url));
  }

  // Check protected routes - optimistic redirect at middleware level
  // Full session validation happens in the actual pages
  const isProtectedRoute = protectedPatterns.some((pattern) =>
    pathWithoutLocale.startsWith(pattern)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const locale = pathname.match(/^\/(vi|en)/)?.[1] || "vi";
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/",
    "/(vi|en)/:path*",
  ],
};

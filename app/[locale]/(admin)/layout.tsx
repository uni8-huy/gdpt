import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Calendar,
  Bell,
  Building,
  Upload,
  MoreHorizontal,
} from "lucide-react";
import { requireRole, checkPasswordChange } from "@/lib/session";
import { LogoutButton } from "@/components/auth/logout-button";
import { AdminMobileHeader, AdminDesktopHeader } from "@/components/admin/admin-header";
import { BreadcrumbNav } from "@/components/navigation/breadcrumb-nav";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Verify user is authenticated and has ADMIN role
  const session = await requireRole("ADMIN", locale);

  // Check if user needs to change password
  await checkPasswordChange(locale);

  const t = await getTranslations("nav");
  const common = await getTranslations("common");

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/admin/students", icon: Users, label: t("students") },
    { href: "/admin/units", icon: Building, label: t("units") },
    { href: "/admin/users", icon: UserCog, label: t("users") },
    { href: "/admin/events", icon: Calendar, label: t("events") },
    { href: "/admin/announcements", icon: Bell, label: t("announcements") },
    { href: "/admin/import", icon: Upload, label: t("import") },
  ];

  // Mobile bottom nav items: Dashboard, Students, Units, Users, More (per user validation)
  const mobileNavItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/admin/students", icon: Users, label: t("students") },
    { href: "/admin/units", icon: Building, label: t("units") },
    { href: "/admin/users", icon: UserCog, label: t("users") },
    { href: "/admin/more", icon: MoreHorizontal, label: t("more") },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <AdminMobileHeader
        appName={common("appName")}
        userId={session.user.id}
        logoutLabel={common("logout")}
      />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-card flex-col">
        {/* Logo & User Info */}
        <AdminDesktopHeader
          appName={common("appName")}
          userEmail={session.user.email}
          userId={session.user.id}
        />

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <LogoutButton
            label={common("logout")}
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="p-4 md:p-6">
          <BreadcrumbNav portal="admin" />
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card">
        <div className="flex justify-around py-2">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 p-2 text-xs"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

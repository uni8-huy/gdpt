import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  Bell,
  Settings,
  Building,
  Upload,
} from "lucide-react";
import { requireRole, checkPasswordChange } from "@/lib/session";
import { LogoutButton } from "@/components/auth/logout-button";

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
    { href: "/admin/units", icon: Building, label: "Đơn vị" },
    { href: "/admin/leaders", icon: UserCheck, label: t("leaders") },
    { href: "/admin/events", icon: Calendar, label: t("events") },
    { href: "/admin/announcements", icon: Bell, label: t("announcements") },
    { href: "/admin/import", icon: Upload, label: "Nhập dữ liệu" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex flex-col h-full">
          {/* Logo & User Info */}
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold">{common("appName")}</h1>
            <p className="text-sm text-muted-foreground truncate">
              {session.user.email}
            </p>
          </div>

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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

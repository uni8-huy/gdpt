import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  UserCircle,
} from "lucide-react";
import { requireRole } from "@/lib/session";
import { LogoutButton } from "@/components/auth/logout-button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LeaderLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Verify user is authenticated and has LEADER or ADMIN role
  const session = await requireRole(["LEADER", "ADMIN"], locale);

  const t = await getTranslations("nav");
  const common = await getTranslations("common");
  const roles = await getTranslations("roles");

  const navItems = [
    { href: "/leader/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/leader/profile", icon: UserCircle, label: t("profile") },
    { href: "/leader/giapha", icon: BookOpen, label: t("giapha") },
    { href: "/leader/students", icon: Users, label: t("students") },
    { href: "/leader/events", icon: Calendar, label: t("events") },
    { href: "/leader/calendar", icon: Calendar, label: "Calendar" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex flex-col h-full">
          {/* Logo & User Info */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">{common("appName")}</h1>
              <LanguageSwitcher />
            </div>
            <p className="text-sm text-muted-foreground truncate mt-1">
              {session.user.name || session.user.email}
            </p>
            <p className="text-xs text-muted-foreground">{roles("leader")}</p>
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

import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  Home,
  Users,
  Calendar,
  Bell,
  MessageCircle,
} from "lucide-react";
import { requireRole } from "@/lib/session";
import { LogoutButton } from "@/components/auth/logout-button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ParentLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Verify user is authenticated and has PARENT or ADMIN role
  const session = await requireRole(["PARENT", "ADMIN"], locale);

  const t = await getTranslations("nav");
  const common = await getTranslations("common");
  const roles = await getTranslations("roles");

  const navItems = [
    { href: "/parent/dashboard", icon: Home, label: t("dashboard") },
    { href: "/parent/children", icon: Users, label: t("children") },
    { href: "/parent/calendar", icon: Calendar, label: t("events") },
    { href: "/parent/announcements", icon: Bell, label: t("announcements") },
    { href: "/parent/contact", icon: MessageCircle, label: t("contact") },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">{common("appName")}</h1>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <LogoutButton
              label=""
              variant="ghost"
              showIcon={true}
              className="text-destructive p-2"
            />
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-card flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{common("appName")}</h1>
            <LanguageSwitcher />
          </div>
          <p className="text-sm text-muted-foreground truncate mt-1">
            {session.user.name || session.user.email}
          </p>
          <p className="text-xs text-muted-foreground">{roles("parent")}</p>
        </div>

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
        <div className="p-4 md:p-6">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 4).map((item) => (
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

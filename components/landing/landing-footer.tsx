import Link from "next/link";
import { useTranslations } from "next-intl";
import { Flower2 } from "lucide-react";

export function LandingFooter() {
  const t = useTranslations("landing.footer");
  const navT = useTranslations("landing.nav");
  const common = useTranslations("common");

  const quickLinks = [
    { href: "#about", label: navT("about") },
    { href: "#programs", label: navT("programs") },
    { href: "#events", label: navT("events") },
    { href: "#contact", label: navT("contact") },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Flower2 className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">{common("appName")}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {common("appDescription")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t("quickLinks")}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Auth Links */}
          <div>
            <h3 className="font-semibold mb-4">{common("appName")}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {common("login")}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {common("register")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          {t("copyright", { year: currentYear })}
        </div>
      </div>
    </footer>
  );
}

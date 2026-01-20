"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

interface LandingNavbarProps {
  isLoggedIn?: boolean;
  userRole?: string;
}

export function LandingNavbar({ isLoggedIn, userRole }: LandingNavbarProps) {
  const t = useTranslations("landing.nav");
  const common = useTranslations("common");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine dashboard path based on role
  const getDashboardPath = () => {
    switch (userRole) {
      case "ADMIN":
        return "/admin/dashboard";
      case "LEADER":
        return "/leader/dashboard";
      case "PARENT":
        return "/parent/dashboard";
      default:
        return "/admin/dashboard";
    }
  };

  const navLinks = [
    { href: "#about", label: t("about") },
    { href: "#programs", label: t("programs") },
    { href: "#events", label: t("events") },
    { href: "#contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Flower2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">{common("appName")}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          {isLoggedIn ? (
            <Button asChild>
              <Link href={getDashboardPath()}>{t("dashboard")}</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">{common("login")}</Link>
              </Button>
              <Button asChild>
                <Link href="/register">{common("register")}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-3 pt-4 border-t">
              <LanguageSwitcher />
              {isLoggedIn ? (
                <Button asChild className="flex-1">
                  <Link href={getDashboardPath()}>{t("dashboard")}</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="flex-1">
                    <Link href="/login">{common("login")}</Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/register">{common("register")}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

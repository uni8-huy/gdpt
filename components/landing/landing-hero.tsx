import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface LandingHeroProps {
  isLoggedIn?: boolean;
}

export function LandingHero({ isLoggedIn }: LandingHeroProps) {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative w-full bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 md:py-32">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          {t("title")}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          {t("subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isLoggedIn ? (
            <Button size="lg" asChild>
              <a href="#programs">{t("ctaLearnMore")}</a>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link href="/register">{t("ctaRegister")}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">{t("ctaLogin")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

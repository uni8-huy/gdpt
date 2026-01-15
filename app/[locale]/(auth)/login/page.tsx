import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { LoginForm } from "@/components/auth/login-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("loginTitle"),
  };
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="h-px bg-border my-4" />
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
    </div>
  );
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  const common = await getTranslations("common");

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          {common("appName")}
        </CardTitle>
        <CardDescription className="text-center">
          {t("loginTitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Suspense fallback={<LoginFormSkeleton />}>
          {/* OAuth Buttons for Parents/Leaders */}
          <OAuthButtons
            googleLabel={t("loginWithGoogle")}
            facebookLabel={t("loginWithFacebook")}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t("orContinueWith")}
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {t("adminOnly")}
          </p>

          {/* Credential Form for Admins */}
          <LoginForm
            emailLabel={common("email")}
            passwordLabel={common("password")}
            submitLabel={common("login")}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
}

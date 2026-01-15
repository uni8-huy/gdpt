import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordChangeForm } from "@/components/auth/password-change-form";
import { auth } from "@/lib/auth";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("changePassword"),
  };
}

function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
    </div>
  );
}

export default async function ChangePasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get session to verify user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations("auth");
  const common = await getTranslations("common");

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          {t("changePassword")}
        </CardTitle>
        <CardDescription className="text-center">
          {t("mustChangePassword")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<FormSkeleton />}>
          <PasswordChangeForm
            currentPasswordLabel={t("currentPassword")}
            newPasswordLabel={t("newPassword")}
            confirmPasswordLabel={common("confirmPassword")}
            submitLabel={t("changePassword")}
            successMessage={t("passwordChanged")}
            locale={locale}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
}

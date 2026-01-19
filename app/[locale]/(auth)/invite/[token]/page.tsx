import { setRequestLocale, getTranslations } from "next-intl/server";
import { getInvitationByToken } from "@/lib/actions/invitation-actions";
import { InvalidInvitation } from "./invalid-invitation";
import { InvitationForm } from "./invitation-form";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; token: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "invitation" });
  return {
    title: t("accept"),
  };
}

export default async function InvitePage({ params }: Props) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  const invitation = await getInvitationByToken(token);

  const [t, common, roles] = await Promise.all([
    getTranslations("invitation"),
    getTranslations("common"),
    getTranslations("roles"),
  ]);

  const invalidTranslations = {
    title: t("invalidToken"),
    description: t("invalidTokenDesc"),
    reasons: t("invalidReasons"),
    expired: t("reasonExpired"),
    cancelled: t("reasonCancelled"),
    used: t("reasonUsed"),
    incorrect: t("reasonIncorrect"),
    contactAdmin: t("contactAdmin"),
    login: common("login"),
  };

  const formTranslations = {
    welcome: t("welcomeTitle"),
    email: t("email"),
    role: t("role"),
    unit: t("unit"),
    yourName: t("yourName"),
    password: t("password"),
    confirmPassword: t("confirmPassword"),
    passwordHint: t("passwordHint"),
    createAccount: t("createAccount"),
    alreadyHaveAccount: t("alreadyHaveAccount"),
    acceptSuccess: t("acceptSuccess"),
    redirecting: t("redirecting"),
    common: {
      login: common("login"),
      tryAgain: common("tryAgain"),
    },
    roles: {
      admin: roles("admin"),
      leader: roles("leader"),
      parent: roles("parent"),
    },
  };

  // If invitation is invalid, expired, or used
  if (!invitation || invitation.isExpired || invitation.isUsed) {
    return <InvalidInvitation translations={invalidTranslations} />;
  }

  return (
    <InvitationForm
      token={token}
      invitation={{
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        unitName: invitation.unit?.name,
      }}
      translations={formTranslations}
    />
  );
}

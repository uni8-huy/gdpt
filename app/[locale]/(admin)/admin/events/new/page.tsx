import { setRequestLocale, getTranslations } from "next-intl/server";
import { EventForm } from "../event-form";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "event" });
  return {
    title: `${t("addNew")} - Admin`,
  };
}

export default async function NewEventPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("event");
  const common = await getTranslations("common");
  const roles = await getTranslations("roles");

  const translations = {
    title: t("name"),
    description: t("description"),
    startDate: t("startDate"),
    endDate: t("endDate"),
    location: t("location"),
    isPublic: t("isPublic"),
    targetRoles: t("targetRoles"),
    eventInfo: t("eventInfo"),
    displaySettings: t("displaySettings"),
    publicOnHome: t("publicOnHome"),
    titleRequired: t("titleRequired"),
    selectDate: t("selectDate"),
    roles: {
      admin: roles("admin"),
      leader: roles("leader"),
      parent: roles("parent"),
    },
    common: {
      save: common("save"),
      saving: common("saving"),
      update: common("update"),
      create: common("create"),
      cancel: common("cancel"),
      tryAgain: common("tryAgain"),
    },
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{t("addNew")}</h1>
      <EventForm locale={locale} translations={translations} />
    </div>
  );
}

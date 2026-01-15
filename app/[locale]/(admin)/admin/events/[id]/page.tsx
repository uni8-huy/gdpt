import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { EventForm } from "../event-form";
import { getEvent } from "@/lib/actions/event-actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params;
  const [event, t] = await Promise.all([
    getEvent(id),
    getTranslations({ locale, namespace: "event" }),
  ]);
  return {
    title: event ? `${event.title} - Admin` : `${t("title")} - Admin`,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [event, t, common, roles] = await Promise.all([
    getEvent(id),
    getTranslations("event"),
    getTranslations("common"),
    getTranslations("roles"),
  ]);

  if (!event) {
    notFound();
  }

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
      <h1 className="text-2xl font-bold mb-6">{common("edit")}: {event.title}</h1>
      <EventForm event={event} locale={locale} translations={translations} />
    </div>
  );
}

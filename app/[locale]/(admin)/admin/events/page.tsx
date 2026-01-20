import { getTranslations, setRequestLocale } from "next-intl/server";
import { DataTable } from "@/components/admin/data-table";
import { columns } from "./columns";
import { getEvents } from "@/lib/actions/event-actions";
import { EventSheet } from "./event-sheet";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "event" });
  return {
    title: `${t("title")} - Admin`,
  };
}

export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("event");
  const common = await getTranslations("common");
  const roles = await getTranslations("roles");

  const events = await getEvents();

  const sheetTranslations = {
    addNew: t("addNew"),
    edit: common("edit"),
    title: t("title"),
    description: t("description"),
    startDate: t("startDate"),
    endDate: t("endDate"),
    location: t("location"),
    isPublic: t("isPublic"),
    targetRoles: t("targetRoles"),
    publicOnHome: t("publicOnHome"),
    roles: {
      admin: roles("admin"),
      leader: roles("leader"),
      parent: roles("parent"),
    },
    common: {
      save: common("save"),
      saving: common("saving"),
      cancel: common("cancel"),
      tryAgain: common("tryAgain"),
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <EventSheet translations={sheetTranslations} />
      </div>
      <DataTable
        columns={columns}
        data={events}
        searchKey="title"
        searchPlaceholder={common("searchPlaceholder")}
        noDataMessage={common("noData")}
      />
    </div>
  );
}

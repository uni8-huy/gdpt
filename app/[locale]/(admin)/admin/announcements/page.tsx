import { getTranslations, setRequestLocale } from "next-intl/server";
import { DataTable } from "@/components/admin/data-table";
import { columns } from "./columns";
import { getAnnouncements } from "@/lib/actions/announcement-actions";
import { getSession } from "@/lib/session";
import { AnnouncementSheet } from "./announcement-sheet";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "announcement" });
  return {
    title: `${t("title")} - Admin`,
  };
}

export default async function AnnouncementsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("announcement");
  const common = await getTranslations("common");
  const roles = await getTranslations("roles");

  const [announcements, session] = await Promise.all([
    getAnnouncements(),
    getSession(),
  ]);

  const sheetTranslations = {
    addNew: t("addNew"),
    edit: common("edit"),
    title: t("title"),
    content: t("content"),
    isPublished: t("isPublished"),
    isPublic: t("isPublic"),
    publicOnLanding: t("publicOnLanding"),
    targetRoles: t("targetRoles"),
    publishNow: t("publishNow"),
    draftNote: t("draftNote"),
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
        <AnnouncementSheet
          authorId={session?.user.id || ""}
          translations={sheetTranslations}
        />
      </div>
      <DataTable
        columns={columns}
        data={announcements}
        searchKey="title"
        searchPlaceholder={common("searchPlaceholder")}
        noDataMessage={common("noData")}
      />
    </div>
  );
}

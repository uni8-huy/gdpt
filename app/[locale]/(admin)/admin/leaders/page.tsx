import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getLeaders } from "@/lib/actions/leader-actions";
import { LeadersDataTable } from "./leaders-data-table";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "leader" });
  return {
    title: `${t("title")} - Admin`,
  };
}

export default async function LeadersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("leader");
  const common = await getTranslations("common");
  const status = await getTranslations("status");

  const leaders = await getLeaders();

  const translations = {
    name: t("name"),
    dharmaName: t("dharmaName"),
    yearOfBirth: t("yearOfBirth"),
    unit: t("unit"),
    level: t("level"),
    timeline: t("timeline"),
    training: t("training"),
    status: common("current"),
    active: status("active"),
    inactive: status("inactive"),
    phases: t("phases"),
    camps: t("camps"),
    addNew: t("addNew"),
    searchPlaceholder: common("searchPlaceholder"),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button asChild>
          <Link href="/admin/leaders/new">
            <Plus className="mr-2 h-4 w-4" />
            {translations.addNew}
          </Link>
        </Button>
      </div>
      <LeadersDataTable
        data={leaders}
        translations={translations}
      />
    </div>
  );
}

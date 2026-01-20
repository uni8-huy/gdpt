import { getTranslations, setRequestLocale } from "next-intl/server";
import { getUnitsWithHierarchy } from "@/lib/actions/unit-actions";
import { db } from "@/lib/db";
import { UnitsClientWrapper } from "./units-client-wrapper";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "unit" });
  return {
    title: `${t("title")} - Admin`,
  };
}

export default async function UnitsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [units, allUnits, t, common] = await Promise.all([
    getUnitsWithHierarchy(),
    db.unit.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getTranslations("unit"),
    getTranslations("common"),
  ]);

  const translations = {
    title: t("title"),
    searchPlaceholder: t("searchPlaceholder"),
    filterAll: t("filterAll"),
    filterRoot: t("filterRoot"),
    parentUnit: t("parentUnit"),
    students: t("students"),
    leaders: t("leaders"),
    classes: t("classes"),
    noUnits: t("noUnits"),
    totalUnits: t("totalUnits"),
    totalStudents: t("totalStudents"),
    totalLeaders: t("totalLeaders"),
    viewDetails: t("viewDetails"),
    sheetTranslations: {
      addNew: t("addNew"),
      edit: common("edit"),
      name: t("name"),
      description: t("description"),
      parentUnit: t("parentUnit"),
      selectParent: t("selectParent"),
      noParent: t("noParent"),
      common: {
        save: common("save"),
        saving: common("saving"),
        cancel: common("cancel"),
        tryAgain: common("tryAgain"),
      },
    },
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <UnitsClientWrapper
        units={units}
        allUnits={allUnits}
        translations={translations}
      />
    </div>
  );
}

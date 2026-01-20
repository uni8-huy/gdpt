import { getTranslations, setRequestLocale } from "next-intl/server";
import { getStudents } from "@/lib/actions/student-actions";
import { db } from "@/lib/db";
import { StudentsClientWrapper } from "./students-client-wrapper";
import { StudentSheet } from "./student-sheet";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "student" });
  return {
    title: `${t("title")} - Admin`,
  };
}

export default async function StudentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("student");
  const common = await getTranslations("common");
  const status = await getTranslations("status");

  const [students, units, allParents] = await Promise.all([
    getStudents(),
    db.unit.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.user.findMany({
      where: { role: "PARENT" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const tableTranslations = {
    name: t("name"),
    dharmaName: t("dharmaName"),
    dateOfBirth: t("dateOfBirth"),
    gender: t("gender"),
    unit: t("unit"),
    class: t("class"),
    status: t("status"),
    male: common("male"),
    female: common("female"),
    active: status("activeStudent"),
    inactive: status("inactiveStudent"),
    addNew: t("addNew"),
    searchPlaceholder: common("searchPlaceholder"),
    noData: common("noData"),
  };

  const sheetTranslations = {
    addNew: t("addNew"),
    edit: common("edit"),
    name: t("name"),
    dharmaName: t("dharmaName"),
    dateOfBirth: t("dateOfBirth"),
    gender: t("gender"),
    unit: t("unit"),
    class: t("class"),
    selectClass: t("selectClass"),
    noClass: t("noClass"),
    status: t("status"),
    notes: t("notes"),
    selectUnit: t("selectUnit"),
    male: common("male"),
    female: common("female"),
    active: t("active"),
    inactive: t("inactive"),
    common: {
      save: common("save"),
      saving: common("saving"),
      cancel: common("cancel"),
      tryAgain: common("tryAgain"),
    },
  };

  const detailSheetTranslations = {
    viewDetails: t("viewDetails"),
    basicInfo: t("basicInfo"),
    dharmaName: t("dharmaName"),
    dateOfBirth: t("dateOfBirth"),
    gender: t("gender"),
    unit: t("unit"),
    class: t("class"),
    status: t("status"),
    notes: t("notes"),
    linkedParents: t("linkedParents"),
    noLinkedParents: t("noLinkedParents"),
    linkParent: t("linkParent"),
    selectParent: t("selectParent"),
    unlink: common("unlink"),
    edit: common("edit"),
    delete: common("delete"),
    deleteConfirm: t("deleteConfirm"),
    deleteWarning: t("deleteWarning"),
    male: common("male"),
    female: common("female"),
    active: status("activeStudent"),
    inactive: status("inactiveStudent"),
    common: {
      cancel: common("cancel"),
      delete: common("delete"),
      deleting: common("deleting"),
      tryAgain: common("tryAgain"),
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <StudentSheet units={units} translations={sheetTranslations} />
      </div>
      <StudentsClientWrapper
        students={students}
        allParents={allParents}
        units={units}
        locale={locale}
        tableTranslations={tableTranslations}
        detailSheetTranslations={detailSheetTranslations}
        sheetTranslations={sheetTranslations}
      />
    </div>
  );
}

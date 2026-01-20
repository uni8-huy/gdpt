import { notFound, redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/session";
import { getUnit } from "@/lib/actions/unit-actions";
import { getStudentsByUnit } from "@/lib/actions/student-actions";
import { db } from "@/lib/db";
import { ClassesSection } from "@/app/[locale]/(admin)/admin/units/[id]/classes-section";
import { UnitTabsWrapper } from "@/components/unit-management/unit-tabs-wrapper";
import { OverviewTab } from "@/components/unit-management/overview-tab";
import { StudentsTab } from "@/components/unit-management/students-tab";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params;
  const [unit, t] = await Promise.all([
    getUnit(id),
    getTranslations({ locale, namespace: "unit" }),
  ]);
  return {
    title: unit ? `${unit.name} - ${t("title")}` : t("title"),
  };
}

export default async function LeaderUnitDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await requireRole(["LEADER", "ADMIN"], locale);

  // Get leader profile to verify unit access
  const leaderProfile = await db.youthLeader.findUnique({
    where: { userId: session.user.id },
    select: { unitId: true },
  });

  if (!leaderProfile) {
    redirect(`/${locale}/leader/dashboard`);
  }

  // Verify leader has access to this unit
  if (leaderProfile.unitId !== id) {
    notFound();
  }

  const [unit, classes, students, t, common] = await Promise.all([
    getUnit(id),
    db.class.findMany({
      where: { unitId: id },
      include: { _count: { select: { students: true } } },
      orderBy: { name: "asc" },
    }),
    getStudentsByUnit(id),
    getTranslations("unit"),
    getTranslations("common"),
  ]);

  if (!unit) {
    notFound();
  }

  const classesTranslations = {
    classes: t("classes"),
    addClass: t("addClass"),
    noClasses: t("noClasses"),
    classSheet: {
      createTitle: t("classSheet.createTitle"),
      editTitle: t("classSheet.editTitle"),
      name: t("classSheet.name"),
      studentCount: t("classSheet.studentCount"),
      deleteConfirm: t("classSheet.deleteConfirm"),
      deleteWarning: t("classSheet.deleteWarning"),
      save: common("save"),
      cancel: common("cancel"),
      delete: common("delete"),
      saving: common("saving"),
      deleting: common("deleting"),
      tryAgain: common("tryAgain"),
    },
  };

  const tabsTranslations = {
    overview: t("tabs.overview"),
    classes: t("tabs.classes"),
    students: t("tabs.students"),
    leaders: t("tabs.leaders"),
  };

  const overviewTranslations = {
    basicInfo: t("overview.basicInfo"),
    statistics: t("overview.statistics"),
    childUnits: t("overview.childUnits"),
    name: t("name"),
    description: t("description"),
    parentUnit: t("parentUnit"),
    students: t("students"),
    leaders: t("leaders"),
    classes: t("classes"),
  };

  const studentsTabTranslations = {
    title: t("studentsTab.title"),
    searchPlaceholder: t("studentsTab.searchPlaceholder"),
    allClasses: t("studentsTab.allClasses"),
    allStatuses: t("studentsTab.allStatuses"),
    addStudent: t("studentsTab.addStudent"),
    noStudents: t("studentsTab.noStudents"),
    noResults: t("studentsTab.noResults"),
    active: t("studentsTab.active"),
    inactive: t("studentsTab.inactive"),
    male: t("studentsTab.male"),
    female: t("studentsTab.female"),
    deleteConfirm: t("studentsTab.deleteConfirm"),
    deleteWarning: t("studentsTab.deleteWarning"),
    sheet: {
      addTitle: t("studentsTab.sheet.addTitle"),
      editTitle: t("studentsTab.sheet.editTitle"),
      name: t("studentsTab.sheet.name"),
      dharmaName: t("studentsTab.sheet.dharmaName"),
      dateOfBirth: t("studentsTab.sheet.dateOfBirth"),
      gender: t("studentsTab.sheet.gender"),
      unit: t("studentsTab.sheet.unit"),
      class: t("studentsTab.sheet.class"),
      selectClass: t("studentsTab.sheet.selectClass"),
      noClass: t("studentsTab.sheet.noClass"),
      status: t("studentsTab.sheet.status"),
      notes: t("studentsTab.sheet.notes"),
      male: t("studentsTab.male"),
      female: t("studentsTab.female"),
      active: t("studentsTab.active"),
      inactive: t("studentsTab.inactive"),
      common: {
        save: common("save"),
        saving: common("saving"),
        cancel: common("cancel"),
        tryAgain: common("tryAgain"),
        delete: common("delete"),
        deleting: common("deleting"),
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/leader/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{unit.name}</h1>
      </div>

      {/* Tabs - Leaders cannot see Leaders tab */}
      <UnitTabsWrapper
        isAdmin={false}
        translations={tabsTranslations}
        children={{
          overview: (
            <OverviewTab
              unit={unit}
              classCount={classes.length}
              translations={overviewTranslations}
            />
          ),
          classes: (
            <ClassesSection
              unitId={unit.id}
              classes={classes}
              translations={classesTranslations}
            />
          ),
          students: (
            <StudentsTab
              unitId={unit.id}
              students={students}
              classes={classes}
              allUnits={[]} // Empty - leaders cannot move students to other units
              canDelete={false}
              canMoveUnit={false}
              translations={studentsTabTranslations}
            />
          ),
        }}
      />
    </div>
  );
}

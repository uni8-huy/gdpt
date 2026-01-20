import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { UnitSheet } from "../unit-sheet";
import { DeleteUnitButton } from "./delete-button";
import { getUnit } from "@/lib/actions/unit-actions";
import { getStudentsByUnit } from "@/lib/actions/student-actions";
import {
  getLeadersByUnit,
  getAvailableUsersForLeader,
} from "@/lib/actions/leader-actions";
import { db } from "@/lib/db";
import { ClassesSection } from "./classes-section";
import { UnitTabsWrapper } from "@/components/unit-management/unit-tabs-wrapper";
import { OverviewTab } from "@/components/unit-management/overview-tab";
import { StudentsTab } from "@/components/unit-management/students-tab";
import { LeadersTab } from "@/components/unit-management/leaders-tab";

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
    title: unit ? `${unit.name} - ${t("title")}` : `${t("title")} - Admin`,
  };
}

export default async function UnitDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [unit, allUnits, classes, students, leaders, availableUsers, t, common] =
    await Promise.all([
      getUnit(id),
      db.unit.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      db.class.findMany({
        where: { unitId: id },
        include: { _count: { select: { students: true } } },
        orderBy: { name: "asc" },
      }),
      getStudentsByUnit(id),
      getLeadersByUnit(id),
      getAvailableUsersForLeader(),
      getTranslations("unit"),
      getTranslations("common"),
    ]);

  if (!unit) {
    notFound();
  }

  // Admin page always shows admin features
  const isAdmin = true;

  const deleteTranslations = {
    delete: common("delete"),
    deleting: common("deleting"),
    cancel: common("cancel"),
    deleteConfirm: t("deleteConfirm"),
    deleteWarning: t("deleteWarning"),
    deleteErrorHasChildren: t("deleteErrorHasChildren"),
    deleteErrorHasMembers: t("deleteErrorHasMembers"),
  };

  const sheetTranslations = {
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
  };

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

  const leadersTabTranslations = {
    title: t("leadersTab.title"),
    searchPlaceholder: t("leadersTab.searchPlaceholder"),
    allStatuses: t("leadersTab.allStatuses"),
    addLeader: t("leadersTab.addLeader"),
    noLeaders: t("leadersTab.noLeaders"),
    noResults: t("leadersTab.noResults"),
    active: t("leadersTab.active"),
    inactive: t("leadersTab.inactive"),
    deleteConfirm: t("leadersTab.deleteConfirm"),
    deleteWarning: t("leadersTab.deleteWarning"),
    sheet: {
      addTitle: t("leadersTab.sheet.addTitle"),
      editTitle: t("leadersTab.sheet.editTitle"),
      selectUser: t("leadersTab.sheet.selectUser"),
      noAvailableUsers: t("leadersTab.sheet.noAvailableUsers"),
      basicInfo: t("leadersTab.sheet.basicInfo"),
      name: t("leadersTab.sheet.name"),
      dharmaName: t("leadersTab.sheet.dharmaName"),
      yearOfBirth: t("leadersTab.sheet.yearOfBirth"),
      fullDateOfBirth: t("leadersTab.sheet.fullDateOfBirth"),
      unit: t("leadersTab.sheet.unit"),
      level: t("leadersTab.sheet.level"),
      status: t("leadersTab.sheet.status"),
      contact: t("leadersTab.sheet.contact"),
      phone: t("leadersTab.sheet.phone"),
      address: t("leadersTab.sheet.address"),
      gdptInfo: t("leadersTab.sheet.gdptInfo"),
      gdptJoinDate: t("leadersTab.sheet.gdptJoinDate"),
      quyYDate: t("leadersTab.sheet.quyYDate"),
      quyYName: t("leadersTab.sheet.quyYName"),
      other: t("leadersTab.sheet.other"),
      placeOfOrigin: t("leadersTab.sheet.placeOfOrigin"),
      education: t("leadersTab.sheet.education"),
      occupation: t("leadersTab.sheet.occupation"),
      notes: t("leadersTab.sheet.notes"),
      active: t("leadersTab.active"),
      inactive: t("leadersTab.inactive"),
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/units">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{unit.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <UnitSheet
            unit={unit}
            allUnits={allUnits}
            translations={sheetTranslations}
            trigger="icon"
          />
          <DeleteUnitButton
            unitId={unit.id}
            unitName={unit.name}
            translations={deleteTranslations}
          />
        </div>
      </div>

      {/* Tabs */}
      <UnitTabsWrapper
        isAdmin={isAdmin}
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
              allUnits={allUnits}
              translations={studentsTabTranslations}
            />
          ),
          leaders: isAdmin ? (
            <LeadersTab
              unitId={unit.id}
              leaders={leaders}
              allUnits={allUnits}
              availableUsers={availableUsers}
              translations={leadersTabTranslations}
            />
          ) : undefined,
        }}
      />
    </div>
  );
}

import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Users, UserCheck } from "lucide-react";
import { UnitSheet } from "../unit-sheet";
import { DeleteUnitButton } from "./delete-button";
import { getUnit } from "@/lib/actions/unit-actions";
import { db } from "@/lib/db";
import { ClassesSection } from "./classes-section";

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

  const [unit, allUnits, classes, t, common] = await Promise.all([
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
    getTranslations("unit"),
    getTranslations("common"),
  ]);

  if (!unit) {
    notFound();
  }

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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("name")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("name")}</span>
              <span className="font-medium">{unit.name}</span>
            </div>
            {unit.description && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("description")}</span>
                <span>{unit.description}</span>
              </div>
            )}
            {unit.parent && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("parentUnit")}</span>
                <Link
                  href={`/admin/units/${unit.parent.id}`}
                  className="hover:underline text-primary"
                >
                  {unit.parent.name}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>{common("total")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">{t("students")}</span>
              </div>
              <Badge variant="secondary">{unit.students?.length || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">{t("leaders")}</span>
              </div>
              <Badge variant="secondary">{unit.leaders?.length || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Section */}
      <ClassesSection
        unitId={unit.id}
        classes={classes}
        translations={classesTranslations}
      />

      {/* Child Units */}
      {unit.children && unit.children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {unit.children.map((child) => (
                <Link key={child.id} href={`/admin/units/${child.id}`}>
                  <Badge variant="outline" className="hover:bg-muted cursor-pointer">
                    {child.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students Preview */}
      {unit.students && unit.students.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("students")}</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/students?unitId=${unit.id}`}>
                {common("view")}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unit.students.slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center justify-between text-sm">
                  <Link
                    href={`/admin/students/${student.id}`}
                    className="hover:underline"
                  >
                    {student.name}
                  </Link>
                  {student.dharmaName && (
                    <span className="text-muted-foreground">{student.dharmaName}</span>
                  )}
                </div>
              ))}
              {unit.students.length > 5 && (
                <p className="text-sm text-muted-foreground">
                  +{unit.students.length - 5} more...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaders Preview */}
      {unit.leaders && unit.leaders.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("leaders")}</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/leaders?unitId=${unit.id}`}>
                {common("view")}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unit.leaders.slice(0, 5).map((leader) => (
                <div key={leader.id} className="flex items-center justify-between text-sm">
                  <Link
                    href={`/admin/leaders/${leader.id}`}
                    className="hover:underline"
                  >
                    {leader.name}
                  </Link>
                  {leader.dharmaName && (
                    <span className="text-muted-foreground">{leader.dharmaName}</span>
                  )}
                </div>
              ))}
              {unit.leaders.length > 5 && (
                <p className="text-sm text-muted-foreground">
                  +{unit.leaders.length - 5} more...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

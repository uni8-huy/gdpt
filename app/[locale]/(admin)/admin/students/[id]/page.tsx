import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { StudentSheet } from "../student-sheet";
import { DeleteStudentButton } from "./delete-button";
import { getStudent, getUnits } from "@/lib/actions/student-actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params;
  const [student, t] = await Promise.all([
    getStudent(id),
    getTranslations({ locale, namespace: "student" }),
  ]);
  return {
    title: student ? `${student.name} - ${t("title")}` : `${t("title")} - Admin`,
  };
}

export default async function StudentDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [student, units, t, common, status] = await Promise.all([
    getStudent(id),
    getUnits(),
    getTranslations("student"),
    getTranslations("common"),
    getTranslations("status"),
  ]);

  if (!student) {
    notFound();
  }

  const deleteTranslations = {
    delete: common("delete"),
    deleting: common("deleting"),
    cancel: common("cancel"),
    deleteConfirm: t("deleteConfirm"),
    deleteWarning: t("deleteWarning"),
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/students">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{student.name}</h1>
          <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>
            {student.status === "ACTIVE" ? status("activeStudent") : status("inactiveStudent")}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <StudentSheet
            student={student}
            units={units}
            translations={sheetTranslations}
            trigger="icon"
          />
          <DeleteStudentButton
            studentId={student.id}
            studentName={student.name}
            translations={deleteTranslations}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("name")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("name")}</span>
              <span className="font-medium">{student.name}</span>
            </div>
            {student.dharmaName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("dharmaName")}</span>
                <span>{student.dharmaName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("dateOfBirth")}</span>
              <span>{formatDate(student.dateOfBirth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("gender")}</span>
              <span>{student.gender === "MALE" ? common("male") : common("female")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("unit")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("unit")}</span>
              <Link
                href={`/admin/units/${student.unitId}`}
                className="hover:underline text-primary"
              >
                {student.unit?.name || "-"}
              </Link>
            </div>
            {student.className && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("class")}</span>
                <span>{student.className}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("status")}</span>
              <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>
                {student.status === "ACTIVE" ? t("active") : t("inactive")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {student.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t("notes")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{student.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

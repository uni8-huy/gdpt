import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "parent.children" });
  const roles = await getTranslations({ locale, namespace: "roles" });
  return {
    title: `${t("title")} - ${roles("parent")}`,
  };
}

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function formatDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US").format(new Date(date));
}

export default async function ParentChildrenPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireRole(["PARENT", "ADMIN"], locale);
  const t = await getTranslations("parent.children");
  const student = await getTranslations("student");
  const common = await getTranslations("common");
  const status = await getTranslations("status");

  // Get parent's children with full details
  const parentStudents = await db.parentStudent.findMany({
    where: { parentId: session.user.id },
    include: {
      student: {
        include: { unit: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {parentStudents.length > 0 ? (
        <div className="space-y-4">
          {parentStudents.map(({ student: studentData, relation }) => (
            <Card key={studentData.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{studentData.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{relation}</Badge>
                    <Badge
                      variant={studentData.status === "ACTIVE" ? "success" : "secondary"}
                    >
                      {studentData.status === "ACTIVE" ? status("activeStudent") : status("inactiveStudent")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    {studentData.dharmaName && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{student("dharmaName")}</span>
                        <span>{studentData.dharmaName}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{student("dateOfBirth")}</span>
                      <span>{formatDate(studentData.dateOfBirth, locale)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("age")}</span>
                      <span>{calculateAge(studentData.dateOfBirth)} {t("yearsOld")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{student("gender")}</span>
                      <span>{studentData.gender === "MALE" ? common("male") : common("female")}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{student("unit")}</span>
                      <span>{studentData.unit.name}</span>
                    </div>
                    {studentData.className && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{student("class")}</span>
                        <span>{studentData.className}</span>
                      </div>
                    )}
                  </div>
                </div>
                {studentData.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">{student("notes")}:</span> {studentData.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{t("noChildren")}</p>
            <p className="text-sm text-muted-foreground mt-2">{t("contactAdmin")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

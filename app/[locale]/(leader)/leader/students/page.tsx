import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/session";
import { db } from "@/lib/db";
import { getLeaderStudents, getLeaderClasses } from "@/lib/actions/leader-student-actions";
import { StudentSheet } from "./student-sheet";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  const roles = await getTranslations({ locale, namespace: "roles" });
  return {
    title: `${t("students")} - ${roles("leader")}`,
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

export default async function LeaderStudentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("student");
  const leader = await getTranslations("leader");
  const common = await getTranslations("common");
  const status = await getTranslations("status");

  const session = await requireRole(["LEADER", "ADMIN"], locale);

  // Get leader's unit
  const leaderProfile = await db.youthLeader.findUnique({
    where: { userId: session.user.id },
    select: { unitId: true, unit: { select: { name: true } } },
  });

  if (!leaderProfile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{leader("noProfile")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get students and classes using leader actions
  const students = await getLeaderStudents(session.user.id);
  const classes = await getLeaderClasses(session.user.id);

  const activeStudents = students.filter((s) => s.status === "ACTIVE");
  const inactiveStudents = students.filter((s) => s.status === "INACTIVE");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("unit")}: {leaderProfile.unit.name} • {activeStudents.length} {leader("studentsInUnit")}
          </p>
        </div>
        <StudentSheet
          classes={classes}
          userId={session.user.id}
          translations={{
            addNew: t("addNew"),
            edit: t("name"),
            name: t("name"),
            dharmaName: t("dharmaName"),
            dateOfBirth: t("dateOfBirth"),
            gender: t("gender"),
            class: t("class"),
            selectClass: t("selectClass"),
            noClass: t("noClass"),
            status: t("status"),
            notes: t("notes"),
            male: common("male"),
            female: common("female"),
            active: status("active"),
            inactive: status("inactive"),
            common: {
              save: common("save"),
              saving: common("saving"),
              cancel: common("cancel"),
              tryAgain: common("tryAgain"),
            },
          }}
        />
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{leader("noStudentsInUnit")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Students */}
          {activeStudents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {status("activeStudent")}
                  <Badge variant="success">{activeStudents.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeStudents.map((studentData) => (
                    <div
                      key={studentData.id}
                      className="border rounded-lg p-4 space-y-2 relative group"
                    >
                      <div className="font-medium">{studentData.name}</div>
                      {studentData.dharmaName && (
                        <div className="text-sm text-muted-foreground">
                          {t("dharmaName")}: {studentData.dharmaName}
                        </div>
                      )}
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>{calculateAge(studentData.dateOfBirth)} {locale === "vi" ? "tuổi" : "y/o"}</span>
                        <span>•</span>
                        <span>{studentData.gender === "MALE" ? common("male") : common("female")}</span>
                      </div>
                      {studentData.class?.name && (
                        <Badge variant="outline" className="text-xs">
                          {studentData.class.name}
                        </Badge>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <StudentSheet
                          student={studentData}
                          classes={classes}
                          userId={session.user.id}
                          translations={{
                            addNew: t("addNew"),
                            edit: common("edit"),
                            name: t("name"),
                            dharmaName: t("dharmaName"),
                            dateOfBirth: t("dateOfBirth"),
                            gender: t("gender"),
                            class: t("class"),
                            selectClass: t("selectClass"),
                            noClass: t("noClass"),
                            status: t("status"),
                            notes: t("notes"),
                            male: common("male"),
                            female: common("female"),
                            active: status("active"),
                            inactive: status("inactive"),
                            deactivate: leader("deactivate") || "Deactivate",
                            confirmDeactivate: leader("confirmDeactivate") || "Deactivate this student?",
                            common: {
                              save: common("save"),
                              saving: common("saving"),
                              cancel: common("cancel"),
                              tryAgain: common("tryAgain"),
                            },
                          }}
                          trigger="icon"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inactive Students */}
          {inactiveStudents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {status("inactiveStudent")}
                  <Badge variant="secondary">{inactiveStudents.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {inactiveStudents.map((studentData) => (
                    <div
                      key={studentData.id}
                      className="border rounded-lg p-4 space-y-2 opacity-70"
                    >
                      <div className="font-medium">{studentData.name}</div>
                      {studentData.dharmaName && (
                        <div className="text-sm text-muted-foreground">
                          {t("dharmaName")}: {studentData.dharmaName}
                        </div>
                      )}
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>{calculateAge(studentData.dateOfBirth)} {locale === "vi" ? "tuổi" : "y/o"}</span>
                        <span>•</span>
                        <span>{studentData.gender === "MALE" ? common("male") : common("female")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

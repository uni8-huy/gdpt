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
  const t = await getTranslations({ locale, namespace: "nav" });
  return {
    title: `${t("students")} - Huynh trưởng`,
  };
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
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
            <p className="text-muted-foreground">
              Bạn chưa có hồ sơ huynh trưởng. Vui lòng liên hệ Ban Điều Hành.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get students in unit
  const students = await db.student.findMany({
    where: { unitId: leaderProfile.unitId },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });

  const activeStudents = students.filter((s) => s.status === "ACTIVE");
  const inactiveStudents = students.filter((s) => s.status === "INACTIVE");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">
          Đơn vị: {leaderProfile.unit.name} • {activeStudents.length} đoàn sinh đang sinh hoạt
        </p>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Chưa có đoàn sinh trong đơn vị</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Students */}
          {activeStudents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Đang sinh hoạt
                  <Badge variant="success">{activeStudents.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeStudents.map((student) => (
                    <div
                      key={student.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="font-medium">{student.name}</div>
                      {student.dharmaName && (
                        <div className="text-sm text-muted-foreground">
                          Pháp danh: {student.dharmaName}
                        </div>
                      )}
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>{calculateAge(student.dateOfBirth)} tuổi</span>
                        <span>•</span>
                        <span>{student.gender === "MALE" ? "Nam" : "Nữ"}</span>
                      </div>
                      {student.className && (
                        <Badge variant="outline" className="text-xs">
                          {student.className}
                        </Badge>
                      )}
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
                  Nghỉ sinh hoạt
                  <Badge variant="secondary">{inactiveStudents.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {inactiveStudents.map((student) => (
                    <div
                      key={student.id}
                      className="border rounded-lg p-4 space-y-2 opacity-70"
                    >
                      <div className="font-medium">{student.name}</div>
                      {student.dharmaName && (
                        <div className="text-sm text-muted-foreground">
                          Pháp danh: {student.dharmaName}
                        </div>
                      )}
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>{calculateAge(student.dateOfBirth)} tuổi</span>
                        <span>•</span>
                        <span>{student.gender === "MALE" ? "Nam" : "Nữ"}</span>
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

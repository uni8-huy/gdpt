import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata() {
  return {
    title: "Con em - Phụ huynh",
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
}

export default async function ParentChildrenPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireRole(["PARENT", "ADMIN"], locale);

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
        <h1 className="text-2xl font-bold">Con em</h1>
        <p className="text-muted-foreground">
          Thông tin chi tiết về con em đang sinh hoạt tại Gia Đình Phật Tử
        </p>
      </div>

      {parentStudents.length > 0 ? (
        <div className="space-y-4">
          {parentStudents.map(({ student, relation }) => (
            <Card key={student.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{student.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{relation}</Badge>
                    <Badge
                      variant={student.status === "ACTIVE" ? "success" : "secondary"}
                    >
                      {student.status === "ACTIVE" ? "Đang sinh hoạt" : "Nghỉ"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    {student.dharmaName && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pháp danh</span>
                        <span>{student.dharmaName}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ngày sinh</span>
                      <span>{formatDate(student.dateOfBirth)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tuổi</span>
                      <span>{calculateAge(student.dateOfBirth)} tuổi</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giới tính</span>
                      <span>{student.gender === "MALE" ? "Nam" : "Nữ"}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Đơn vị</span>
                      <span>{student.unit.name}</span>
                    </div>
                    {student.className && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Lớp</span>
                        <span>{student.className}</span>
                      </div>
                    )}
                  </div>
                </div>
                {student.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Ghi chú:</span> {student.notes}
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
            <p className="text-muted-foreground">
              Chưa có thông tin con em được liên kết với tài khoản của bạn.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Vui lòng liên hệ Ban Điều Hành để được hỗ trợ.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

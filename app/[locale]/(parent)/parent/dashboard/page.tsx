import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/session";
import { db } from "@/lib/db";
import { Users, Calendar, Bell } from "lucide-react";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return {
    title: `${t("dashboard")} - Phụ huynh`,
  };
}

export default async function ParentDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireRole(["PARENT", "ADMIN"], locale);

  // Get parent's children
  const parentStudents = await db.parentStudent.findMany({
    where: { parentId: session.user.id },
    include: {
      student: {
        include: { unit: true },
      },
    },
  });

  // Get upcoming events
  const upcomingEvents = await db.event.findMany({
    where: {
      startDate: { gte: new Date() },
      targetRoles: { has: "PARENT" },
    },
    orderBy: { startDate: "asc" },
    take: 5,
  });

  // Get latest announcements
  const announcements = await db.announcement.findMany({
    where: {
      isPublished: true,
      targetRoles: { has: "PARENT" },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const activeChildren = parentStudents.filter(
    (ps) => ps.student.status === "ACTIVE"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Xin chào, {session.user.name || "Phụ huynh"}!
        </h1>
        <p className="text-muted-foreground">
          Chào mừng bạn đến với cổng thông tin Gia Đình Phật Tử
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con em</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeChildren.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sự kiện</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thông báo</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Children */}
      <Card>
        <CardHeader>
          <CardTitle>Con em của bạn</CardTitle>
        </CardHeader>
        <CardContent>
          {parentStudents.length > 0 ? (
            <div className="space-y-3">
              {parentStudents.map(({ student, relation }) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between border rounded-lg p-3"
                >
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {student.unit.name}
                      {student.className && ` • ${student.className}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {relation}
                    </Badge>
                    <Badge
                      variant={student.status === "ACTIVE" ? "success" : "secondary"}
                    >
                      {student.status === "ACTIVE" ? "Đang sinh hoạt" : "Nghỉ"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                Chưa có thông tin con em. Vui lòng liên hệ Ban Điều Hành để được cập nhật.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Sự kiện sắp tới</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 text-sm">
                    <div className="flex-shrink-0 w-12 text-center">
                      <div className="font-bold text-primary">
                        {new Date(event.startDate).getDate()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Th{new Date(event.startDate).getMonth() + 1}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{event.title}</div>
                      {event.location && (
                        <div className="text-xs text-muted-foreground">
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-2">
                Không có sự kiện sắp tới
              </p>
            )}
            <Link
              href="/parent/calendar"
              className="text-sm text-primary hover:underline block text-center mt-4"
            >
              Xem tất cả
            </Link>
          </CardContent>
        </Card>

        {/* Latest Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>Thông báo mới</CardTitle>
          </CardHeader>
          <CardContent>
            {announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="text-sm">
                    <div className="font-medium">{ann.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {ann.publishedAt &&
                        new Intl.DateTimeFormat("vi-VN").format(
                          new Date(ann.publishedAt)
                        )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-2">
                Không có thông báo mới
              </p>
            )}
            <Link
              href="/parent/announcements"
              className="text-sm text-primary hover:underline block text-center mt-4"
            >
              Xem tất cả
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

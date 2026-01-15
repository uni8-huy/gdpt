import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/session";
import { db } from "@/lib/db";
import { Calendar, Users, BookOpen, Bell } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return {
    title: `${t("dashboard")} - Huynh trưởng`,
  };
}

export default async function LeaderDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  const session = await requireRole(["LEADER", "ADMIN"], locale);

  // Get leader's profile and their unit info
  const leaderProfile = await db.youthLeader.findUnique({
    where: { userId: session.user.id },
    include: {
      unit: true,
      timeline: {
        orderBy: { startYear: "desc" },
        take: 1,
        include: { unit: true },
      },
      trainingRecords: {
        orderBy: { year: "desc" },
        take: 3,
      },
    },
  });

  // Get upcoming events
  const upcomingEvents = await db.event.findMany({
    where: {
      startDate: { gte: new Date() },
      targetRoles: { has: "LEADER" },
    },
    orderBy: { startDate: "asc" },
    take: 5,
  });

  // Get latest announcements
  const announcements = await db.announcement.findMany({
    where: {
      isPublished: true,
      targetRoles: { has: "LEADER" },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  // Get students in unit (if leader has unit)
  const studentsCount = leaderProfile?.unitId
    ? await db.student.count({
        where: { unitId: leaderProfile.unitId, status: "ACTIVE" },
      })
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Xin chào, {session.user.name || "Huynh trưởng"}!</h1>
        <p className="text-muted-foreground">
          {leaderProfile ? `${leaderProfile.unit.name}` : "Chưa có hồ sơ huynh trưởng"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đoàn sinh</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount}</div>
            <p className="text-xs text-muted-foreground">Trong đơn vị</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bậc tu học</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaderProfile?.level || "-"}</div>
            <p className="text-xs text-muted-foreground">
              {leaderProfile?.trainingRecords[0]?.campName || "Chưa có"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sự kiện</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">Sắp diễn ra</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thông báo</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">Mới nhất</p>
          </CardContent>
        </Card>
      </div>

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
                        <div className="text-xs text-muted-foreground">{event.location}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Không có sự kiện sắp tới</p>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
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
                        new Intl.DateTimeFormat("vi-VN").format(new Date(ann.publishedAt))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Không có thông báo mới</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Role */}
      {leaderProfile?.timeline[0] && (
        <Card>
          <CardHeader>
            <CardTitle>Vai trò hiện tại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                {leaderProfile.timeline[0].role}
              </Badge>
              <span className="text-sm text-muted-foreground">
                tại {leaderProfile.timeline[0].unit.name}
              </span>
              <span className="text-xs text-muted-foreground">
                (từ {leaderProfile.timeline[0].startYear})
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

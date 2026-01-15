import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/session";
import { db } from "@/lib/db";
import { Calendar, MapPin, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return {
    title: `${t("events")} - Huynh trưởng`,
  };
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function LeaderCalendarPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("event");

  await requireRole(["LEADER", "ADMIN"], locale);

  // Get events for leaders
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [upcomingEvents, pastEvents] = await Promise.all([
    db.event.findMany({
      where: {
        startDate: { gte: now },
        targetRoles: { has: "LEADER" },
      },
      orderBy: { startDate: "asc" },
    }),
    db.event.findMany({
      where: {
        startDate: { lt: now, gte: startOfMonth },
        targetRoles: { has: "LEADER" },
      },
      orderBy: { startDate: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">Lịch các hoạt động và sự kiện</p>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sắp diễn ra
            {upcomingEvents.length > 0 && (
              <Badge variant="default">{upcomingEvents.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="font-medium text-lg">{event.title}</div>
                    {event.isPublic && (
                      <Badge variant="outline" className="text-xs">
                        Công khai
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatDateTime(event.startDate)}</span>
                    {event.endDate && (
                      <>
                        <span>-</span>
                        <span>{formatTime(event.endDate)}</span>
                      </>
                    )}
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  {event.description && (
                    <p className="text-sm mt-2">{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Không có sự kiện sắp tới
            </p>
          )}
        </CardContent>
      </Card>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              Đã diễn ra trong tháng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 text-sm opacity-70"
                >
                  <div className="flex-shrink-0 w-16 text-right text-muted-foreground">
                    {new Intl.DateTimeFormat("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    }).format(new Date(event.startDate))}
                  </div>
                  <div className="flex-1">{event.title}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

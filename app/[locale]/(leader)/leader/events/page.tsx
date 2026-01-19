import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/session";
import { db } from "@/lib/db";
import { getLeaderEvents } from "@/lib/actions/leader-event-actions";
import { EventSheet } from "./event-sheet";
import { Calendar, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  const roles = await getTranslations({ locale, namespace: "roles" });
  return {
    title: `${t("events")} - ${roles("leader")}`,
  };
}

function formatDateTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default async function LeaderEventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("event");
  const leader = await getTranslations("leader");
  const common = await getTranslations("common");

  const session = await requireRole(["LEADER", "ADMIN"], locale);

  // Check for leader profile
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

  // Get events using leader action
  const events = await getLeaderEvents(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            {leaderProfile.unit.name} • {events.length} {t("title").toLowerCase()}
          </p>
        </div>
        <EventSheet
          userId={session.user.id}
          translations={{
            addNew: t("addNew"),
            edit: common("edit"),
            name: t("name"),
            description: t("description"),
            startDate: t("startDate"),
            endDate: t("endDate"),
            location: t("location"),
            isPublic: t("isPublic"),
            publicOnHome: t("publicOnHome"),
            eventInfo: t("eventInfo"),
            displaySettings: t("displaySettings"),
            common: {
              save: common("save"),
              saving: common("saving"),
              cancel: common("cancel"),
              tryAgain: common("tryAgain"),
            },
          }}
        />
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No events yet. Create the first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const canEdit = event.createdBy === session.user.id;
            return (
              <Card key={event.id} className="relative group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    {canEdit && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <EventSheet
                          event={event}
                          userId={session.user.id}
                          translations={{
                            addNew: t("addNew"),
                            edit: common("edit"),
                            name: t("name"),
                            description: t("description"),
                            startDate: t("startDate"),
                            endDate: t("endDate"),
                            location: t("location"),
                            isPublic: t("isPublic"),
                            publicOnHome: t("publicOnHome"),
                            eventInfo: t("eventInfo"),
                            displaySettings: t("displaySettings"),
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
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateTime(event.startDate, locale)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {event.isPublic && (
                      <Badge variant="secondary" className="text-xs">
                        Public
                      </Badge>
                    )}
                    {!canEdit && (
                      <Badge variant="outline" className="text-xs">
                        View Only
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

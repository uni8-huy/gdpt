import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, MapPin, Calendar, Globe, Users } from "lucide-react";
import { EventSheet } from "../event-sheet";
import { DeleteEventButton } from "./delete-button";
import { getEvent } from "@/lib/actions/event-actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params;
  const [event, t] = await Promise.all([
    getEvent(id),
    getTranslations({ locale, namespace: "event" }),
  ]);
  return {
    title: event ? `${event.title} - ${t("title")}` : `${t("title")} - Admin`,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [event, t, common, roles] = await Promise.all([
    getEvent(id),
    getTranslations("event"),
    getTranslations("common"),
    getTranslations("roles"),
  ]);

  if (!event) {
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
    title: t("title"),
    description: t("description"),
    startDate: t("startDate"),
    endDate: t("endDate"),
    location: t("location"),
    isPublic: t("isPublic"),
    targetRoles: t("targetRoles"),
    publicOnHome: t("publicOnHome"),
    roles: {
      admin: roles("admin"),
      leader: roles("leader"),
      parent: roles("parent"),
    },
    common: {
      save: common("save"),
      saving: common("saving"),
      cancel: common("cancel"),
      tryAgain: common("tryAgain"),
    },
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const roleLabels: Record<string, string> = {
    ADMIN: roles("admin"),
    LEADER: roles("leader"),
    PARENT: roles("parent"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/events">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          {event.isPublic && (
            <Badge variant="default">
              <Globe className="h-3 w-3 mr-1" />
              {t("isPublic")}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <EventSheet
            event={event}
            translations={sheetTranslations}
            trigger="icon"
          />
          <DeleteEventButton
            eventId={event.id}
            eventTitle={event.title}
            translations={deleteTranslations}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t("eventInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("startDate")}</span>
              <span>{formatDateTime(event.startDate)}</span>
            </div>
            {event.endDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("endDate")}</span>
                <span>{formatDateTime(event.endDate)}</span>
              </div>
            )}
            {event.location && (
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {t("location")}
                </span>
                <span>{event.location}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("displaySettings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("isPublic")}</span>
              <Badge variant={event.isPublic ? "default" : "secondary"}>
                {event.isPublic ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">{t("targetRoles")}</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {event.targetRoles.map((role) => (
                  <Badge key={role} variant="outline">
                    {roleLabels[role] || role}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {event.description && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t("description")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

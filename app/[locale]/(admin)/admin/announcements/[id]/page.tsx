import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, FileText, Users } from "lucide-react";
import { AnnouncementSheet } from "../announcement-sheet";
import { DeleteAnnouncementButton } from "./delete-button";
import { getAnnouncement } from "@/lib/actions/announcement-actions";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params;
  const [announcement, t] = await Promise.all([
    getAnnouncement(id),
    getTranslations({ locale, namespace: "announcement" }),
  ]);
  return {
    title: announcement ? `${announcement.title} - ${t("title")}` : `${t("title")} - Admin`,
  };
}

export default async function AnnouncementDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [session, announcement, t, common, roles] = await Promise.all([
    requireRole("ADMIN", locale),
    getAnnouncement(id),
    getTranslations("announcement"),
    getTranslations("common"),
    getTranslations("roles"),
  ]);

  if (!announcement) {
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
    content: t("content"),
    isPublished: t("isPublished"),
    isPublic: t("isPublic"),
    publicOnLanding: t("publicOnLanding"),
    targetRoles: t("targetRoles"),
    publishNow: t("publishNow"),
    draftNote: t("draftNote"),
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
            <Link href="/admin/announcements">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{announcement.title}</h1>
          <Badge variant={announcement.isPublished ? "default" : "secondary"}>
            {announcement.isPublished ? t("isPublished") : "Draft"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <AnnouncementSheet
            announcement={announcement}
            authorId={session.user.id}
            translations={sheetTranslations}
            trigger="icon"
          />
          <DeleteAnnouncementButton
            announcementId={announcement.id}
            announcementTitle={announcement.title}
            translations={deleteTranslations}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("publishedAt")}</span>
              <span>{announcement.publishedAt ? formatDateTime(announcement.publishedAt) : "-"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("targetRoles")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("isPublished")}</span>
              <Badge variant={announcement.isPublished ? "default" : "secondary"}>
                {announcement.isPublished ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">{t("targetRoles")}</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {announcement.targetRoles.map((role) => (
                  <Badge key={role} variant="outline">
                    {roleLabels[role] || role}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("content")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

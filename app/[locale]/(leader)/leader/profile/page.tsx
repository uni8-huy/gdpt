import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Calendar, GraduationCap, Briefcase, Pencil, Plus } from "lucide-react";
import { requireRole } from "@/lib/session";
import { getMyProfile } from "@/lib/actions/profile-actions";
import { NoProfile } from "./no-profile";
import { TimelineSection } from "./timeline-section";
import { TrainingSection } from "./training-section";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return {
    title: t("profile"),
  };
}

function formatDate(date: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
}

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireRole(["LEADER", "ADMIN"], locale);
  const profile = await getMyProfile(session.user.id);

  const t = await getTranslations("leader");
  const common = await getTranslations("common");
  const status = await getTranslations("status");

  if (!profile) {
    return <NoProfile translations={{ noProfile: t("noProfile") }} />;
  }

  const timelineTranslations = {
    timeline: t("timeline"),
    role: t("role"),
    unit: t("unit"),
    startYear: t("startYear"),
    endYear: t("endYear"),
    current: common("current"),
    add: common("add"),
    delete: common("delete"),
    noData: common("noData"),
    notes: t("notes"),
    selectUnit: t("selectUnit"),
  };

  const trainingTranslations = {
    training: t("training"),
    campName: t("campName"),
    year: t("year"),
    region: t("region"),
    level: t("level"),
    add: common("add"),
    delete: common("delete"),
    noData: common("noData"),
    notes: t("notes"),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          {profile.dharmaName && (
            <p className="text-muted-foreground">
              {t("dharmaName")}: {profile.dharmaName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={profile.status === "ACTIVE" ? "success" : "secondary"}>
            {profile.status === "ACTIVE" ? status("active") : status("inactive")}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href="/leader/profile/edit">
              <Pencil className="h-4 w-4 mr-2" />
              {common("edit")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("yearOfBirth")}</span>
              <span>{profile.yearOfBirth}</span>
            </div>
            {profile.fullDateOfBirth && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("fullDateOfBirth")}</span>
                <span>{formatDate(profile.fullDateOfBirth)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("unit")}</span>
              <span>{profile.unit.name}</span>
            </div>
            {profile.level && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("level")}</span>
                <Badge variant="outline">{profile.level}</Badge>
              </div>
            )}
            {profile.placeOfOrigin && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("placeOfOrigin")}</span>
                <span>{profile.placeOfOrigin}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quy Y Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("gdptInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.gdptJoinDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("gdptJoinDate")}</span>
                <span>{formatDate(profile.gdptJoinDate)}</span>
              </div>
            )}
            {profile.quyYDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("quyYDate")}</span>
                <span>{formatDate(profile.quyYDate)}</span>
              </div>
            )}
            {profile.quyYName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("quyYName")}</span>
                <span>{profile.quyYName}</span>
              </div>
            )}
            {!profile.gdptJoinDate && !profile.quyYDate && !profile.quyYName && (
              <p className="text-muted-foreground">{common("noData")}</p>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("contactInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("phone")}</span>
                <span>{profile.phone}</span>
              </div>
            )}
            {profile.user?.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{common("email")}</span>
                <span className="text-sm">{profile.user.email}</span>
              </div>
            )}
            {profile.address && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("address")}</span>
                <span className="text-sm text-right max-w-[200px]">
                  {profile.address}
                </span>
              </div>
            )}
            {!profile.phone && !profile.user?.email && !profile.address && (
              <p className="text-muted-foreground">{common("noData")}</p>
            )}
          </CardContent>
        </Card>

        {/* Education & Work */}
        <Card>
          <CardHeader>
            <CardTitle>{t("educationWork")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.education && (
              <div className="flex items-start gap-2">
                <GraduationCap className="h-4 w-4 mt-1 text-muted-foreground" />
                <span>{profile.education}</span>
              </div>
            )}
            {profile.occupation && (
              <div className="flex items-start gap-2">
                <Briefcase className="h-4 w-4 mt-1 text-muted-foreground" />
                <span>{profile.occupation}</span>
              </div>
            )}
            {!profile.education && !profile.occupation && (
              <p className="text-muted-foreground">{common("noData")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <TimelineSection
        userId={session.user.id}
        entries={profile.timeline}
        translations={timelineTranslations}
      />

      {/* Training Records */}
      <TrainingSection
        userId={session.user.id}
        records={profile.trainingRecords}
        translations={trainingTranslations}
      />

      {/* Notes */}
      {profile.notes && (
        <Card>
          <CardHeader>
            <CardTitle>{t("notes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{profile.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

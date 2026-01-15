import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Calendar, MapPin, GraduationCap, Briefcase, Pencil, Trash2 } from "lucide-react";
import { DeleteLeaderButton } from "./delete-button";
import { getLeader } from "@/lib/actions/leader-actions";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params;
  const [leader, t] = await Promise.all([
    getLeader(id),
    getTranslations({ locale, namespace: "leader" }),
  ]);
  return {
    title: leader ? `${leader.name} - ${t("title")}` : `${t("title")} - Admin`,
  };
}

function formatDate(date: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
}

export default async function LeaderDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("leader");
  const common = await getTranslations("common");
  const status = await getTranslations("status");

  const leader = await getLeader(id);

  if (!leader) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/leaders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{leader.name}</h1>
            {leader.dharmaName && (
              <p className="text-muted-foreground">
                {t("dharmaName")}: {leader.dharmaName}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={leader.status === "ACTIVE" ? "success" : "secondary"}>
            {leader.status === "ACTIVE" ? status("active") : status("inactive")}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/leaders/${leader.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              {common("edit")}
            </Link>
          </Button>
          <DeleteLeaderButton leaderId={leader.id} leaderName={leader.name} />
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
              <span>{leader.yearOfBirth}</span>
            </div>
            {leader.fullDateOfBirth && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("fullDateOfBirth")}</span>
                <span>{formatDate(leader.fullDateOfBirth)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("unit")}</span>
              <span>{leader.unit.name}</span>
            </div>
            {leader.level && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("level")}</span>
                <Badge variant="outline">{leader.level}</Badge>
              </div>
            )}
            {leader.placeOfOrigin && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("placeOfOrigin")}</span>
                <span>{leader.placeOfOrigin}</span>
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
            {leader.gdptJoinDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("gdptJoinDate")}</span>
                <span>{formatDate(leader.gdptJoinDate)}</span>
              </div>
            )}
            {leader.quyYDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("quyYDate")}</span>
                <span>{formatDate(leader.quyYDate)}</span>
              </div>
            )}
            {leader.quyYName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("quyYName")}</span>
                <span>{leader.quyYName}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("contactInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leader.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("phone")}</span>
                <span>{leader.phone}</span>
              </div>
            )}
            {leader.user?.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{common("email")}</span>
                <span className="text-sm">{leader.user.email}</span>
              </div>
            )}
            {leader.address && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("address")}</span>
                <span className="text-sm text-right max-w-[200px]">
                  {leader.address}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Education & Work */}
        <Card>
          <CardHeader>
            <CardTitle>{t("educationWork")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leader.education && (
              <div className="flex items-start gap-2">
                <GraduationCap className="h-4 w-4 mt-1 text-muted-foreground" />
                <span>{leader.education}</span>
              </div>
            )}
            {leader.occupation && (
              <div className="flex items-start gap-2">
                <Briefcase className="h-4 w-4 mt-1 text-muted-foreground" />
                <span>{leader.occupation}</span>
              </div>
            )}
            {!leader.education && !leader.occupation && (
              <p className="text-muted-foreground">{common("noData")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>{t("timeline")}</CardTitle>
        </CardHeader>
        <CardContent>
          {leader.timeline.length > 0 ? (
            <div className="space-y-4">
              {leader.timeline.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 border-l-2 border-primary pl-4 pb-4"
                >
                  <div className="flex-1">
                    <div className="font-medium">{entry.role}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.unit.name}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {entry.startYear} - {entry.endYear || common("current")}
                    </div>
                    {entry.notes && (
                      <p className="text-sm mt-1">{entry.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{common("noData")}</p>
          )}
        </CardContent>
      </Card>

      {/* Training Records */}
      <Card>
        <CardHeader>
          <CardTitle>{t("training")}</CardTitle>
        </CardHeader>
        <CardContent>
          {leader.trainingRecords.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {leader.trainingRecords.map((record) => (
                <div
                  key={record.id}
                  className="border rounded-lg p-3 space-y-1"
                >
                  <div className="font-medium">{record.campName}</div>
                  <div className="text-sm">
                    {t("level")}: <Badge variant="outline">{record.level}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("year")} {record.year}
                    {record.region && ` - ${record.region}`}
                  </div>
                  {record.notes && (
                    <p className="text-sm text-muted-foreground">
                      {record.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{common("noData")}</p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {leader.notes && (
        <Card>
          <CardHeader>
            <CardTitle>{t("notes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{leader.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

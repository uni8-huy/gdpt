import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCards } from "@/components/admin/stats-cards";
import { db } from "@/lib/db";

// Force dynamic rendering for database queries
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return {
    title: `${t("dashboard")} - Admin`,
  };
}

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  // Fetch stats from database
  const [usersCount, studentsCount, leadersCount, eventsCount] =
    await Promise.all([
      db.user.count(),
      db.student.count(),
      db.youthLeader.count(),
      db.event.count(),
    ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("dashboard")}</h1>

      {/* Stats Grid */}
      <StatsCards
        stats={{
          users: usersCount,
          students: studentsCount,
          leaders: leadersCount,
          events: eventsCount,
        }}
        labels={{
          users: "Người dùng",
          students: t("students"),
          leaders: t("leaders"),
          events: t("events"),
        }}
      />

      {/* Placeholder for recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chưa có hoạt động</p>
        </CardContent>
      </Card>
    </div>
  );
}

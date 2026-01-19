import { getTranslations, setRequestLocale } from "next-intl/server";
import { StatsCards } from "@/components/admin/stats-cards";
import { PendingSubmissions } from "./pending-submissions";
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
  const stats = await getTranslations("admin.dashboard.stats");
  const submissions = await getTranslations("submissions");

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
          users: stats("users"),
          usersDesc: stats("usersDesc"),
          students: stats("students"),
          studentsDesc: stats("studentsDesc"),
          leaders: stats("leaders"),
          leadersDesc: stats("leadersDesc"),
          events: stats("events"),
          eventsDesc: stats("eventsDesc"),
        }}
      />

      {/* Pending Submissions Widget */}
      <PendingSubmissions
        translations={{
          pendingRegistrations: submissions("pendingRegistrations"),
          noPending: submissions("noPending"),
          viewAll: submissions("viewAll"),
          submittedOn: submissions("submittedOn"),
        }}
        locale={locale}
      />
    </div>
  );
}

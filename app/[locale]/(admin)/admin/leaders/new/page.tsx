import { setRequestLocale, getTranslations } from "next-intl/server";
import { LeaderForm } from "../leader-form";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "leader" });
  return {
    title: `${t("addNew")} - Admin`,
  };
}

export default async function NewLeaderPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch units and available users (those without a leader profile)
  const [units, availableUsers] = await Promise.all([
    db.unit.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.user.findMany({
      where: {
        leaderProfile: null,
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Thêm huynh trưởng mới</h1>
      <LeaderForm units={units} availableUsers={availableUsers} locale={locale} />
    </div>
  );
}

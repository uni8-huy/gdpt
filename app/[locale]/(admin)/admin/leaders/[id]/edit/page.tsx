import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { LeaderForm } from "../../leader-form";
import { getLeader } from "@/lib/actions/leader-actions";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const leader = await getLeader(id);
  return {
    title: leader ? `Chỉnh sửa ${leader.name} - Admin` : "Huynh trưởng - Admin",
  };
}

export default async function EditLeaderPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [leader, units] = await Promise.all([
    getLeader(id),
    db.unit.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!leader) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa: {leader.name}</h1>
      <LeaderForm
        leader={leader}
        units={units}
        availableUsers={[]}
        locale={locale}
      />
    </div>
  );
}

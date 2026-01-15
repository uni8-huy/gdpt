import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { UnitForm } from "../unit-form";
import { getUnit } from "@/lib/actions/unit-actions";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const unit = await getUnit(id);
  return {
    title: unit ? `${unit.name} - Admin` : "Đơn vị - Admin",
  };
}

export default async function UnitDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [unit, allUnits] = await Promise.all([
    getUnit(id),
    db.unit.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!unit) {
    notFound();
  }

  return (
    <div className="max-w-xl">
      <UnitForm unit={unit} allUnits={allUnits} locale={locale} />
    </div>
  );
}

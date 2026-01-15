import { setRequestLocale } from "next-intl/server";
import { UnitForm } from "../unit-form";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata() {
  return {
    title: "Thêm đơn vị - Admin",
  };
}

export default async function NewUnitPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const allUnits = await db.unit.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-xl">
      <UnitForm allUnits={allUnits} locale={locale} />
    </div>
  );
}

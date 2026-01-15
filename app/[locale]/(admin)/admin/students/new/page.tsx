import { setRequestLocale } from "next-intl/server";
import { StudentForm } from "../student-form";
import { getUnits } from "@/lib/actions/student-actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata() {
  return {
    title: "Thêm đoàn sinh - Admin",
  };
}

export default async function NewStudentPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const units = await getUnits();

  return (
    <div className="max-w-2xl">
      <StudentForm units={units} locale={locale} />
    </div>
  );
}

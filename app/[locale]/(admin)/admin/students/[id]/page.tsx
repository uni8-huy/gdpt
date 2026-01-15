import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { StudentForm } from "../student-form";
import { getStudent, getUnits } from "@/lib/actions/student-actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const student = await getStudent(id);
  return {
    title: student ? `${student.name} - Admin` : "Đoàn sinh - Admin",
  };
}

export default async function StudentDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [student, units] = await Promise.all([getStudent(id), getUnits()]);

  if (!student) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <StudentForm student={student} units={units} locale={locale} />
    </div>
  );
}

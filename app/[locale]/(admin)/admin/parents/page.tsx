import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getParents,
  getStudentsWithParents,
} from "@/lib/actions/parent-student-actions";
import { ParentStudentManager } from "@/components/admin/parent-student-manager";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ParentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin.parents");
  const [parents, students] = await Promise.all([
    getParents(),
    getStudentsWithParents(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <ParentStudentManager parents={parents} students={students} />
    </div>
  );
}

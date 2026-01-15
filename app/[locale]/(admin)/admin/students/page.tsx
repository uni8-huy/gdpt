import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getStudents } from "@/lib/actions/student-actions";
import { StudentsDataTable } from "./students-data-table";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "student" });
  return {
    title: `${t("title")} - Admin`,
  };
}

export default async function StudentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("student");
  const common = await getTranslations("common");
  const status = await getTranslations("status");

  const students = await getStudents();

  const translations = {
    name: t("name"),
    dharmaName: t("dharmaName"),
    dateOfBirth: t("dateOfBirth"),
    gender: t("gender"),
    unit: t("unit"),
    class: t("class"),
    status: t("status"),
    male: common("male"),
    female: common("female"),
    active: status("activeStudent"),
    inactive: status("inactiveStudent"),
    addNew: common("add"),
    searchPlaceholder: common("searchPlaceholder"),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button asChild>
          <Link href="/admin/students/new">
            <Plus className="mr-2 h-4 w-4" />
            {translations.addNew}
          </Link>
        </Button>
      </div>
      <StudentsDataTable
        data={students}
        translations={translations}
        locale={locale}
      />
    </div>
  );
}
